import { createClient } from '@/lib/supabase/server'
import type { Stock } from '@/lib/types'

export async function getStocks(userId?: string): Promise<Stock[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const targetId = userId ?? user.id

  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('user_id', targetId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
