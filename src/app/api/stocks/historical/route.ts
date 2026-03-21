import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')?.toUpperCase()
  const date = searchParams.get('date') // YYYY-MM-DD

  if (!ticker || !date) {
    return NextResponse.json({ error: 'Missing ticker or date' }, { status: 400 })
  }

  try {
    const target = new Date(date)
    // Look back up to 7 days to find the nearest trading day
    const from = new Date(target)
    from.setDate(from.getDate() - 7)
    const to = new Date(target)
    to.setDate(to.getDate() + 1)

    const period1 = Math.floor(from.getTime() / 1000)
    const period2 = Math.floor(to.getTime() / 1000)

    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${period1}&period2=${period2}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return NextResponse.json({ price: null })

    const data = await res.json()
    const timestamps: number[] = data?.chart?.result?.[0]?.timestamp ?? []
    const closes: number[] = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? []

    if (!timestamps.length) return NextResponse.json({ price: null })

    const targetTime = target.getTime() / 1000
    // Find closest index on or before the target date
    let bestIdx = 0
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i] <= targetTime) bestIdx = i
    }

    const price = closes[bestIdx] ?? null
    return NextResponse.json({ price: price != null ? Math.round(price * 100) / 100 : null })
  } catch {
    return NextResponse.json({ price: null })
  }
}
