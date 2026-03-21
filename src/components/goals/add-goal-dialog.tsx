'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, Target, Sparkles } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addGoal } from '@/lib/actions/goals'

const POPULAR_GOALS = [
  { name: 'רישיון נהיגה',      icon: '🚗', amount: 18000, color: 'blue'   },
  { name: 'טיול גדול לחו"ל',  icon: '✈️', amount: 10000, color: 'cyan'   },
  { name: 'מחשב חדש',          icon: '💻', amount: 5000,  color: 'purple' },
  { name: 'אופניים חשמליים',   icon: '🚴', amount: 7000,  color: 'green'  },
  { name: 'קונסולת משחקים',    icon: '🎮', amount: 2000,  color: 'pink'   },
  { name: 'טלפון חדש',         icon: '📱', amount: 3500,  color: 'orange' },
]

const COLOR_OPTIONS = [
  { value: 'purple', gradient: 'from-purple-500 to-pink-500' },
  { value: 'blue',   gradient: 'from-blue-500 to-cyan-500'   },
  { value: 'green',  gradient: 'from-green-500 to-emerald-500' },
  { value: 'orange', gradient: 'from-orange-500 to-yellow-500' },
  { value: 'pink',   gradient: 'from-pink-500 to-rose-500'   },
  { value: 'cyan',   gradient: 'from-cyan-500 to-teal-500'   },
]

interface AddGoalDialogProps {
  open: boolean
  onClose: () => void
}

export function AddGoalDialog({ open, onClose }: AddGoalDialogProps) {
  const [form, setForm] = useState({ name: '', target_amount: '', icon: '🎯', color: 'purple' })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleQuickSelect(goal: typeof POPULAR_GOALS[0]) {
    setForm({ name: goal.name, target_amount: String(goal.amount), icon: goal.icon, color: goal.color })
  }

  function handleClose() {
    setForm({ name: '', target_amount: '', icon: '🎯', color: 'purple' })
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.target_amount) return
    startTransition(async () => {
      await addGoal({
        name: form.name,
        target_amount: parseFloat(form.target_amount),
        icon: form.icon,
        color: form.color,
      })
      router.refresh()
      handleClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-cyan-900 border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl [&>button]:hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">מטרה חדשה</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}
            className="text-cyan-300 hover:text-white hover:bg-cyan-500/20 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick select */}
        <div className="mb-5">
          <Label className="text-cyan-300 text-sm mb-2 block">בחירה מהירה</Label>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_GOALS.map((goal) => (
              <motion.button
                key={goal.name}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleQuickSelect(goal)}
                className={`px-3 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all text-start ${
                  form.name === goal.name
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-white/10 text-cyan-200 hover:bg-white/20'
                }`}
              >
                <span className="text-xl shrink-0">{goal.icon}</span>
                <div>
                  <div className="font-semibold text-xs">{goal.name}</div>
                  <div className="text-xs opacity-80">₪{goal.amount.toLocaleString()}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-cyan-300 text-sm">שם המטרה</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="רישיון נהיגה"
                className="bg-white/10 border-cyan-500/30 text-white placeholder:text-cyan-400/50 rounded-xl mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-cyan-300 text-sm">אייקון</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))}
                placeholder="🎯"
                className="bg-white/10 border-cyan-500/30 text-white placeholder:text-cyan-400/50 rounded-xl mt-1 text-center text-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-cyan-300 text-sm">סכום יעד (₪)</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={form.target_amount}
              onChange={(e) => setForm(p => ({ ...p, target_amount: e.target.value }))}
              placeholder="18000"
              className="bg-white/10 border-cyan-500/30 text-white placeholder:text-cyan-400/50 rounded-xl mt-1"
              required
            />
          </div>

          {/* Color picker */}
          <div>
            <Label className="text-cyan-300 text-sm mb-2 block">צבע</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c.value }))}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.gradient} transition-transform ${
                    form.color === c.value ? 'scale-125 ring-2 ring-white/50' : 'scale-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 rounded-xl text-lg shadow-lg shadow-cyan-500/30"
            >
              <Sparkles className="w-5 h-5 ms-2" />
              {isPending ? 'מוסיף...' : 'הוסף מטרה'}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
