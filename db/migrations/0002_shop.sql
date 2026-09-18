-- MathSesh shop schema — Neon Postgres + Neon Data API
--
-- Ported from supabase-shop-migration.sql, plus three functions
-- (purchase_item_atomic, reset_kid_progress, current_user_role in
-- 0001_core_schema.sql) that were applied directly to the live Supabase DB
-- and never committed to the repo — recovered from a live dump and
-- reconciled here. See db/migrations/README.md for what changed in that
-- reconciliation, including some additional security hardening beyond the
-- two originally approved fixes.
--
-- BUGFIX (approved): owned_items' primary key changes from (user_id, item_id)
-- to (user_id, category, item_id). src/utils/shopCatalog.js reuses item ids
-- across categories — 'default' is both a board and a character id, 'gold'
-- is both a board and a trucks id — so under the old PK, owning one silently
-- blocked ever owning (or seeding) the other. useShop.isOwned() already
-- matches on (item_id, category) together (src/hooks/useShop.js:17), so this
-- requires no client change.

-- ============================================================================
-- kid_profile: shop columns
-- ============================================================================

alter table public.kid_profile
  add column if not exists coins int not null default 0,
  add column if not exists equipped_board text not null default 'default',
  add column if not exists equipped_wheels text not null default 'classic',
  add column if not exists equipped_trucks text not null default 'steel',
  add column if not exists equipped_character text not null default 'default';

alter table public.kid_profile
  add constraint kid_profile_coins_non_negative check (coins >= 0);

-- ============================================================================
-- owned_items
-- ============================================================================

create table if not exists public.owned_items (
  user_id uuid references public.profiles on delete cascade,
  item_id text not null,
  category text not null,
  purchased_at timestamptz default now(),
  primary key (user_id, category, item_id)   -- BUGFIX: was (user_id, item_id)
);

alter table public.owned_items enable row level security;

create policy "kid rw owned" on public.owned_items for all
  using (auth.user_id()::uuid = user_id);
create policy "parent reads owned" on public.owned_items for select
  using (public.current_user_role() = 'parent');

grant select, insert, update, delete on public.owned_items to authenticated;

-- Seed starter items for any kid rows that don't have them yet (idempotent —
-- safe to re-run). Run again after seeding new kid_profile rows in Phase 2.
insert into public.owned_items (user_id, item_id, category)
select user_id, 'default',  'board'     from public.kid_profile
union all
select user_id, 'classic',  'wheels'    from public.kid_profile
union all
select user_id, 'steel',    'trucks'    from public.kid_profile
union all
select user_id, 'default',  'character' from public.kid_profile
on conflict do nothing;

-- ============================================================================
-- purchase_item_atomic — src/hooks/useShop.js:26
--
-- Recovered verbatim from the live dump (db/dump/schema.sql, see
-- db/migrations/README.md) and translated for Neon:
-- auth.uid() -> auth.user_id()::uuid (uuid kept as-is — see the type note at
-- the top of 0001_core_schema.sql). Behavior preserved exactly, including one
-- gap worth knowing about: there is no "already owned" check — buying an
-- item you already own still deducts coins (the owned_items insert then
-- no-ops via ON CONFLICT), so nothing breaks but coins can be lost with no
-- effect. That's how it behaves live today; not one of the originally
-- approved fixes, so it's ported as-is rather than silently changed here.
--
-- The ownership check IS present live (unlike its siblings below) and is
-- kept: SECURITY INVOKER, not DEFINER — it relies on the grants + RLS
-- policies on kid_profile/owned_items above rather than bypassing them,
-- which is why the explicit auth.user_id() check matters here.
--
-- UPDATE ... WHERE coins >= p_price RETURNING is what makes this atomic:
-- the row lock is implicit in the UPDATE, so two concurrent purchases can't
-- both read the same starting balance — the exact race the original
-- non-atomic purchase_item() (commit bcb2886) was replaced to close.
--
-- CORRECTED against the real Neon project (not just local testing): the
-- live version is SECURITY INVOKER, so it calls auth.user_id() as the
-- "authenticated" role rather than as the function owner. Against a local
-- stub Postgres, granting authenticated USAGE on schema auth fixed this —
-- but on real Neon, the auth schema is platform-owned, and the connecting
-- role has no privilege to grant on it (confirmed live: the GRANT silently
-- no-ops with "WARNING: no privileges were granted for auth", not an
-- error). So this function is SECURITY DEFINER here, unlike its live
-- Supabase-derived counterpart and every other function's comment claiming
-- otherwise — it changes nothing about *authorization*, since the
-- function's own auth.user_id() = p_user_id check already gates access
-- regardless of whose privileges execute the body; it only changes whose
-- privileges are used to see the auth schema at all. Verified end-to-end
-- against the real Data API with a real signed-in user after this fix.
-- ============================================================================

create or replace function public.purchase_item_atomic(
  p_user_id uuid,
  p_item_id text,
  p_category text,
  p_price int
) returns json language plpgsql security definer as $$
declare
  v_coins int;
begin
  if auth.user_id()::uuid is distinct from p_user_id then
    return json_build_object('success', false, 'error', 'unauthorized');
  end if;

  update public.kid_profile
  set coins = coins - p_price
  where user_id = p_user_id and coins >= p_price
  returning coins into v_coins;

  if not found then
    return json_build_object('success', false, 'error', 'insufficient_coins');
  end if;

  insert into public.owned_items (user_id, item_id, category)
  values (p_user_id, p_item_id, p_category)
  on conflict do nothing;

  return json_build_object('success', true, 'coins_remaining', v_coins);
