import { NextResponse } from 'next/server'
import { normalizeQuote } from '@/lib/currency'

export async function GET(request: Request) {
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://finance.yahoo.com',
        'Referer': 'https://finance.yahoo.com/',
      },
      next: { revalidate: 0 },
    })
    if (!res.ok) return NextResponse.json({ price: null, currency: null })

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    const timestamps: number[] = result?.timestamp ?? []
    const closes: number[] = result?.indicators?.quote?.[0]?.close ?? []

    if (!timestamps.length) return NextResponse.json({ price: null, currency: null })

    const targetTime = target.getTime() / 1000
    // Find closest index on or before the target date
    let bestIdx = 0
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i] <= targetTime) bestIdx = i
    }

    // Closes are quoted in the listing's own currency, so it is reported
    // alongside the price rather than being assumed to be USD.
    const { price, currency } = normalizeQuote(closes[bestIdx] ?? null, result?.meta?.currency ?? null)

    return NextResponse.json({
      price: price != null ? Math.round(price * 100) / 100 : null,
      currency,
    })
  } catch {
    return NextResponse.json({ price: null, currency: null })
  }
}
