# Migrations

Ordered, reproducible schema for the Neon-backed MathSesh database. Apply in
filename order:

```bash
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"   # pg_dump/psql, keg-only
psql "$NEON_DATABASE_URL" -f 0001_core_schema.sql
psql "$NEON_DATABASE_URL" -f 0002_shop.sql
```

These replace the old root-level `supabase-schema.sql` and
`supabase-shop-migration.sql`, which were incomplete: three functions called
by the client (`current_user_role`, `reset_kid_progress`,
`purchase_item_atomic`) were applied directly to the live Supabase database
and never committed anywhere.

## Reconciled against the recovered dump (2026-09-18)

The Supabase project resumed and `db/dump/schema.sql` was captured
(`db/dump/run_dump.sh` — not committed; it contains real data including
password hashes, see below). `purchase_item_atomic`, `reset_kid_progress`,
`current_user_role`, `get_weak_facts`, and `get_all_weak_facts` in this
directory's migrations have all been reconciled against the live function
bodies that dump captured — they were initially reconstructed from client
call sites before the dump existed, and needed corrections:

- `purchase_item_atomic` — reconstruction had used `SELECT ... FOR UPDATE`
  and an `already_owned` check; the live version instead used a single
  `UPDATE ... WHERE coins >= p_price RETURNING` (equally atomic, simpler) and
  has **no** `already_owned` check at all. Rewritten to match the live logic
  exactly. That missing check is a real, still-live gap — see below — kept
  as-is here rather than silently fixed, since it wasn't part of the two
  originally approved fixes.
- `reset_kid_progress` — the reconstruction (copied from the old
  `supabase-shop-migration.sql` §7) matched the live body exactly, no change
  needed to its logic.
- `current_user_role` — matched, no change needed.
- `owned_items` primary key — turned out to **already be fixed live**
  (`(user_id, item_id, category)`), just never reflected back into the
  committed SQL. This migration's `(user_id, category, item_id)` is the same
  constraint with columns reordered — no functional difference, nothing to
  change.
- `get_all_weak_facts()` missing `user_id` — confirmed **real and still
  live**; this bug is not hypothetical, the parent dashboard's weak-facts
  panel has been silently empty this whole time.

### Additional hardening applied (not in the original two approved fixes)

Reconciling surfaced a consistent pattern: several `SECURITY DEFINER`
functions take a client-supplied user id (or expose all kids' data) with no
check that the caller actually owns it or is the parent —
`update_kid_after_session`, `reset_kid_progress`, `get_weak_facts`, and
`get_all_weak_facts` all lacked this live (only `purchase_item_atomic` had
it). Added matching guards to each — purely additive, changes nothing for
the app's own call sites, since they always pass their own/authorized id.
Flagged here rather than done silently; not fixed live in Supabase, only in
these migrations for the new Neon database.

Still open, ported as-is rather than fixed (flag for a future pass if it
matters): `purchase_item_atomic` has no `already_owned` check, so buying an
already-owned item silently deducts coins for no effect (the `owned_items`
insert then no-ops via `ON CONFLICT DO NOTHING`).

## Phase 2 findings (applying this against the real Neon project, 2026-09-18)

Things discovered only by actually running this against the live project —
kept here since they're easy to lose track of otherwise:

- **`neon_auth."user".id` is `uuid`, not `text`.** `auth.user_id()` returns
  text (it's a raw JWT claim), but the FK target column is uuid, so every
  `user_id`/`profiles.id` column here is `uuid` and every comparison casts
  with `auth.user_id()::uuid`. This actually made things *more* faithful to
  the original Supabase schema, not less — `user.id` from the client was
  always a uuid string.
- **`purchase_item_atomic` had to become `SECURITY DEFINER`**, unlike its
  live Supabase-derived counterpart. On Neon the `auth` schema is
  platform-owned; the connecting role can't grant `authenticated` access to
  it (confirmed: the attempted `GRANT` silently no-ops with `WARNING: no
  privileges were granted for auth`, not an error), so a `SECURITY INVOKER`
  function calling `auth.user_id()` fails with `permission denied for
  schema auth` the moment anyone but the owner calls it. Every other
  function was already `SECURITY DEFINER` and unaffected.
- **The Data API's RLS machinery (`auth` schema, `authenticated`/
  `anonymous` roles) is not created just by installing the Vercel
  integration with `-m auth=true`.** It requires a separate step —
  Neon Console → your database → **Data API** → Enable, with **"Use Neon
  Auth"** checked (**"Grant public schema access"** left unchecked; this
  migration's own explicit grants cover what's needed). Confirmed via
  Neon's own example migration
  ([neon-data-api-neon-auth](https://github.com/neondatabase/neon-data-api-neon-auth))
  that developers are never meant to create `auth.user_id()` or the roles
  themselves — their absence really does mean Data API isn't enabled yet,
  not that a migration is missing something.
- **Trusted origins are not automatic.** New Neon Auth projects trust
  `localhost` only (`allow_localhost` in `neon_auth.project_config`).
  Production sign-in from `https://mathsesh.xyz` returned `403
  INVALID_ORIGIN` until `trusted_origins` was updated directly:
  ```sql
  update neon_auth.project_config set trusted_origins = '["https://mathsesh.xyz"]'::jsonb;
  ```
  Preview deployments (`https://mathsesh-*.vercel.app`) are **not** in that
  list and won't be able to sign in until added — there's no wildcard
  support confirmed, so each one needed would have to be appended
  individually, or this could be revisited if Preview auth becomes worth it.

## Neon-specific translation notes

- `auth.uid()` (Supabase, returns uuid) → `auth.user_id()` (Neon Auth, returns
  **text**). All `user_id` / `profiles.id` columns are `text`, not `uuid`.
- Role `anon` (Supabase) → `anonymous` (Neon Data API).
- No `auth.users` trigger equivalent — profiles/kid_profile rows for the four
  family accounts are seeded explicitly; see `../seed/seed_accounts.sql`
  (Phase 2, needs the real Neon Auth user ids, which don't exist until those
  accounts are created in the Neon dashboard).
- `profiles.id` / `*.user_id` should ultimately reference Neon Auth's user
  sync table as a foreign key. The exact table name
  (`neon_auth.users_sync` vs `neon_auth.user`) wasn't confirmed against a live
  Neon project during planning — check it once the Data API is provisioned in
  Phase 2, then add the FK before going to production. Omitted here rather
  than guessed.
