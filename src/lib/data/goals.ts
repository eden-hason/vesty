import { createClient } from '@/lib/supabase/server'
import type { InvestmentGoal } from '@/lib/types'

export async function getGoals(): Promise<InvestmentGoal[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('investment_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}
