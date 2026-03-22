'use client'

import { useEffect } from 'react'
import { LoadingScreen } from '@/components/loading-screen'

export const LOADING_START_KEY = 'vesty_loading_start'

export default function Loading() {
  useEffect(() => {
    sessionStorage.setItem(LOADING_START_KEY, String(Date.now()))
  }, [])

  return <LoadingScreen />
}
