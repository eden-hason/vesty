import { NextResponse } from 'next/server'

const EMOJI_MAP: Record<string, string> = {
  AAPL: '🍎', TSLA: '⚡', MSFT: '💻', GOOGL: '🔍', GOOG: '🔍',
  AMZN: '📦', META: '👤', NFLX: '🎬', NVDA: '🎮', DIS: '🏰',
  AMD: '🔴', INTC: '💾', SPOT: '🎵', UBER: '🚗', LYFT: '🚙',
  SBUX: '☕', NKE: '👟', MCD: '🍔', KO: '🥤', PEP: '🥤',
  BABA: '🛍️', TSM: '🇹🇼', ASML: '🔬', V: '💳', MA: '💳',
  JPM: '🏦', GS: '💰', BAC: '🏦', WMT: '🛒', TGT: '🎯',
  COST: '🏪', HD: '🔨', PFE: '💊', JNJ: '🏥', MRNA: '🧬',
  XOM: '⛽', CVX: '🛢️', T: '📡', VZ: '📶', BA: '✈️',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 1) return NextResponse.json({ results: [] })

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=6&newsCount=0&enableFuzzyQuery=false`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()
    const quotes = (data?.finance?.result?.[0]?.quotes ?? data?.quotes ?? [])
      .filter((r: any) => r.quoteType === 'EQUITY' && r.symbol)
      .slice(0, 6)
      .map((r: any) => ({
        ticker: r.symbol as string,
        company_name: (r.longname || r.shortname || r.symbol) as string,
        emoji: EMOJI_MAP[r.symbol] ?? '📈',
      }))

    return NextResponse.json({ results: quotes })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