end;
$$;

-- ============================================================================
-- equip_item — currently unused by the client (useShop.equip() does a direct
-- kid_profile update instead; see project memory), kept for parity with the
-- original migration in case a future client change wants it.
-- ============================================================================

create or replace function public.equip_item(
  p_item_id text,
  p_category text
) returns void language plpgsql security definer as $$
begin
  if not exists (
    select 1 from public.owned_items
    where user_id = auth.user_id()::uuid and category = p_category and item_id = p_item_id
  ) then
    raise exception 'Item not owned';
  end if;

  update public.kid_profile set
    equipped_board     = case when p_category = 'board'     then p_item_id else equipped_board     end,
    equipped_wheels    = case when p_category = 'wheels'    then p_item_id else equipped_wheels    end,
    equipped_trucks    = case when p_category = 'trucks'    then p_item_id else equipped_trucks    end,
    equipped_character = case when p_category = 'character' then p_item_id else equipped_character end
  where user_id = auth.user_id()::uuid;
end;
$$;

-- ============================================================================
-- update_kid_after_session — src/hooks/useSessionData.js:47
--
-- Final 4-arg signature (coins + client-local session date). Recovered from
-- the live dump; the dump actually has three overloads of this function
-- (2-arg, 3-arg, 4-arg) left behind by successive CREATE OR REPLACE calls
-- with different signatures over time — each is a distinct overload in
-- Postgres, not a replacement, so the old ones never got cleaned up. Only
-- this 4-arg one is recreated here since it's the only one any client code
-- calls (src/hooks/useSessionData.js).
--
-- SECURITY HARDENING (found during reconciliation, not originally
-- approved): live is SECURITY DEFINER with no check that p_user_id is the
-- caller's own id — unlike purchase_item_atomic, which guards this exact
-- pattern already. Any signed-in kid could otherwise credit or debit a
-- sibling's XP/coins/streak by calling this directly with a different id.
-- Added the same guard purchase_item_atomic already uses.
-- ============================================================================

create or replace function public.update_kid_after_session(
  p_user_id uuid,
  p_xp_earned int,
  p_coins_earned int default 0,
  p_session_date date default current_date
) returns void language plpgsql security definer as $$
declare
  v_total_xp int;
  v_new_level int;
begin
  if auth.user_id()::uuid is distinct from p_user_id then
    raise exception 'unauthorized';
  end if;

  update public.kid_profile set
    total_xp = total_xp + p_xp_earned,
    coins = coins + p_coins_earned,
    last_session_date = p_session_date,
    current_streak_days = case
      when last_session_date = p_session_date     then current_streak_days
      when last_session_date = p_session_date - 1 then current_streak_days + 1
      else 1
    end
  where user_id = p_user_id
  returning total_xp into v_total_xp;

  v_new_level := case
    when v_total_xp >= 8000 then 8
    when v_total_xp >= 5500 then 7
    when v_total_xp >= 3500 then 6
    when v_total_xp >= 2000 then 5
    when v_total_xp >= 1000 then 4
    when v_total_xp >= 500  then 3
    when v_total_xp >= 200  then 2
    else 1
  end;

  update public.kid_profile set current_level = v_new_level where user_id = p_user_id;
end;
$$;

-- ============================================================================
-- reset_kid_progress — src/pages/ParentDashboard.jsx:61
-- Recovered verbatim from the live dump (matches the recorded §7 of the old
-- supabase-shop-migration.sql exactly) and translated for Neon.
--
-- SECURITY HARDENING (found during reconciliation, not originally
-- approved): live has no role check — it resets a *different* user's (the
-- kid's) progress by design, so the purchase_item_atomic-style "is this
-- your own id" guard doesn't apply, but nothing stood in for it either. Any
-- signed-in kid could wipe any other account's progress, including a
-- sibling's or the parent's. Added a parent-only guard; the app's only
-- caller is the parent dashboard, so this changes nothing for it.
-- ============================================================================

create or replace function public.reset_kid_progress(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  if public.current_user_role() <> 'parent' then
    raise exception 'unauthorized';
  end if;

  update public.kid_profile set
    total_xp = 0,
    current_level = 1,
    current_streak_days = 0,
    last_session_date = null,
    coins = 0,
    equipped_board = 'default',
    equipped_wheels = 'classic',
    equipped_trucks = 'steel',
    equipped_character = 'default'
  where user_id = p_user_id;

  delete from public.sessions where user_id = p_user_id;
  delete from public.question_results where user_id = p_user_id;
  delete from public.owned_items where user_id = p_user_id;

  insert into public.owned_items (user_id, item_id, category) values
    (p_user_id, 'default', 'board'),
    (p_user_id, 'classic', 'wheels'),
    (p_user_id, 'steel',   'trucks'),
    (p_user_id, 'default', 'character');
end;
$$;

-- ============================================================================
-- Grants
-- ============================================================================

grant execute on function public.purchase_item_atomic(uuid, text, text, int) to authenticated;
grant execute on function public.equip_item(text, text) to authenticated;
grant execute on function public.update_kid_after_session(uuid, int, int, date) to authenticated;
grant execute on function public.reset_kid_progress(uuid) to authenticated;
