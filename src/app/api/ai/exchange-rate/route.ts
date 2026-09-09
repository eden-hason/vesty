import { NextResponse } from 'next/server'
import { USD_ILS_FALLBACK_RATE, isValidUsdIlsRate } from '@/lib/currency'

// Frankfurter serves ECB reference rates, which are published once per business
// day. An hour of caching sits well inside the data's own resolution and keeps
// a busy dashboard from being rate-limited into the fallback.
const LATEST_REVALIDATE_SECONDS = 3600
// A past day's reference rate never changes, so it can be held much longer.
const HISTORICAL_REVALIDATE_SECONDS = 60 * 60 * 24 * 7

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Resolves the Frankfurter path for the requested day. Dates that are missing,
 * malformed, or in the future fall back to the latest rate rather than being
 * rejected — the caller only ever wants a usable rate.
 */
function resolvePath(date: string | null): string {
  if (!date || !ISO_DATE.test(date)) return 'latest'
  const requested = Date.parse(`${date}T00:00:00Z`)
  if (Number.isNaN(requested)) return 'latest'
  if (requested > Date.now()) return 'latest'
  return date
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // Optional YYYY-MM-DD: the rate on a purchase date, not necessarily today's.
  const path = resolvePath(searchParams.get('date'))
  const isHistorical = path !== 'latest'

  try {
    const res = await fetch(`https://api.frankfurter.app/${path}?from=USD&to=ILS`, {
      next: {
        revalidate: isHistorical ? HISTORICAL_REVALIDATE_SECONDS : LATEST_REVALIDATE_SECONDS,
      },
    })
    if (!res.ok) throw new Error(`exchange rate provider responded ${res.status}`)

    const data = await res.json()
    const rate = data?.rates?.ILS
    if (!isValidUsdIlsRate(rate)) throw new Error(`implausible USD/ILS rate: ${rate}`)

    // Frankfurter snaps a non-trading day back to the previous business day and
    // reports which one it used, so pass that through rather than the request.
    return NextResponse.json({ rate, stale: false, date: data?.date ?? null })
  } catch {
    // The fallback is flagged so callers can tell a hardcoded number from a
    // live quote instead of presenting both as equally trustworthy.
    return NextResponse.json({ rate: USD_ILS_FALLBACK_RATE, stale: true, date: null })
  }
}
