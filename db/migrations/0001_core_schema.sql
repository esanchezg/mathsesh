-- MathSesh core schema — Neon Postgres + Neon Data API
--
-- Ported from the original supabase-schema.sql (Supabase Postgres) with the
-- following changes for Neon:
--   - auth.uid() -> auth.user_id()::uuid. Neon's auth.user_id() extracts the
--     JWT `sub` claim and returns text (JWT claims are always strings), but
--     neon_auth."user".id — and therefore every user_id/profiles.id column
--     here, to keep a real FK — is uuid, confirmed against the live Neon
--     project. Every comparison against auth.user_id() casts it to match.
--   - profiles.id FK's neon_auth."user" instead of auth.users (also
--     confirmed live: the table is neon_auth."user", quoted because "user"
--     is a reserved word — not neon_auth.users_sync, which some Neon docs
--     describe for a different setup).
--   - Dropped the handle_new_user() trigger on auth.users: Neon Auth has no
--     equivalent hook. With four fixed family accounts, profiles/kid_profile
--     rows are seeded explicitly instead (db/seed/seed_accounts.sql, Phase 2).
--   - "parent reads X" policies now go through current_user_role() instead of
--     a self-referential EXISTS on profiles — the live Supabase DB was already
--     patched this way to avoid RLS recursion (see project memory); the
--     original supabase-schema.sql predates that fix and is stale on this point.
--   - get_all_weak_facts() now returns user_id (BUGFIX: ParentDashboard.jsx
--     filters `f.user_id === selectedId` against a result set that never had
--     that column, so the parent dashboard's weak-facts panel has always been
--     empty — see src/pages/ParentDashboard.jsx:52).
--   - Explicit GRANTs added throughout; Supabase gives these away by default,
--     Neon's Data API does not.
--
-- No client change needed for the uuid choice: user.id from Neon Auth (via
-- SupabaseAuthAdapter) is already a uuid string — the app always passed it
-- as such, matching the original Supabase schema's uuid columns.

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references neon_auth."user" on delete cascade,
  role text not null check (role in ('kid', 'parent')),
  username text
);

create table if not exists public.kid_profile (
  user_id uuid primary key references public.profiles on delete cascade,
  total_xp int not null default 0,
  current_level int not null default 1,
  current_streak_days int not null default 0,
  last_session_date date,
  unlocked_decks text[] not null default array['default']
);

create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  operation text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  questions_answered int not null default 0,
  correct int not null default 0,
  xp_earned int not null default 0
);

create table if not exists public.question_results (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  operation text not null,
  operand_a int not null,
  operand_b int not null,
  correct boolean not null,
  response_time_ms int not null,
  answered_at timestamptz not null
);

-- ============================================================================
-- current_user_role() — SECURITY DEFINER lookup, used by every "parent reads
-- ..." RLS policy below. Bypasses RLS on profiles internally so it can't
-- recurse, unlike a plain EXISTS subquery against profiles from a profiles
-- policy.
-- ============================================================================

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.user_id()::uuid
$$;

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.kid_profile enable row level security;
alter table public.sessions enable row level security;
alter table public.question_results enable row level security;

create policy "own profile" on public.profiles for select
  using (auth.user_id()::uuid = id);
create policy "parent reads profiles" on public.profiles for select
  using (public.current_user_role() = 'parent');

create policy "kid reads own" on public.kid_profile for select
  using (auth.user_id()::uuid = user_id);
create policy "kid writes own" on public.kid_profile for all
  using (auth.user_id()::uuid = user_id);
create policy "parent reads kid_profile" on public.kid_profile for select
  using (public.current_user_role() = 'parent');

create policy "kid session rw" on public.sessions for all
  using (auth.user_id()::uuid = user_id);
create policy "parent reads sessions" on public.sessions for select
  using (public.current_user_role() = 'parent');

create policy "kid qr rw" on public.question_results for all
  using (auth.user_id()::uuid = user_id);
create policy "parent reads qr" on public.question_results for select
  using (public.current_user_role() = 'parent');

-- ============================================================================
-- RPC: weak facts for kid (own data) — src/hooks/useSessionData.js
-- ============================================================================

-- SECURITY HARDENING (not one of the two originally approved fixes — found
-- while reconciling against the recovered dump, see db/migrations/README.md):
-- the live version is SECURITY DEFINER and takes p_user_id from the caller
-- with no check that it's their own id, so any signed-in kid could read a
-- sibling's weak-facts data by passing a different p_user_id. Added a plain
-- ownership check; the app always passes its own user's id, so this changes
-- nothing for legitimate calls.
create or replace function public.get_weak_facts(p_user_id uuid, p_operation text)
returns table (
  operand_a int,
  operand_b int,
  operation text,
  accuracy numeric,
  avg_ms numeric,
  answer int
) language sql security definer as $$
  select
    operand_a,
    operand_b,
    operation,
    round(avg(case when correct then 1.0 else 0.0 end) * 100, 1) as accuracy,
    round(avg(response_time_ms), 0) as avg_ms,
    case
      when p_operation = 'multiply' then operand_a * operand_b
      when p_operation = 'divide'   then operand_a / operand_b
      when p_operation = 'add'      then operand_a + operand_b
      else operand_a - operand_b
    end as answer
  from public.question_results
  where user_id = p_user_id
    and user_id = auth.user_id()::uuid   -- ownership guard, see comment above
    and operation = p_operation
  group by operand_a, operand_b, operation
  having
    count(*) >= 5
    and (
      avg(case when correct then 1.0 else 0.0 end) < 0.70
      or avg(response_time_ms) > 6000
    )
$$;

-- ============================================================================
-- RPC: all weak facts for parent view — src/pages/ParentDashboard.jsx
--
-- BUGFIX (approved): added user_id to both the return type and the GROUP BY
-- so the client's `.filter(f => f.user_id === selectedId)` actually has
-- something to filter on. The live function has never returned this column,
-- so the parent dashboard's weak-facts panel has always rendered empty.
--
-- SECURITY HARDENING (found during reconciliation, not originally approved):
-- the live function has no role check at all, despite the name and its only
-- caller both implying parent-only — any signed-in kid could call it
-- directly and see every sibling's weak-facts data. Added a role guard that
-- fails closed to an empty result rather than raising, consistent with
-- get_weak_facts above.
-- ============================================================================

create or replace function public.get_all_weak_facts()
returns table (
  user_id uuid,
  operand_a int,
  operand_b int,
  operation text,
  accuracy numeric,
  avg_ms numeric
) language sql security definer as $$
  select
    user_id,
    operand_a,
    operand_b,
    operation,
    round(avg(case when correct then 1.0 else 0.0 end) * 100, 1) as accuracy,
    round(avg(response_time_ms), 0) as avg_ms
  from public.question_results
  where public.current_user_role() = 'parent'
  group by user_id, operand_a, operand_b, operation
  having
    count(*) >= 5
    and (
      avg(case when correct then 1.0 else 0.0 end) < 0.70
      or avg(response_time_ms) > 6000
    )
$$;

-- ============================================================================
-- Grants — the Neon Data API (PostgREST) will not expose a table or function
-- without these.
-- ============================================================================

grant usage on schema public to authenticated, anonymous;

grant select, insert, update, delete on public.profiles, public.kid_profile,
  public.sessions, public.question_results to authenticated;
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.get_weak_facts(uuid, text) to authenticated;
grant execute on function public.get_all_weak_facts() to authenticated;
