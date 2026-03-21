'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PinDialogProps {
  open: boolean
  mode: 'setup' | 'verify'
  onClose: () => void
  onSuccess: () => void
}

export function PinDialog({ open, mode, onClose, onSuccess }: PinDialogProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (!open) {
      setPin('')
      setConfirmPin('')
      setStep('enter')
      setError('')
    }
  }, [open])

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  function handleDigit(d: string) {
    if (step === 'enter') {
      if (pin.length >= 4) return
      const next = pin + d
      setPin(next)
      if (next.length === 4) handlePinComplete(next)
    } else {
      if (confirmPin.length >= 4) return
      const next = confirmPin + d
      setConfirmPin(next)
      if (next.length === 4) handleConfirmComplete(next)
    }
  }

  function handleDelete() {
    if (step === 'enter') setPin(p => p.slice(0, -1))
    else setConfirmPin(p => p.slice(0, -1))
  }

  function handlePinComplete(value: string) {
    if (mode === 'verify') {
      const stored = localStorage.getItem('parentPin')
      if (stored === value) {
        onSuccess()
      } else {
        setError('קוד שגוי, נסה שוב')
        triggerShake()
        setTimeout(() => setPin(''), 500)
      }
    } else {
      // setup: go to confirm step
      setStep('confirm')
    }
  }

  function handleConfirmComplete(value: string) {
    if (value === pin) {
      localStorage.setItem('parentPin', pin)
      onSuccess()
    } else {
      setError('הקודים לא תואמים, נסה שוב')
      triggerShake()
      setTimeout(() => {
        setPin('')
        setConfirmPin('')
        setStep('enter')
      }, 500)
    }
  }

  const current = step === 'enter' ? pin : confirmPin
  const title = mode === 'verify'
    ? 'הזן קוד הורה'
    : step === 'enter' ? 'הגדר קוד הורה' : 'אשר קוד הורה'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500/30 rounded-3xl p-8 max-w-xs w-full shadow-2xl [&>button]:hidden">
        <div className="flex flex-col items-center gap-6">
          <div className="text-4xl">🔐</div>
          <h2 className="text-white font-bold text-xl text-center">{title}</h2>

          {/* PIN dots */}
          <motion.div
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex gap-3"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  i < current.length
                    ? 'bg-purple-400 border-purple-400'
                    : 'bg-transparent border-purple-500/50'
                }`}
              />
            ))}
          </motion.div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
              d === '' ? <div key={i} /> :
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => d === '⌫' ? handleDelete() : handleDigit(d)}
                className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xl font-bold transition-colors"
              >
                {d}
              </motion.button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="text-purple-400 hover:text-white w-full"
          >
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
