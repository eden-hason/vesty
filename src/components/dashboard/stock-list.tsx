'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StockCard } from './stock-card'
import { AddStockDialog } from './add-stock-dialog'
import { deleteStock } from '@/lib/actions/stocks'
import type { Stock } from '@/lib/types'

interface StockListProps {
  stocks: Stock[]
  ilsRate: number | null
  isParentMode: boolean
  childId?: string
}

export function StockList({ stocks, ilsRate, isParentMode, childId }: StockListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('להסיר מניה זו מהתיק?')) return
    startTransition(async () => {
      await deleteStock(id)
      router.refresh()
    })
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          📊 כספת המניות שלי
        </h2>
        <AnimatePresence>
          {isParentMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/30"
              >
                <Plus className="w-4 h-4 ms-2" />
                הוסף מניה
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {stocks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-purple-500/30"
        >
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-white font-bold text-xl mb-2">הכספת שלך ריקה!</h3>
          <p className="text-purple-300/70 mb-6">
            {isParentMode
              ? 'הוסף את המניה הראשונה שלך כדי להתחיל לבנות עושר!'
              : 'בקש מהורה להוסיף את המניה הראשונה שלך!'}
          </p>
          {isParentMode && (
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 ms-2" />
              הוסף מניה ראשונה
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {stocks.map((stock, index) => (
            <StockCard
              key={stock.id}
              stock={stock}
              index={index}
              ilsRate={ilsRate}
              isParentMode={isParentMode}
              onDelete={() => handleDelete(stock.id)}
            />
          ))}
        </div>
      )}

      <AddStockDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        childId={childId}
      />
    </div>
  )
}
