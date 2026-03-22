import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStocks } from '@/lib/data/stocks'
import { getGoals } from '@/lib/data/goals'
import { getProfile, getChildren } from '@/lib/data/profiles'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let profile = await getProfile()
  if (!profile) {
    // Backfill profile for existing users who signed up before the profiles table
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      role: 'parent',
      display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    })
    if (error) redirect('/login')
    profile = await getProfile()
    if (!profile) redirect('/login')
  }

  const params = await searchParams

  if (profile.role === 'parent') {
    const children = await getChildren()
    const selectedChildId = params.child ?? children[0]?.id ?? null
    const [stocks, goals] = selectedChildId
      ? await Promise.all([getStocks(selectedChildId), getGoals(selectedChildId)])
      : [[], []]

    return (
      <DashboardClient
        stocks={stocks}
        goals={goals}
        profile={profile}
        children={children}
        selectedChildId={selectedChildId}
      />
    )
  }

  // Child view — show own portfolio
  const [stocks, goals] = await Promise.all([getStocks(), getGoals()])

  return (
    <DashboardClient
      stocks={stocks}
      goals={goals}
      profile={profile}
      children={[]}
      selectedChildId={null}
    />
  )
}
