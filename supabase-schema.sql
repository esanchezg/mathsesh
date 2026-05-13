-- Run this in the Supabase SQL editor

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('kid', 'parent')),
  username text
);

-- Kid profile (XP, level, streak, decks)
create table public.kid_profile (
  user_id uuid references public.profiles on delete cascade primary key,
  total_xp int not null default 0,
  current_level int not null default 1,
  current_streak_days int not null default 0,
  last_session_date date,
  unlocked_decks text[] not null default array['default']
);

-- Sessions
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  operation text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  questions_answered int not null default 0,
  correct int not null default 0,
  xp_earned int not null default 0
);

-- Question results
create table public.question_results (
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

-- Auto-create profile row when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, username)
  values (new.id, 'kid', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.kid_profile enable row level security;
alter table public.sessions enable row level security;
alter table public.question_results enable row level security;

-- Profiles: users read their own; parent reads all
create policy "own profile" on public.profiles for select using (auth.uid() = id);
create policy "parent reads profiles" on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));

-- kid_profile: kid reads/writes own; parent reads all
create policy "kid reads own" on public.kid_profile for select using (auth.uid() = user_id);
create policy "kid writes own" on public.kid_profile for all using (auth.uid() = user_id);
create policy "parent reads kid_profile" on public.kid_profile for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));

-- Sessions: kid reads/writes own; parent reads all
create policy "kid session rw" on public.sessions for all using (auth.uid() = user_id);
create policy "parent reads sessions" on public.sessions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));

-- Question results: same pattern
create policy "kid qr rw" on public.question_results for all using (auth.uid() = user_id);
create policy "parent reads qr" on public.question_results for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'parent'));

-- RPC: weak facts for kid (own data)
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
    and operation = p_operation
  group by operand_a, operand_b, operation
  having
    count(*) >= 5
    and (
      avg(case when correct then 1.0 else 0.0 end) < 0.70
      or avg(response_time_ms) > 6000
    )
$$;

-- RPC: all weak facts for parent view
create or replace function public.get_all_weak_facts()
returns table (
  operand_a int,
  operand_b int,
  operation text,
  accuracy numeric,
  avg_ms numeric
) language sql security definer as $$
  select
    operand_a,
    operand_b,
    operation,
    round(avg(case when correct then 1.0 else 0.0 end) * 100, 1) as accuracy,
    round(avg(response_time_ms), 0) as avg_ms
  from public.question_results
  group by operand_a, operand_b, operation
  having
    count(*) >= 5
    and (
      avg(case when correct then 1.0 else 0.0 end) < 0.70
      or avg(response_time_ms) > 6000
    )
$$;

-- Function to update XP + level + streak after a session
create or replace function public.update_kid_after_session(
  p_user_id uuid,
  p_xp_earned int
) returns void language plpgsql security definer as $$
declare
  v_total_xp int;
  v_new_level int;
begin
  update public.kid_profile
  set
    total_xp = total_xp + p_xp_earned,
    last_session_date = current_date,
    current_streak_days = case
      when last_session_date = current_date then current_streak_days
      when last_session_date = current_date - 1 then current_streak_days + 1
      else 1
    end
  where user_id = p_user_id
  returning total_xp into v_total_xp;

  -- Update level
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

  -- Update unlocked decks
  update public.kid_profile
  set
    current_level = v_new_level,
    unlocked_decks = array(
      select unnest(array['default','flames','galaxy','checker','neon','gold'])
      intersect
      select unnest(case
        when v_total_xp >= 5500 then array['default','flames','galaxy','checker','neon','gold']
        when v_total_xp >= 2000 then array['default','flames','galaxy','checker','neon']
        when v_total_xp >= 1000 then array['default','flames','galaxy','checker']
        when v_total_xp >= 500  then array['default','flames','galaxy']
        when v_total_xp >= 200  then array['default','flames']
        else array['default']
      end)
    )
  where user_id = p_user_id;
end;
$$;
