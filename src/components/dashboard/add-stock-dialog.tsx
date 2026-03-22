'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Sparkles, Loader2, Search } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addStock } from '@/lib/actions/stocks'
import confetti from 'canvas-confetti'

const QUICK_STOCKS: StockResult[] = [
  { ticker: 'AAPL',  company_name: 'Apple Inc.',   emoji: '🍎' },
  { ticker: 'NVDA',  company_name: 'NVIDIA Corp.', emoji: '🎮' },
  { ticker: 'TSLA',  company_name: 'Tesla Inc.',   emoji: '⚡' },
  { ticker: 'GOOGL', company_name: 'Alphabet Inc.',emoji: '🔍' },
  { ticker: 'MSFT',  company_name: 'Microsoft',    emoji: '💻' },
  { ticker: 'AMZN',  company_name: 'Amazon',       emoji: '📦' },
]

interface StockResult {
  ticker: string
  company_name: string
  emoji: string
}

interface Recommendation {
  label: string
  score: number
}

interface SelectedStock extends StockResult {
  currentPrice: number | null
  recommendation: Recommendation | null
}

const defaultDate = () => new Date().toISOString().split('T')[0]

interface AddStockDialogProps {
  open: boolean
  onClose: () => void
  childId?: string
}

export function AddStockDialog({ open, onClose, childId }: AddStockDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SelectedStock | null>(null)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [date, setDate] = useState(defaultDate())
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  // Prevents the search effect from re-firing when query is set programmatically (on selection)
  const skipSearch = useRef(false)

  function reset() {
    setQuery('')
    setResults([])
    setSelected(null)
    setPurchasePrice('')
    setQuantity('')
    setDate(defaultDate())
    setShowDropdown(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  // Debounced search — skipped when query was set programmatically by a selection
  useEffect(() => {
    if (skipSearch.current) { skipSearch.current = false; return }
    if (!query.trim()) { setResults([]); setShowDropdown(false); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
        const data = res.ok ? await res.json() : { results: [] }
        setResults(data.results ?? [])
        setShowDropdown(true)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [query])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchHistoricalPrice = useCallback(async (ticker: string, d: string) => {
    setFetchingPrice(true)
    try {
      const res = await fetch(`/api/stocks/historical?ticker=${ticker}&date=${d}`)
      const data = res.ok ? await res.json() : null
      if (data?.price) setPurchasePrice(String(Math.round(data.price * 100) / 100))
    } catch {}
    finally { setFetchingPrice(false) }
  }, [])

  async function handleSelect(stock: StockResult) {
    setShowDropdown(false)
    skipSearch.current = true
    setQuery(stock.company_name)
    setSelected({ ...stock, currentPrice: null, recommendation: null })

    // Fetch current price + recommendation in parallel
    const [quoteRes] = await Promise.all([
      fetch(`/api/stocks/quote?ticker=${stock.ticker}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ])

    const price: number | null = quoteRes?.price ?? null
    const rec: Recommendation | null = quoteRes?.recommendation ?? null

    setSelected(prev => prev ? { ...prev, currentPrice: price, recommendation: rec } : prev)
    if (price != null) setPurchasePrice(String(Math.round(price * 100) / 100))

    // Also fetch historical for selected date
    fetchHistoricalPrice(stock.ticker, date)
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = e.target.value
    setDate(d)
    if (selected) fetchHistoricalPrice(selected.ticker, d)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !purchasePrice || !quantity) return

    startTransition(async () => {
      await addStock({
        ticker: selected.ticker,
        company_name: selected.company_name,
        purchase_price: parseFloat(purchasePrice),
        quantity: parseFloat(quantity),
        date_purchased: date,
        emoji: selected.emoji,
        childId,
      })

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#ec4899', '#06b6d4', '#10b981'],
      })

      router.refresh()
      handleClose()
    })
  }

  const rec = selected?.recommendation
  const recColor = rec
    ? rec.score >= 4 ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
      : rec.score <= 2 ? 'text-red-400 bg-red-500/20 border-red-500/30'
      : 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    : ''

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl [&>button]:hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">הוסף מניה חדשה</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick select */}
        <div className="mb-4">
          <p className="text-purple-300 text-sm mb-2">בחירה מהירה</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_STOCKS.map((stock) => (
              <motion.button
                key={stock.ticker}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(stock)}
                className={`flex items-center gap-2 px-2 py-2.5 rounded-xl transition-all text-start ${
                  selected?.ticker === stock.ticker
                    ? 'bg-purple-500/30 border border-purple-400/60'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-xl shrink-0">{stock.emoji}</span>
                <div className="min-w-0">
                  <span className="text-white font-bold text-xs block">{stock.ticker}</span>
                  <span className="text-purple-300 text-xs truncate block">{stock.company_name.split(' ')[0]}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search input with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Label className="text-purple-300 text-sm">חפש מניה</Label>
            <div className="relative mt-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => { skipSearch.current = false; setQuery(e.target.value); setSelected(null) }}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder="Apple, TSLA, NVDA..."
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50 rounded-xl pe-9"
                autoComplete="off"
              />
              {searching && (
                <Loader2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />
              )}
            </div>

            {/* Dropdown results */}
            <AnimatePresence>
              {showDropdown && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 mt-1 w-full rounded-xl bg-slate-800 border border-purple-500/30 shadow-xl overflow-hidden"
                >
                  {results.map((r) => (
                    <button
                      key={r.ticker}
                      type="button"
                      onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-500/20 transition-colors text-start"
                    >
                      <span className="text-xl w-8 text-center">{r.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-bold text-sm">{r.ticker}</span>
                        <span className="text-purple-300 text-xs block truncate">{r.company_name}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected stock card */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 bg-purple-500/10 rounded-xl border border-purple-500/20 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selected.emoji}</span>
                  <div className="flex-1">
                    <span className="text-white font-bold">{selected.ticker}</span>
                    <span className="text-purple-300 text-sm block">{selected.company_name}</span>
                  </div>
                  {rec && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${recColor}`}>
                      {rec.label}
                    </span>
                  )}
                </div>

                {/* Recommendation score bar */}
                {rec && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= rec.score
                            ? rec.score >= 4 ? 'bg-emerald-400' : rec.score <= 2 ? 'bg-red-400' : 'bg-yellow-400'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {selected.currentPrice != null && (
                  <p className="text-cyan-300 text-xs">
                    מחיר נוכחי: <span className="font-bold">${selected.currentPrice.toFixed(2)}</span>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date — shown once stock is selected */}
          {selected && (
            <div>
              <Label className="text-purple-300 text-sm">תאריך רכישה</Label>
              <Input
                type="date"
                value={date}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                className="bg-white/10 border-purple-500/30 text-white rounded-xl mt-1"
                required
              />
            </div>
          )}

          {/* Price + Quantity */}
          {selected && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-300 text-sm">מחיר רכישה ($)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="150"
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50 rounded-xl mt-1"
                    required
                  />
                  {fetchingPrice && (
                    <Loader2 className="absolute end-3 top-1/2 mt-0.5 -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />
                  )}
                </div>
              </div>
              <div>
                <Label className="text-purple-300 text-sm">כמות</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50 rounded-xl mt-1"
                  required
                />
              </div>
            </div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isPending || !selected || !purchasePrice || !quantity}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl text-lg shadow-lg shadow-purple-500/30 disabled:opacity-50"
            >
              <Plus className="w-5 h-5 ms-2" />
              {isPending ? 'מוסיף...' : 'הוסף לתיק'}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
