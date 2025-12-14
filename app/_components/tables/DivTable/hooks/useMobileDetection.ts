/**
 * Mobile Detection Hook
 * 
 * MAANG-level responsive detection using container width (not viewport width).
 * 
 * **Why Container Width?**
 * - Viewport width ignores sidebars, panels, and other layout elements
 * - A 1024px viewport with a 280px sidebar leaves only ~744px for content
 * - Container-based detection ensures tables switch to card view when space is tight
 * 
 * Uses ResizeObserver for efficient, performant container tracking.
 * 
 * @module useMobileDetection
 */

'use client'

import type { RefObject } from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'

import { BREAKPOINTS, CARD_VIEW_BREAKPOINT } from '../types/divTableConstants'

import type { UseMobileDetectionReturn } from '../types/divTableTypes'

/**
 * Hook to detect responsive breakpoints based on container width
 * 
 * @param cardViewBreakpoint - Breakpoint for card view (px), defaults to 1024px
 * @param containerRef - Optional ref to container element for container-based detection
 * @returns Object with isMobile, isTablet, isDesktop, breakpoint, containerWidth
 * 
 * @example
 * ```tsx
 * // Container-based detection (MAANG pattern)
 * const containerRef = useRef<HTMLDivElement>(null)
 * const { isMobile } = useMobileDetection(1024, containerRef)
 * 
 * return (
 *   <div ref={containerRef}>
 *     {isMobile ? <CardView /> : <TableView />}
 *   </div>
 * )
 * ```
 */
export function useMobileDetection(
  cardViewBreakpoint: number = CARD_VIEW_BREAKPOINT,
  containerRef?: RefObject<HTMLElement | null>
): UseMobileDetectionReturn & { containerWidth: number } {
  // Track container width (or window width as fallback)
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    // SSR-safe initialization - default to desktop
    if (typeof window === 'undefined') { return BREAKPOINTS.lg }
    return window.innerWidth
  })

  // Debounce resize updates for performance
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleResize = useCallback((width: number) => {
    // Debounce to avoid excessive re-renders during resize
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }
    resizeTimeoutRef.current = setTimeout(() => {
      setContainerWidth(width)
    }, 16) // ~60fps
  }, [])

  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') { return }

    // If container ref is provided, use ResizeObserver for container-based detection
    if (containerRef?.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Use contentBoxSize for accurate content width (excludes padding)
          const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
          handleResize(width)
        }
      })

      // Observe the container
      resizeObserver.observe(containerRef.current)

      // Set initial width
      setContainerWidth(containerRef.current.clientWidth)

      // Cleanup
      return () => {
        resizeObserver.disconnect()
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
      }
    }

    // Fallback: window-based detection
    function handleWindowResize() {
      handleResize(window.innerWidth)
    }

    // Initial size
    handleWindowResize()

    // Add event listener
    window.addEventListener('resize', handleWindowResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleWindowResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [containerRef, handleResize])

  // MAANG pattern: Card view below breakpoint, table view at/above
  // This is simpler and more intuitive than mobile/tablet/desktop
  const showCardView = containerWidth < cardViewBreakpoint

  // Legacy compatibility - map to mobile/tablet/desktop
  const isMobile = containerWidth < BREAKPOINTS.sm // < 640px
  const isTablet = containerWidth >= BREAKPOINTS.sm && containerWidth < cardViewBreakpoint
  const isDesktop = containerWidth >= cardViewBreakpoint

  // Determine current breakpoint
  let breakpoint: 'mobile' | 'tablet' | 'desktop'
  if (isMobile) {
    breakpoint = 'mobile'
  } else if (isTablet) {
    breakpoint = 'tablet'
  } else {
    breakpoint = 'desktop'
  }

  return {
    // Primary API: Use these for card/table switching
    isMobile: showCardView, // Simplified: anything below breakpoint shows card view
    isTablet,
    isDesktop: !showCardView,
    breakpoint,
    containerWidth,
  }
}

