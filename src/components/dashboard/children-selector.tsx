'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InviteChildDialog } from './invite-child-dialog'
import type { Profile } from '@/lib/types'

interface ChildrenSelectorProps {
  children: Profile[]
  selectedChildId: string | null
  onSelectChild: (childId: string) => void
}

export function ChildrenSelector({ children, selectedChildId, onSelectChild }: ChildrenSelectorProps) {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 text-purple-300 shrink-0">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">ילדים:</span>
        </div>

        {children.map((child) => (
          <motion.button
            key={child.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectChild(child.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedChildId === child.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            {child.display_name ?? 'ילד/ה'}
          </motion.button>
        ))}

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInvite(true)}
            className="text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-xl gap-1 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            הזמנה
          </Button>
        </motion.div>
      </div>

      <InviteChildDialog open={showInvite} onClose={() => setShowInvite(false)} />
    </>
  )
}
