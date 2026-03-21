'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import { PortfolioSummary } from './portfolio-summary'
import { StockList } from './stock-list'
import { ModeToggle } from './mode-toggle'
import { GoalsSection } from '@/components/goals/goals-section'
import type { Stock, InvestmentGoal } from '@/lib/types'

interface DashboardClientProps {
  stocks: Stock[]
  goals: InvestmentGoal[]
}

export function DashboardClient({ stocks, goals }: DashboardClientProps) {
  const [isParentMode, setIsParentMode] = useState(false)
  const [ilsRate, setIlsRate] = useState<number | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  // Fetch USD→ILS rate
  useEffect(() => {
    fetch('/api/ai/exchange-rate')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.rate) setIlsRate(data.rate) })
      .catch(() => {})
  }, [])

  // Fetch live prices for all stocks in parallel
  useEffect(() => {
    if (!stocks.length) return
    const uniqueTickers = [...new Set(stocks.map(s => s.ticker))]
    Promise.all(
      uniqueTickers.map(ticker =>
        fetch(`/api/stocks/quote?ticker=${ticker}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => data?.price != null ? { ticker, price: data.price as number } : null)
          .catch(() => null)
      )
    ).then(results => {
      const map: Record<string, number> = {}
      results.forEach(r => { if (r) map[r.ticker] = r.price })
      setLivePrices(map)
    })
  }, [stocks])

  const stocksWithLivePrices = stocks.map(s => ({
    ...s,
    current_price: livePrices[s.ticker] ?? s.current_price,
  }))

  const totalValueUSD = stocksWithLivePrices.reduce(
    (sum, s) => sum + (s.current_price ?? s.purchase_price) * s.quantity, 0
  )
  const portfolioValueILS = ilsRate ? totalValueUSD * ilsRate : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Rocket className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              VESTY
            </h1>
          </div>
          <p className="text-purple-300/70 text-sm">צפו בכסף שלכם גדל</p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <ModeToggle isParentMode={isParentMode} onModeChange={setIsParentMode} />
        </motion.div>

        {/* Portfolio summary */}
        <PortfolioSummary stocks={stocksWithLivePrices} ilsRate={ilsRate} />

        {/* Stock list */}
        <StockList stocks={stocksWithLivePrices} ilsRate={ilsRate} isParentMode={isParentMode} />

        {/* Investment goals */}
        <GoalsSection
          goals={goals}
          portfolioValueILS={portfolioValueILS}
        />
      </div>
    </div>
  )
}
