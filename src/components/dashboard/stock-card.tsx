'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { Stock } from '@/lib/types'

const STOCK_EMOJIS: Record<string, string> = {
  AAPL: '🍎', TSLA: '⚡', DIS: '🏰', MSFT: '💻',
  GOOG: '🔍', GOOGL: '🔍', AMZN: '📦', META: '👤',
  NFLX: '🎬', NVDA: '🎮', AMD: '🔴', INTC: '💾',
  SPOT: '🎵', UBER: '🚗', LYFT: '🚙', SBUX: '☕',
  NKE: '👟', MCD: '🍔', KO: '🥤', PEP: '🥤',
}

interface StockCardProps {
  stock: Stock
  index: number
  ilsRate: number | null
  isParentMode: boolean
  onDelete: () => void
}

export function StockCard({ stock, index, ilsRate, isParentMode, onDelete }: StockCardProps) {
  const emoji = stock.emoji || STOCK_EMOJIS[stock.ticker?.toUpperCase()] || '📈'
  const currentPrice = stock.current_price ?? stock.purchase_price
  const totalValue = currentPrice * stock.quantity
  const purchaseValue = stock.purchase_price * stock.quantity
  const gain = totalValue - purchaseValue
  const gainPercent = ((currentPrice - stock.purchase_price) / stock.purchase_price) * 100
  const isPositive = gain >= 0
  const ilsValue = ilsRate ? totalValue * ilsRate : null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-3xl shrink-0"
          >
            {emoji}
          </motion.div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-lg">{stock.ticker}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200">
                {stock.quantity} מניות
              </span>
            </div>
            <span className="text-purple-300 text-sm">{stock.company_name}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {isParentMode && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
          <div className="text-white font-bold text-xl">
            ${totalValue.toFixed(0)}
          </div>
          {ilsValue != null && (
            <div className="text-cyan-300 text-sm">
              ₪{ilsValue.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
            </div>
          )}
        </div>
      </div>

      {/* Price row */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-purple-400 mb-1">מחיר רכישה</div>
            <div className="text-white font-medium">${stock.purchase_price.toFixed(0)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-purple-400 mb-1">רווח/הפסד</div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
              className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {isPositive ? '+' : ''}${gain.toFixed(0)}
              <span className="text-xs font-normal ms-1">
                ({isPositive ? '+' : ''}{gainPercent.toFixed(1)}%)
              </span>
            </motion.div>
          </div>
          <div className="text-left">
            <div className="text-xs text-purple-400 mb-1">מחיר נוכחי</div>
            <div className="text-white font-medium">${currentPrice.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
