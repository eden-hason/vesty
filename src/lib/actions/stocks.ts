'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Stock } from '@/lib/types'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

async function resolveTargetUserId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, childId?: string) {
  if (!childId) return userId
  // Verify parent-child relationship
  const { data: child } = await supabase
    .from('profiles')
    .select('id, parent_id')
    .eq('id', childId)
    .eq('parent_id', userId)
    .single()
  if (!child) throw new Error('Unauthorized: not your child')
  return childId
}

export async function addStock(formData: {
  ticker: string
  company_name: string
  purchase_price: number
  quantity: number
  date_purchased: string
  emoji?: string
  usd_ils_rate?: number
  childId?: string
}) {
  const { supabase, user } = await getAuthedUser()
  const { childId, ...stockData } = formData
  const targetUserId = await resolveTargetUserId(supabase, user.id, childId)

  const { error } = await supabase.from('stocks').insert({
    ...stockData,
    user_id: targetUserId,
  })

  if (error) throw error
  revalidatePath('/dashboard')
}

export async function updateStock(id: string, data: Partial<Omit<Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  const { supabase, user } = await getAuthedUser()

  const { error } = await supabase
    .from('stocks')
    .update(data)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard')
}

export async function deleteStock(id: string) {
  const { supabase, user } = await getAuthedUser()

  const { error } = await supabase
    .from('stocks')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard')
}
