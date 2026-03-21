import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStocks } from '@/lib/data/stocks'
import { getGoals } from '@/lib/data/goals'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [stocks, goals] = await Promise.all([getStocks(), getGoals()])

  return <DashboardClient stocks={stocks} goals={goals} />
}
