/**
 * Mobile Detection Hook
 * 
 * Detects viewport size and returns responsive breakpoint information.
 * Uses ResizeObserver for efficient viewport tracking.
 * 
 * @module useMobileDetection
 */

'use client'

import { useState, useEffect } from 'react'

import { BREAKPOINTS } from '../types/divTableConstants'

import type { UseMobileDetectionReturn } from '../types/divTableTypes'

/**
 * Hook to detect mobile/tablet/desktop viewport
 * 
 * @param mobileBreakpoint - Custom mobile breakpoint (px), defaults to 640px
 * @returns Object with isMobile, isTablet, isDesktop, breakpoint
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop } = useMobileDetection()
 * 
 * if (isMobile) {
 *   return <MobileView />
 * }
 * ```
 */
export function useMobileDetection(
  mobileBreakpoint: number = BREAKPOINTS.sm
): UseMobileDetectionReturn {
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    // SSR-safe initialization
    if (typeof window === 'undefined') {return BREAKPOINTS.lg}
    return window.innerWidth
  })

  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') {return}

    // Handler for window resize
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    // Initial size
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Compute breakpoint values
  const isMobile = windowWidth < mobileBreakpoint
  const isTablet = windowWidth >= mobileBreakpoint && windowWidth < BREAKPOINTS.lg
  const isDesktop = windowWidth >= BREAKPOINTS.lg

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
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
  }
}

