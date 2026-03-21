'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import type { Stock } from '@/lib/types'

interface PortfolioSummaryProps {
  stocks: Stock[]
  ilsRate: number | null
}

export function PortfolioSummary({ stocks, ilsRate }: PortfolioSummaryProps) {
  const totalValueUSD = stocks.reduce((sum, s) => {
    const price = s.current_price ?? s.purchase_price
    return sum + price * s.quantity
  }, 0)

  const totalCostUSD = stocks.reduce((sum, s) => {
    return sum + s.purchase_price * s.quantity
  }, 0)

  const gainUSD = totalValueUSD - totalCostUSD
  const gainPercent = totalCostUSD > 0 ? (gainUSD / totalCostUSD) * 100 : 0
  const isPositive = gainUSD >= 0

  const ilsValue = ilsRate ? totalValueUSD * ilsRate : null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl"
    >
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-purple-200 font-medium text-sm tracking-wide">התיק שלי</span>
        </div>

        {ilsValue != null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-white/80 text-3xl font-light">₪</span>
            <span className="text-white text-6xl font-bold tracking-tight">
              {ilsValue.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
            </span>
          </motion.div>
        ) : (
          <div className="h-16 w-48 bg-white/10 rounded-xl animate-pulse" />
        )}

        <motion.div
          key={totalValueUSD}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-cyan-300 text-2xl font-semibold mt-1"
        >
          ${totalValueUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isPositive
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          <span className="font-semibold">
            {isPositive ? '+' : ''}{gainUSD.toFixed(0)}$ רווח כולל
          </span>
          <span className="text-sm opacity-80">
            ({isPositive ? '+' : ''}{gainPercent.toFixed(1)}%)
          </span>
          {isPositive && stocks.length > 0 && <span className="text-lg">🚀</span>}
        </motion.div>
      </div>
    </motion.div>
  )
}
