'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Target, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddGoalDialog } from './add-goal-dialog'
import { deleteGoal } from '@/lib/actions/goals'
import type { InvestmentGoal } from '@/lib/types'

const COLOR_THEMES: Record<string, string> = {
  purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  blue:   'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  green:  'from-green-500/20 to-emerald-500/20 border-green-500/30',
  orange: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
  pink:   'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  cyan:   'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
}

const PROGRESS_COLORS: Record<string, string> = {
  purple: 'from-purple-500 to-pink-500',
  blue:   'from-blue-500 to-cyan-500',
  green:  'from-green-500 to-emerald-500',
  orange: 'from-orange-500 to-yellow-500',
  pink:   'from-pink-500 to-rose-500',
  cyan:   'from-cyan-500 to-teal-500',
}

interface GoalsSectionProps {
  goals: InvestmentGoal[]
  portfolioValueILS: number
}

export function GoalsSection({ goals, portfolioValueILS }: GoalsSectionProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('למחוק את המטרה?')) return
    startTransition(async () => {
      await deleteGoal(id)
      router.refresh()
    })
  }

  // Allocate portfolio value sequentially across goals (first goal fills first)
  let remaining = portfolioValueILS

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-8 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          המטרות שלי
        </h2>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/30"
        >
          <Plus className="w-4 h-4 ms-2" />
          מטרה חדשה
        </Button>
      </div>

      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-cyan-500/30"
        >
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="text-white font-bold text-lg mb-2">אין מטרות עדיין</h3>
          <p className="text-purple-300/70 mb-4 text-sm">הוסף מטרה ראשונה ותתחיל לחסוך!</p>
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 ms-2" />
            הוסף מטרה ראשונה
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const allocated = Math.min(remaining, goal.target_amount)
            remaining = Math.max(0, remaining - goal.target_amount)
            const progress = Math.min((allocated / goal.target_amount) * 100, 100)
            const isComplete = progress >= 100 || goal.completed
            const theme = COLOR_THEMES[goal.color ?? 'purple'] ?? COLOR_THEMES.purple
            const progressColor = PROGRESS_COLORS[goal.color ?? 'purple'] ?? PROGRESS_COLORS.purple

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative overflow-hidden bg-gradient-to-br ${theme} backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 ${
                  isComplete ? 'border-green-400/50 shadow-lg shadow-green-500/20' : 'hover:border-cyan-400/50'
                }`}
              >
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-3 end-3 bg-green-500 rounded-full p-1.5"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme} flex items-center justify-center text-2xl`}
                    >
                      {goal.icon ?? '🎯'}
                    </motion.div>
                    <div>
                      <h3 className={`font-bold text-white text-lg ${isComplete ? 'line-through opacity-70' : ''}`}>
                        {goal.name}
                      </h3>
                      <p className="text-sm text-purple-300">
                        ₪{goal.target_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300">התקדמות</span>
                    <span className={`font-bold ${isComplete ? 'text-green-400' : 'text-cyan-300'}`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${isComplete ? 'from-green-500 to-emerald-500' : progressColor} rounded-full relative`}
                    >
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-purple-400">
                    <span>₪{Math.round(allocated).toLocaleString()} נוכחי</span>
                    <span>נותרו ₪{Math.round(Math.max(0, goal.target_amount - allocated)).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AddGoalDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </motion.div>
  )
}
