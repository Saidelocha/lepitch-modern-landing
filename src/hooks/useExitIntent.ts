'use client'

import { useEffect, useState, useCallback } from 'react'

interface UseExitIntentOptions {
  enabled?: boolean
  delay?: number
  onExitIntent?: () => void
}

export function useExitIntent(options: UseExitIntentOptions = {}) {
  const { enabled = true, delay = 1000, onExitIntent } = options
  const [hasTriggered, setHasTriggered] = useState(false)
  
  const getLastShownTime = () => {
    const lastShown = localStorage.getItem('exitPopupLastShown')
    return lastShown ? parseInt(lastShown) : 0
  }
  
  const canShowPopup = useCallback(() => {
    const lastShown = getLastShownTime()
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds
    return now - lastShown > thirtyMinutes
  }, [])

  useEffect(() => {
    if (!enabled || hasTriggered) return

    let timeoutId: NodeJS.Timeout

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving from the top of the page
      if (e.clientY <= 0 && canShowPopup()) {
        timeoutId = setTimeout(() => {
          if (!hasTriggered && canShowPopup()) {
            setHasTriggered(true)
            localStorage.setItem('exitPopupLastShown', Date.now().toString())
            onExitIntent?.()
          }
        }, delay)
      }
    }

    const handleMouseEnter = () => {
      // Clear timeout if mouse comes back
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    // Mobile: detect back button or page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasTriggered && canShowPopup()) {
        setHasTriggered(true)
        localStorage.setItem('exitPopupLastShown', Date.now().toString())
        onExitIntent?.()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [enabled, delay, onExitIntent, hasTriggered, canShowPopup])

  const resetTrigger = () => setHasTriggered(false)

  return { hasTriggered, resetTrigger }
}