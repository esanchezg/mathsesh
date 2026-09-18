import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function resolveSession(session) {
    if (!session?.user) {
      setUser(null)
      setRole(null)
      return
    }

    setUser(session.user)

    // Neon Auth's JWT `role` claim is reserved for Postgres role switching
    // (authenticated/anonymous/custom Postgres roles via the Data API) and
    // can't carry app-level values like 'parent'/'kid' the way Supabase's
    // app_metadata.role did — always resolve role from the profiles table.
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    setRole(data?.role ?? null)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await resolveSession(session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
