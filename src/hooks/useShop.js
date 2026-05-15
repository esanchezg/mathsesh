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

  function isOwned(itemId) {
    return owned?.some(o => o.item_id === itemId) ?? false
  }

  async function purchase(item) {
    const result = await supabase.rpc('purchase_item', {
      p_item_id: item.id,
      p_category: item.category,
      p_price: item.price,
    })
    if (result.data?.success) {
      setOwned(prev => [...(prev ?? []), { item_id: item.id, category: item.category }])
    }
    return result.data
  }

  async function equip(item) {
    await supabase.rpc('equip_item', {
      p_item_id: item.id,
      p_category: item.category,
    })
  }

  return { owned, isOwned, purchase, equip, loading: owned === null, error }
}
