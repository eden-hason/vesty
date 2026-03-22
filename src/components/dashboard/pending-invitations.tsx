'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Mail, X } from 'lucide-react'
import type { Invitation } from '@/lib/types'
import { revokeInvitation } from '@/lib/actions/invitations'

interface PendingInvitationsProps {
  invitations: Invitation[]
}

function formatRelativeDate(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'היום'
  if (days === 1) return 'אתמול'
  return `לפני ${days} ימים`
}

export function PendingInvitations({ invitations }: PendingInvitationsProps) {
  const [revoking, setRevoking] = useState<string | null>(null)

  if (invitations.length === 0) return null

  async function handleRevoke(id: string) {
    setRevoking(id)
    try {
      await revokeInvitation(id)
    } catch {
      setRevoking(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          הזמנות ממתינות
        </h2>
      </div>

      <div className="rounded-2xl border border-purple-500/20 bg-white/5 divide-y divide-white/5 overflow-hidden">
        {invitations.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-purple-300" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{inv.child_name}</p>
                <p className="text-purple-300/60 text-xs truncate">{inv.child_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 text-xs mb-0.5">
                  ממתין לאישור
                </span>
                <p className="text-purple-300/50 text-xs">{formatRelativeDate(inv.created_at)}</p>
              </div>
              <button
                onClick={() => handleRevoke(inv.id)}
                disabled={revoking === inv.id}
                aria-label="בטל הזמנה"
                className="w-7 h-7 rounded-full flex items-center justify-center text-purple-300/50 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
