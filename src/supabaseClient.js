import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js'

// Neon's Data API is a PostgREST-compatible reimplementation, and
// SupabaseAuthAdapter shims Neon Auth to the same method shapes as
// @supabase/supabase-js (signInWithPassword, signOut, onAuthStateChange,
// getSession). Exporting this as `supabase` keeps every other file in the
// app — the RPC calls, the .from() queries, AuthContext — unchanged.
const supabaseUrl = import.meta.env.VITE_NEON_AUTH_URL
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL

export const supabase = createClient({
  auth: { adapter: SupabaseAuthAdapter(), url: supabaseUrl },
  dataApi: { url: dataApiUrl },
})
