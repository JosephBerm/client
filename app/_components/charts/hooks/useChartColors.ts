'use client'

/**
 * useChartColors Hook
 *
 * Provides theme-aware colors for charts.
 * Resolves CSS variables to computed values for SVG use.
 *
 * @module charts/hooks/useChartColors
 */

import { useMemo, useState, useEffect } from 'react'
import { CHART_COLORS } from '../utils/constants'

/**
 * Resolved color values for chart use.
 */
export interface ChartColors {
	primary: string
	secondary: string
	accent: string
	success: string
	warning: string
	error: string
	info: string
	neutral: string
	/** Optional series palette override */
	seriesPalette?: string[]
	/** Background color */
	background: string
	/** Text color */
	text: string
	/** Muted text color */
	textMuted: string
	/** Grid/axis color */
	grid: string
}

/**
 * Get a color from the palette by index.
 * Wraps around if index exceeds palette length.
 */
export function getColorByIndex(colors: ChartColors, index: number): string {
	const palette =
		colors.seriesPalette && colors.seriesPalette.length > 0
			? colors.seriesPalette
			: [
					colors.primary,
					colors.secondary,
					colors.accent,
					colors.success,
					colors.warning,
					colors.info,
					colors.error,
				]
	return palette[index % palette.length]
}

/**
 * Hook to get resolved chart colors.
 *
 * Attempts to resolve CSS variables at runtime.
 * Falls back to static values if resolution fails.
 *
 * @example
 * ```tsx
 * function MyChart() {
 *   const colors = useChartColors()
 *   return <Bar fill={colors.primary} />
 * }
 * ```
 */
export function useChartColors(): ChartColors {
	// Start with fallback values
	const [colors, setColors] = useState<ChartColors>({
		primary: CHART_COLORS.primary,
		secondary: CHART_COLORS.secondary,
		accent: CHART_COLORS.accent,
		success: CHART_COLORS.success,
		warning: CHART_COLORS.warning,
		error: CHART_COLORS.error,
		info: CHART_COLORS.info,
		neutral: CHART_COLORS.neutral,
		seriesPalette: undefined,
		background: '#ffffff',
		text: '#1f2937',
		textMuted: '#6b7280',
		grid: '#e5e7eb',
	})

	useEffect(() => {
		// Only run on client
		if (typeof window === 'undefined') return

		const resolveOklchColor = (cssVar: string): string | null => {
			try {
				const root = document.documentElement
				const computed = getComputedStyle(root)
				const value = computed.getPropertyValue(cssVar).trim()

				if (!value) return null

				// Convert oklch values to CSS string
				return `oklch(${value})`
			} catch {
				return null
			}
		}

		const resolvedColors: ChartColors = {
			primary: resolveOklchColor('--p') ?? CHART_COLORS.primary,
			secondary: resolveOklchColor('--s') ?? CHART_COLORS.secondary,
			accent: resolveOklchColor('--a') ?? CHART_COLORS.accent,
			success: resolveOklchColor('--su') ?? CHART_COLORS.success,
			warning: resolveOklchColor('--wa') ?? CHART_COLORS.warning,
			error: resolveOklchColor('--er') ?? CHART_COLORS.error,
			info: resolveOklchColor('--in') ?? CHART_COLORS.info,
			neutral: CHART_COLORS.neutral,
			seriesPalette: resolveSeriesPalette(),
			background: resolveOklchColor('--b1') ?? '#ffffff',
			text: resolveOklchColor('--bc') ?? '#1f2937',
			textMuted: resolveOklchColor('--bc') ? `oklch(${getComputedStyle(document.documentElement).getPropertyValue('--bc').trim()} / 0.6)` : '#6b7280',
			grid: resolveOklchColor('--bc') ? `oklch(${getComputedStyle(document.documentElement).getPropertyValue('--bc').trim()} / 0.1)` : '#e5e7eb',
		}

		setColors(resolvedColors)

		// Listen for theme changes
		const observer = new MutationObserver(() => {
			const newColors: ChartColors = {
				primary: resolveOklchColor('--p') ?? CHART_COLORS.primary,
				secondary: resolveOklchColor('--s') ?? CHART_COLORS.secondary,
				accent: resolveOklchColor('--a') ?? CHART_COLORS.accent,
				success: resolveOklchColor('--su') ?? CHART_COLORS.success,
				warning: resolveOklchColor('--wa') ?? CHART_COLORS.warning,
				error: resolveOklchColor('--er') ?? CHART_COLORS.error,
				info: resolveOklchColor('--in') ?? CHART_COLORS.info,
				neutral: CHART_COLORS.neutral,
				seriesPalette: resolveSeriesPalette(),
				background: resolveOklchColor('--b1') ?? '#ffffff',
				text: resolveOklchColor('--bc') ?? '#1f2937',
				textMuted: resolveOklchColor('--bc') ? `oklch(${getComputedStyle(document.documentElement).getPropertyValue('--bc').trim()} / 0.6)` : '#6b7280',
				grid: resolveOklchColor('--bc') ? `oklch(${getComputedStyle(document.documentElement).getPropertyValue('--bc').trim()} / 0.1)` : '#e5e7eb',
			}
			setColors(newColors)
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'class'],
		})

		return () => observer.disconnect()
	}, [])

	return colors
}

function resolveSeriesPalette(): string[] | undefined {
	if (typeof window === 'undefined') return undefined
	const computed = getComputedStyle(document.documentElement)
	const palette = []

	for (let i = 1; i <= 7; i++) {
		const value = computed.getPropertyValue(`--chart-series-${i}`).trim()
		if (value) {
			palette.push(value)
		}
	}

	return palette.length > 0 ? palette : undefined
}

/**
 * Generate a color palette for multi-series charts.
 *
 * @param count - Number of colors needed
 * @param colors - Chart colors object
 */
export function generatePalette(count: number, colors: ChartColors): string[] {
	const basePalette =
		colors.seriesPalette && colors.seriesPalette.length > 0
			? colors.seriesPalette
			: [
					colors.primary,
					colors.secondary,
					colors.accent,
					colors.success,
					colors.warning,
					colors.info,
					colors.error,
				]

	if (count <= basePalette.length) {
		return basePalette.slice(0, count)
	}

	// If more colors needed, cycle through palette
	const result: string[] = []
	for (let i = 0; i < count; i++) {
		result.push(basePalette[i % basePalette.length])
	}
	return result
}
