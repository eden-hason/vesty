'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

async function resolveTargetUserId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, childId?: string) {
  if (!childId) return userId
  const { data: child } = await supabase
    .from('profiles')
    .select('id, parent_id')
    .eq('id', childId)
    .eq('parent_id', userId)
    .single()
  if (!child) throw new Error('Unauthorized: not your child')
  return childId
}

export async function addGoal(data: {
  name: string
  target_amount: number
  icon?: string
  color?: string
  childId?: string
}) {
  const { supabase, user } = await getAuthedUser()
  const { childId, ...goalData } = data
  const targetUserId = await resolveTargetUserId(supabase, user.id, childId)

  const { error } = await supabase.from('investment_goals').insert({
    ...goalData,
    user_id: targetUserId,
  })
  if (error) throw error
  revalidatePath('/dashboard')
}

export async function deleteGoal(id: string) {
  const { supabase, user } = await getAuthedUser()

  const { data: goal } = await supabase
    .from('investment_goals')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!goal) throw new Error('Goal not found')

  if (goal.user_id !== user.id) {
    const { data: child } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', goal.user_id)
      .eq('parent_id', user.id)
      .single()
    if (!child) throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('investment_goals')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard')
}
