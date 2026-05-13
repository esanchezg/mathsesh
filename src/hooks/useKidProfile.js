import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useKidProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!user) return
    const { data } = await supabase
      .from('kid_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setProfile(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  return { profile, loading, refresh: load }
}
