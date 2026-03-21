'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PinDialog } from './pin-dialog'

interface ModeToggleProps {
  isParentMode: boolean
  onModeChange: (parentMode: boolean) => void
}

export function ModeToggle({ isParentMode, onModeChange }: ModeToggleProps) {
  const [showPin, setShowPin] = useState(false)
  const [pinMode, setPinMode] = useState<'setup' | 'verify'>('verify')

  function handleTabChange(value: string) {
    if (value === 'parent') {
      const hasPin = localStorage.getItem('parentPin')
      setPinMode(hasPin ? 'verify' : 'setup')
      setShowPin(true)
    } else {
      onModeChange(false)
    }
  }

  return (
    <>
      <Tabs value={isParentMode ? 'parent' : 'child'} onValueChange={handleTabChange}>
        <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 p-1">
          <TabsTrigger
            value="child"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-purple-300 rounded-lg px-6 py-2 transition-all"
          >
            ילד/ה
          </TabsTrigger>
          <TabsTrigger
            value="parent"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-purple-300 rounded-lg px-6 py-2 transition-all"
          >
            הורה
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <PinDialog
        open={showPin}
        mode={pinMode}
        onClose={() => setShowPin(false)}
        onSuccess={() => {
          setShowPin(false)
          onModeChange(true)
        }}
      />
    </>
  )
}
