import { createClient } from '@/lib/supabase/server'
import type { InvestmentGoal } from '@/lib/types'

export async function getGoals(userId?: string): Promise<InvestmentGoal[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const targetId = userId ?? user.id

  const { data, error } = await supabase
    .from('investment_goals')
    .select('*')
    .eq('user_id', targetId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}
