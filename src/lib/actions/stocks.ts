'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Stock } from '@/lib/types'

export async function addStock(formData: {
  ticker: string
  company_name: string
  purchase_price: number
  quantity: number
  date_purchased: string
  emoji?: string
  usd_ils_rate?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('stocks').insert({
    ...formData,
    user_id: user.id,
  })

  if (error) throw error
  revalidatePath('/dashboard')
}

export async function updateStock(id: string, data: Partial<Omit<Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('stocks')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard')
}

export async function deleteStock(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('stocks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard')
}
