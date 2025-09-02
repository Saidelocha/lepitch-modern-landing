'use client'

import { useEffect, useRef } from 'react'

interface ScrollTrackingOptions {
  thresholds?: number[]
  onScrollDepth?: (depth: number) => void
  onSectionView?: (sectionId: string, depth: number) => void
}

export function useScrollTracking({
  thresholds = [25, 50, 75, 90, 100],
  onScrollDepth,
  onSectionView
}: ScrollTrackingOptions = {}) {
  const trackedDepths = useRef<Set<number>>(new Set())
  const trackedSections = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Calculate scroll depth percentage
      const scrollDepth = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      )

      // Track scroll depth milestones
      thresholds.forEach(threshold => {
        if (scrollDepth >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold)
          onScrollDepth?.(threshold)
          
          // Track with analytics
          if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as { gtag: Function }).gtag === 'function') {
            (window as { gtag: Function }).gtag('event', 'scroll_depth', {
              event_category: 'Engagement',
              event_label: `${threshold}%`,
              value: threshold
            })
          }
        }
      })

      // Track section views
      const sections = document.querySelectorAll('section[id]')
      sections.forEach(section => {
        const rect = section.getBoundingClientRect()
        const sectionId = section.id
        
        // Check if section is in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
          const visibilityPercentage = (visibleHeight / rect.height) * 100
          
          // Track if section is at least 50% visible and not tracked yet
          if (visibilityPercentage >= 50 && !trackedSections.current.has(sectionId)) {
            trackedSections.current.add(sectionId)
            onSectionView?.(sectionId, scrollDepth)
            
            // Track with analytics
            if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as { gtag: Function }).gtag === 'function') {
              (window as { gtag: Function }).gtag('event', 'section_view', {
                event_category: 'Engagement',
                event_label: sectionId,
                custom_parameter_1: sectionId,
                custom_parameter_2: scrollDepth
              })
            }
          }
        }
      })
    }

    // Throttle scroll events
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [thresholds, onScrollDepth, onSectionView])

  return {
    trackedDepths: Array.from(trackedDepths.current),
    trackedSections: Array.from(trackedSections.current)
  }
}