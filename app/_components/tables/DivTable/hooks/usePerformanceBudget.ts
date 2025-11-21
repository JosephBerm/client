/**
 * Performance Budget Hook
 * 
 * Monitors component render performance and warns when budget is exceeded.
 * Implements FAANG-level performance monitoring.
 * 
 * @module usePerformanceBudget
 */

'use client'

import { useEffect, useCallback } from 'react'
import { logger } from '@_core'
import type { UsePerformanceBudgetReturn } from '../types/divTableTypes'

interface PerformanceBudgets {
  renderTime: number // milliseconds
  memoryUsage?: number // megabytes
}

/**
 * Hook to enforce performance budgets
 * 
 * @param componentName - Name of component for logging
 * @param budgets - Performance budget limits
 * @param enabled - Enable/disable monitoring (default: true)
 * @returns Object with measure function
 * 
 * @example
 * ```tsx
 * const { measure } = usePerformanceBudget('DivTable', {
 *   renderTime: 100, // Warn if render > 100ms
 * })
 * 
 * useEffect(() => {
 *   performance.mark('render-start')
 *   return () => {
 *     performance.mark('render-end')
 *     measure('render', 'render-start', 'render-end')
 *   }
 * }, [measure])
 * ```
 */
export function usePerformanceBudget(
  componentName: string,
  budgets: PerformanceBudgets,
  enabled: boolean = true
): UsePerformanceBudgetReturn {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Performance observer for measuring render time
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Check if render time exceeds budget
        if (entry.duration > budgets.renderTime) {
          logger.warn('Performance budget exceeded', {
            component: componentName,
            metric: entry.name,
            duration: Math.round(entry.duration),
            budget: budgets.renderTime,
            overage: Math.round(entry.duration - budgets.renderTime),
            timestamp: Date.now(),
          })
        } else {
          logger.debug('Performance metric', {
            component: componentName,
            metric: entry.name,
            duration: Math.round(entry.duration),
            budget: budgets.renderTime,
            timestamp: Date.now(),
          })
        }
      }
    })

    // Observe performance measures
    try {
      observer.observe({ entryTypes: ['measure'] })
    } catch (error) {
      // Browser may not support this
      logger.debug('Performance observer not supported', {
        component: componentName,
        error,
      })
    }

    return () => observer.disconnect()
  }, [componentName, budgets.renderTime, enabled])

  // Measure function for manual measurements
  const measure = useCallback(
    (name: string, startMark: string, endMark: string) => {
      if (!enabled || typeof window === 'undefined') return

      try {
        performance.measure(name, startMark, endMark)
      } catch (error) {
        // Marks may not exist, silently fail
        logger.debug('Performance measure failed', {
          component: componentName,
          name,
          startMark,
          endMark,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
    [componentName, enabled]
  )

  return { measure }
}

