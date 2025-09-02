'use client'

import { useScrollTracking } from '@/hooks/useScrollTracking'
import { logger } from '@/lib/logger'

export default function ScrollTracker() {
  // Track scroll behavior and section views
  useScrollTracking({
    thresholds: [25, 50, 75, 90, 100],
    onScrollDepth: (depth) => {
      if (process.env.NODE_ENV === 'development') {
        logger.info(`User scrolled to ${depth}%`, { metadata: { scrollDepth: depth } })
      }
    },
    onSectionView: (sectionId, depth) => {
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Section viewed`, { metadata: { sectionId, scrollDepth: depth } })
      }
    }
  })

  // Ce composant n'affiche rien, il fait juste le tracking
  return null
}