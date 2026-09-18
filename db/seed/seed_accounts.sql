-- Seed the four family accounts' app-level rows (profiles, kid_profile,
-- owned_items) after creating them in Neon Auth (Managed Better Auth).
--
-- There's no signup trigger on Neon (see ../migrations/README.md), so unlike
-- the old Supabase handle_new_user() trigger, this is manual and runs once
-- per account after the account exists in Neon Auth and you have its real id.
--
-- 1. Create each account via the auth API (the Neon Console has no manual
--    "add user" UI at the time of writing). This requires an Origin header
--    matching a trusted origin (see ../migrations/README.md's "Trusted
--    origins" note — localhost is trusted by default, mathsesh.xyz was
--    added manually):
--      curl -X POST "$VITE_NEON_AUTH_URL/sign-up/email" \
--        -H "Content-Type: application/json" -H "Origin: https://mathsesh.xyz" \
--        -d '{"email":"newkid@mathsesh.xyz","password":"...","name":"NewKid"}'
--    The response's user.id is the real id for step 2.
-- 2. Replace the <...-id> placeholders below with those ids and run this file.
-- 3. Set the role in `profiles` to 'kid' or 'parent' as appropriate — Neon
--    Auth's own `role` claim is always 'authenticated', unrelated to this.

insert into public.profiles (id, role, username) values
  ('<parent-user-id>', 'parent', 'Parent'),
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

-- To restore historical data for a remapped account (uuid changed when
-- moving off Supabase), see db/migrations/README.md and the remap approach
-- used during the Neon migration: stage the old dump's rows in a throwaway
-- schema, join an (old_id -> new_id) mapping table on email, then INSERT/
-- UPDATE into public.* from there. Not scripted here since it was a one-time
-- migration step, not a repeatable seed operation.
