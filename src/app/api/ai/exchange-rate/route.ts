import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=ILS')
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    const rate = data?.rates?.ILS
    if (!rate) throw new Error('no rate')
    return NextResponse.json({ rate })
  } catch {
    // Fallback rate if the free API is down
    return NextResponse.json({ rate: 3.7 })
  }
}
