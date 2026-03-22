'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PortfolioSummary } from './portfolio-summary'
import { StockList } from './stock-list'
import { ChildrenSelector } from './children-selector'
import { InviteChildDialog } from './invite-child-dialog'
import { GoalsSection } from '@/components/goals/goals-section'
import { LoadingScreen } from '@/components/loading-screen'
import { PendingInvitations } from './pending-invitations'
import { LOADING_START_KEY } from '@/app/dashboard/loading'
import type { Stock, InvestmentGoal, Profile, Invitation } from '@/lib/types'

const MIN_LOADING_MS = 3000

interface DashboardClientProps {
  stocks: Stock[]
  goals: InvestmentGoal[]
  profile: Profile
  children: Profile[]
  selectedChildId: string | null
  pendingInvitations?: Invitation[]
}

export function DashboardClient({ stocks, goals, profile, children: childProfiles, selectedChildId, pendingInvitations = [] }: DashboardClientProps) {
  const isParentMode = profile.role === 'parent'
  const [ilsRate, setIlsRate] = useState<number | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const router = useRouter()

  const rateLoadedRef = useRef(false)
  const pricesLoadedRef = useRef(false)

  function maybeFinishLoading() {
    if (!rateLoadedRef.current || !pricesLoadedRef.current) return
    const startTime = Number(sessionStorage.getItem(LOADING_START_KEY) ?? '0')
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed)
    setTimeout(() => setIsLoading(false), remaining)
  }

  // Fetch USD→ILS rate
  useEffect(() => {
    fetch('/api/ai/exchange-rate')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.rate) setIlsRate(data.rate) })
      .catch(() => {})
      .finally(() => {
        rateLoadedRef.current = true
        maybeFinishLoading()
      })
  }, [])

  // Fetch live prices for all stocks in parallel
  useEffect(() => {
    if (!stocks.length) {
      pricesLoadedRef.current = true
      maybeFinishLoading()
      return
    }
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
    }).finally(() => {
      pricesLoadedRef.current = true
      maybeFinishLoading()
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

  function handleSelectChild(childId: string) {
    router.push(`/dashboard?child=${childId}`)
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

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
            <p className="text-purple-300/70 text-sm">
              {isParentMode ? 'ניהול תיקי ההשקעות של הילדים' : 'צפו בכסף שלכם גדל'}
            </p>
          </motion.div>

          {/* Parent: children selector */}
          {isParentMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              {childProfiles.length > 0 ? (
                <ChildrenSelector
                  children={childProfiles}
                  selectedChildId={selectedChildId}
                  onSelectChild={handleSelectChild}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-purple-500/30"
                >
                  <div className="text-6xl mb-4">👨‍👧‍👦</div>
                  <h3 className="text-white font-bold text-xl mb-2">ברוכים הבאים!</h3>
                  <p className="text-purple-300/70 mb-6">
                    הזמן את הילדים שלך כדי להתחיל לנהל את תיקי ההשקעות שלהם
                  </p>
                  <Button
                    onClick={() => setShowInvite(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
                  >
                    <UserPlus className="w-4 h-4 ms-2" />
                    הזמן ילד/ה
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Show portfolio content when there's a selected child or when user is a child */}
          {(selectedChildId || !isParentMode) && (
            <>
              {/* Portfolio summary */}
              <PortfolioSummary stocks={stocksWithLivePrices} ilsRate={ilsRate} />

              {/* Stock list */}
              <StockList
                stocks={stocksWithLivePrices}
                ilsRate={ilsRate}
                isParentMode={isParentMode}
                childId={selectedChildId ?? undefined}
              />

              {/* Investment goals */}
              <GoalsSection
                goals={goals}
                portfolioValueILS={portfolioValueILS}
                isParentMode={isParentMode}
                childId={selectedChildId ?? undefined}
              />
            </>
          )}

          {/* Pending invitations — always at the bottom for parents */}
          {isParentMode && <PendingInvitations invitations={pendingInvitations} />}
        </div>
      </div>

      <InviteChildDialog open={showInvite} onClose={() => setShowInvite(false)} />
    </>
  )
}
