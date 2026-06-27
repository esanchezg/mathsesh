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
    const { data, error } = await supabase.rpc('purchase_item_atomic', {
      p_user_id: user.id,
      p_item_id: item.id,
      p_category: item.category,
      p_price: item.price,
    })
    if (error) return { success: false, error: 'rpc_error', detail: error.message }
    if (!data?.success) return { success: false, error: data?.error ?? 'rpc_error' }
    setOwned(prev => [...(prev ?? []), { item_id: item.id, category: item.category }])
    return { success: true, coins_remaining: data.coins_remaining }
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
