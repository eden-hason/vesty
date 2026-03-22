import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')?.toUpperCase()
  if (!ticker) return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })

  try {
    // Use v8 chart endpoint — more reliable than v10/quoteSummary for server-side requests
    const now = Math.floor(Date.now() / 1000)
    const yesterday = now - 86400
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${yesterday}&period2=${now}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
      },
      next: { revalidate: 0 },
    })
    if (!res.ok) return NextResponse.json({ price: null, recommendation: null })

    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    const price: number | null = meta?.regularMarketPrice ?? meta?.previousClose ?? null

    return NextResponse.json({ price, recommendation: null })
  } catch {
    return NextResponse.json({ price: null, recommendation: null })
  }
}
