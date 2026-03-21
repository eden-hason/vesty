import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const REC_LABELS: Record<string, { label: string; score: number }> = {
  strongBuy:  { label: 'קנייה חזקה', score: 5 },
  buy:        { label: 'קנייה',      score: 4 },
  hold:       { label: 'החזקה',     score: 3 },
  sell:       { label: 'מכירה',     score: 2 },
  strongSell: { label: 'מכירה חזקה', score: 1 },
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')?.toUpperCase()
  if (!ticker) return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })

  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,financialData`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return NextResponse.json({ price: null, recommendation: null })

    const data = await res.json()
    const priceModule = data?.quoteSummary?.result?.[0]?.price
    const financialData = data?.quoteSummary?.result?.[0]?.financialData

    const price: number | null = priceModule?.regularMarketPrice?.raw ?? null
    const recKey: string | undefined = financialData?.recommendationKey
    const recommendation = recKey && REC_LABELS[recKey] ? REC_LABELS[recKey] : null

    return NextResponse.json({ price, recommendation })
  } catch {
    return NextResponse.json({ price: null, recommendation: null })
  }
}
