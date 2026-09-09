/**
 * Everything the app stores and computes is denominated in USD; ILS is a
 * presentation layer applied at the last moment with a single USD→ILS rate.
 * These helpers keep that boundary explicit so a price in some other currency
 * can never be multiplied by the ILS rate as if it were dollars.
 */

/** The only currency the portfolio maths is valid for. */
export const BASE_CURRENCY = 'USD'

/** Used only when the live rate cannot be fetched, and always flagged as such. */
export const USD_ILS_FALLBACK_RATE = 3.7

/**
 * A USD→ILS rate outside this band is a malformed payload rather than a real
 * move — the pair has stayed within roughly 2–5 for its entire modern history.
 * Rejecting it is safer than rendering a portfolio that is off by orders of
 * magnitude.
 */
export const MIN_USD_ILS_RATE = 1
export const MAX_USD_ILS_RATE = 10

export interface ExchangeRateResponse {
  rate: number
  /** True when `rate` is the hardcoded fallback, not a live quote. */
  stale: boolean
  /** Quote date reported by the provider, when known. */
  date: string | null
}

export function isValidUsdIlsRate(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_USD_ILS_RATE &&
    value <= MAX_USD_ILS_RATE
  )
}

/** Converts a USD amount to ILS, or returns null while the rate is unknown. */
export function usdToIls(usd: number, rate: number | null): number | null {
  if (!isValidUsdIlsRate(rate)) return null
  return usd * rate
}

/**
 * Some venues are quoted in a currency's minor unit — Yahoo reports GBp for
 * London pence, ILA for Tel Aviv agorot, ZAc for Johannesburg cents. Left
 * as-is these look like a hundredfold price. Keyed lowercase for case-safe
 * lookup, since the provider mixes cases (e.g. "GBp").
 */
const MINOR_UNITS: Record<string, { currency: string; perMajor: number }> = {
  gbp_minor: { currency: 'GBP', perMajor: 100 },
  gbx: { currency: 'GBP', perMajor: 100 },
  gbp: { currency: 'GBP', perMajor: 1 },
  ila: { currency: 'ILS', perMajor: 100 },
  zac: { currency: 'ZAR', perMajor: 100 },
}

export interface NormalizedQuote {
  price: number | null
  currency: string | null
}

/**
 * Normalises a provider quote to its major currency unit so that `price` and
 * `currency` always agree. Returns the currency uppercased for comparison
 * against {@link BASE_CURRENCY}.
 */
export function normalizeQuote(
  price: number | null | undefined,
  currency: string | null | undefined
): NormalizedQuote {
  const cleanPrice = typeof price === 'number' && Number.isFinite(price) ? price : null
  if (!currency) return { price: cleanPrice, currency: null }

  // "GBp" and "GBP" differ only by case, so disambiguate before lowercasing.
  const key = currency === 'GBp' ? 'gbp_minor' : currency.toLowerCase()
  const minor = MINOR_UNITS[key]
  if (!minor) return { price: cleanPrice, currency: currency.toUpperCase() }

  return {
    price: cleanPrice == null ? null : cleanPrice / minor.perMajor,
    currency: minor.currency,
  }
}
