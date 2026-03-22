'use client'

import { motion } from 'framer-motion'

const EMOJIS = [
  { emoji: '🍎', x: '8%',  y: '12%', size: 32, duration: 18 },
  { emoji: '💰', x: '85%', y: '8%',  size: 28, duration: 22 },
  { emoji: '⚡', x: '20%', y: '75%', size: 24, duration: 15 },
  { emoji: '🔍', x: '70%', y: '20%', size: 26, duration: 20 },
  { emoji: '🎮', x: '90%', y: '60%', size: 30, duration: 25 },
  { emoji: '📦', x: '5%',  y: '50%', size: 22, duration: 17 },
  { emoji: '💻', x: '50%', y: '85%', size: 28, duration: 19 },
  { emoji: '💲', x: '35%', y: '10%', size: 24, duration: 23 },
  { emoji: '₪',  x: '75%', y: '80%', size: 30, duration: 16 },
  { emoji: '📈', x: '15%', y: '35%', size: 26, duration: 21 },
  { emoji: '🏦', x: '60%', y: '45%', size: 22, duration: 24 },
  { emoji: '💎', x: '92%', y: '38%', size: 20, duration: 18 },
]

export function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #ec4899 100%)' }}
    >
      {EMOJIS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none pointer-events-none opacity-20"
          style={{ left: item.x, top: item.y, fontSize: item.size }}
          animate={{ rotate: 360 }}
          transition={{ duration: item.duration, repeat: Infinity, ease: 'linear' }}
        >
          {item.emoji}
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <motion.div
            className="text-[80px] leading-none"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🚀
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-[72px] font-black leading-none tracking-tight text-white"
          style={{ textShadow: '0 0 40px rgba(255,255,255,0.3)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          VESTY
        </motion.h1>

        <p className="text-white/80 text-lg font-medium">צפו בכסף שלכם גדל</p>

        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
