import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useShop() {
  const { user } = useAuth()
  const [owned, setOwned] = useState(null) // null = loading
  const [error, setError] = useState(null)

  async function fetchOwned() {
    const { data, error } = await supabase
      .from('owned_items')
      .select('item_id, category')
      .eq('user_id', user.id)
    if (error) setError(error)
    setOwned(data ?? [])
  }

  useEffect(() => { fetchOwned() }, [user])

  function isOwned(itemId, category) {
    return owned?.some(o => o.item_id === itemId && o.category === category) ?? false
  }

  async function purchase(item) {
    const { data: profile, error: profileError } = await supabase
      .from('kid_profile')
      .select('coins')
      .eq('user_id', user.id)
      .single()
    if (profileError) return { success: false, error: 'rpc_error', detail: profileError.message }

    if (profile.coins < item.price)
      return { success: false, error: 'insufficient_coins' }

    const { error: updateError } = await supabase
      .from('kid_profile')
      .update({ coins: profile.coins - item.price })
      .eq('user_id', user.id)
    if (updateError) return { success: false, error: 'rpc_error', detail: updateError.message }

    const { error: insertError } = await supabase
      .from('owned_items')
      .insert({ user_id: user.id, item_id: item.id, category: item.category })
    if (insertError) {
      await supabase.from('kid_profile').update({ coins: profile.coins }).eq('user_id', user.id)
      if (insertError.code === '23505') {
        return { success: false, error: 'already_owned' }
      }
      return { success: false, error: 'rpc_error', detail: insertError.message }
    }

    setOwned(prev => [...(prev ?? []), { item_id: item.id, category: item.category }])
    return { success: true, coins_remaining: profile.coins - item.price }
  }

  async function equip(item) {
    const equipCol = {
      board: 'equipped_board',
      wheels: 'equipped_wheels',
      trucks: 'equipped_trucks',
      character: 'equipped_character',
    }[item.category]
    if (equipCol) {
      await supabase
        .from('kid_profile')
        .update({ [equipCol]: item.id })
        .eq('user_id', user.id)
    }
  }

  return { owned, isOwned, purchase, equip, loading: owned === null, error }
}
