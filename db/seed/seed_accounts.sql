-- Seed the four family accounts' app-level rows (profiles, kid_profile,
-- owned_items) after creating them as Neon Auth (Managed Better Auth) users.
--
-- There's no signup trigger on Neon (see ../migrations/README.md), so unlike
-- the old Supabase handle_new_user() trigger, this step is manual and must
-- run once per account, after the account exists in Neon Auth and you have
-- its real user id.
--
-- 1. Create each account in the Neon Auth dashboard / via the auth API:
--      parent@mathsesh.xyz, kid@mathsesh.xyz (Skater), sam@mathsesh.xyz (Sam),
--      evan@mathsesh.xyz (evan) — passwords do NOT carry over from Supabase
--      (different hashing algorithm), so set fresh ones.
-- 2. Copy each account's user id and replace the <...-id> placeholders below.
-- 3. Run this file.
-- 4. Re-run db/migrations/0002_shop.sql's starter-item INSERT (or just the
--    INSERT block below, which is the same one) to seed owned_items for the
--    new kid_profile rows.

insert into public.profiles (id, role, username) values
  ('<parent-user-id>', 'parent', 'parent@mathsesh.xyz'),
  ('<kid-user-id>',    'kid',    'Skater'),
  ('<sam-user-id>',    'kid',    'Sam'),
  ('<evan-user-id>',   'kid',    'evan')
on conflict (id) do nothing;

insert into public.kid_profile (user_id) values
  ('<kid-user-id>'),
  ('<sam-user-id>'),
  ('<evan-user-id>')
on conflict (user_id) do nothing;

insert into public.owned_items (user_id, item_id, category)
select user_id, 'default',  'board'     from public.kid_profile
union all
select user_id, 'classic',  'wheels'    from public.kid_profile
union all
select user_id, 'steel',    'trucks'    from public.kid_profile
union all
select user_id, 'default',  'character' from public.kid_profile
on conflict do nothing;

-- If Phase 0 produced a usable dump, restore each kid's real total_xp,
-- coins, streak, sessions, question_results and owned_items here instead of
-- leaving them at these zeroed defaults — see the migration plan's Phase 2
-- for the uuid -> Neon-id remapping this requires (join old auth.users on
-- email to get old_id -> new_id, then rewrite user_id in the dumped rows
-- before inserting).
