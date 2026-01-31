'use client'

/**
 * useChartResponsive Hook
 *
 * Provides responsive utilities for charts.
 * Handles breakpoint detection and adaptive sizing.
 *
 * @module charts/hooks/useChartResponsive
 */

import { useState, useEffect, useMemo } from 'react'
import { DEFAULT_MARGIN, COMPACT_MARGIN, MOBILE_MARGIN } from '../utils/constants'

/**
 * Chart margin type.
 */
export interface ChartMargin {
	readonly top: number
	readonly right: number
	readonly bottom: number
	readonly left: number
}

/**
 * Breakpoint definitions.
 */
export const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Responsive chart configuration.
 */
export interface ResponsiveChartConfig {
	/** Current breakpoint */
	breakpoint: Breakpoint | 'xs'
	/** Whether on mobile */
	isMobile: boolean
	/** Whether on tablet */
	isTablet: boolean
	/** Whether on desktop */
	isDesktop: boolean
	/** Recommended margin for current breakpoint */
	margin: ChartMargin
	/** Recommended number of X-axis ticks */
	numXTicks: number
	/** Recommended number of Y-axis ticks */
	numYTicks: number
	/** Whether to show full labels or abbreviate */
	showFullLabels: boolean
	/** Recommended font size for labels */
	labelFontSize: number
	/** Whether to show legend */
	showLegend: boolean
}

/**
 * Pure function to get responsive chart configuration.
 * Use this inside render callbacks where hooks cannot be called.
 *
 * @param containerWidth - Container width from ParentSize
 *
 * @example
 * ```tsx
 * <ChartContainer>
 *   {({ width, height }) => {
 *     const responsive = getResponsiveConfig(width)
 *     return <AxisBottom numTicks={responsive.numXTicks} />
 *   }}
 * </ChartContainer>
 * ```
 */
export function getResponsiveConfig(containerWidth: number): ResponsiveChartConfig {
	// Determine breakpoint
	let breakpoint: Breakpoint | 'xs' = 'xs'
	if (containerWidth >= BREAKPOINTS.xl) breakpoint = 'xl'
	else if (containerWidth >= BREAKPOINTS.lg) breakpoint = 'lg'
	else if (containerWidth >= BREAKPOINTS.md) breakpoint = 'md'
	else if (containerWidth >= BREAKPOINTS.sm) breakpoint = 'sm'

	const isMobile = containerWidth < BREAKPOINTS.md
	const isTablet = containerWidth >= BREAKPOINTS.md && containerWidth < BREAKPOINTS.lg
	const isDesktop = containerWidth >= BREAKPOINTS.lg

	// Responsive configurations
	return {
		breakpoint,
		isMobile,
		isTablet,
		isDesktop,
		margin: isMobile ? COMPACT_MARGIN : DEFAULT_MARGIN,
		numXTicks: isMobile ? 3 : isTablet ? 5 : 7,
		numYTicks: isMobile ? 3 : 5,
		showFullLabels: !isMobile,
		labelFontSize: isMobile ? 10 : 12,
		showLegend: !isMobile,
	}
}

/**
 * Hook to get responsive chart configuration.
 * Use at top level of components, NOT inside render callbacks.
 *
 * @param containerWidth - Current container width (optional)
 *
 * @example
 * ```tsx
 * function MyChart({ width }) {
 *   const responsive = useChartResponsive(width)
 *   return (
 *     <AxisBottom numTicks={responsive.numXTicks} />
 *   )
 * }
 * ```
 */
export function useChartResponsive(containerWidth?: number): ResponsiveChartConfig {
	const [windowWidth, setWindowWidth] = useState<number>(
		typeof window !== 'undefined' ? window.innerWidth : 1024
	)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const handleResize = () => {
			setWindowWidth(window.innerWidth)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Use container width if provided, otherwise use window width
	const effectiveWidth = containerWidth ?? windowWidth

	return useMemo<ResponsiveChartConfig>(() => {
		return getResponsiveConfig(effectiveWidth)
	}, [effectiveWidth])
}

/**
 * Calculate inner dimensions after applying margins.
 *
 * @param width - Total width
 * @param height - Total height
 * @param margin - Margin object
 */
export function getInnerDimensions(
	width: number,
	height: number,
	margin: ChartMargin = DEFAULT_MARGIN
): { innerWidth: number; innerHeight: number } {
	return {
		innerWidth: Math.max(0, width - margin.left - margin.right),
		innerHeight: Math.max(0, height - margin.top - margin.bottom),
	}
}

/**
 * Check if reduced motion is preferred.
 */
export function useReducedMotion(): boolean {
	const [reducedMotion, setReducedMotion] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		setReducedMotion(mediaQuery.matches)

		const handler = (e: MediaQueryListEvent) => {
			setReducedMotion(e.matches)
		}

		mediaQuery.addEventListener('change', handler)
		return () => mediaQuery.removeEventListener('change', handler)
	}, [])

	return reducedMotion
}

/**
 * Get responsive margin for charts.
 * DRY helper to avoid repeating mobile/desktop margin logic.
 *
 * @param isMobile - Whether on mobile breakpoint
 * @param compact - Whether to use compact margins (for sparklines)
 *
 * @example
 * ```tsx
 * const responsive = useChartResponsive(width)
 * const margin = getResponsiveMargin(responsive.isMobile)
 * ```
 */
export function getResponsiveMargin(
	isMobile: boolean,
	compact: boolean = false
): ChartMargin {
	if (compact) {
		return COMPACT_MARGIN
	}
	return isMobile ? MOBILE_MARGIN : DEFAULT_MARGIN
}
