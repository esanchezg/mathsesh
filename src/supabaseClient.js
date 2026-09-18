import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js'

// Neon's Data API is a PostgREST-compatible reimplementation, and
// SupabaseAuthAdapter shims Neon Auth to the same method shapes as
// @supabase/supabase-js (signInWithPassword, signOut, onAuthStateChange,
// getSession). Exporting this as `supabase` keeps every other file in the
// app — the RPC calls, the .from() queries, AuthContext — unchanged.
//
// createClient() derives both the auth and Data API URLs from one base
// Neon URL (https://ep-xxx.<region>.aws.neon.tech/<dbname>, no "neonauth."/
// "apirest." subdomain and no /auth or /rest/v1 suffix — those are added by
// the derivation itself). Verified this derivation matches Neon's real
// provisioned endpoints for this project via defaultDeriveNeonUrls() before
// relying on it. VITE_NEON_URL is provisioned by `vercel integration add
// neon`'s PGHOST (minus the "-pooler" suffix) + PGDATABASE.
const neonUrl = import.meta.env.VITE_NEON_URL

export const supabase = createClient(neonUrl, {
  auth: { adapter: SupabaseAuthAdapter() },
})
