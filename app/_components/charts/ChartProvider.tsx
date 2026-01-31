'use client'

/**
 * ChartProvider
 *
 * Context provider for chart theming and configuration.
 * Integrates with DaisyUI/Tailwind themes for consistent styling.
 *
 * @module charts/ChartProvider
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'

/**
 * Chart theme configuration.
 * Maps to DaisyUI CSS variables for seamless theming.
 */
export interface ChartTheme {
	colors: {
		/** Primary color for main data series */
		primary: string
		/** Secondary color for comparison data */
		secondary: string
		/** Accent color for highlights */
		accent: string
		/** Success color (positive trends) */
		success: string
		/** Warning color (caution states) */
		warning: string
		/** Error color (negative trends) */
		error: string
		/** Info color (neutral states) */
		info: string
		/** Base content color (text) */
		baseContent: string
		/** Muted content color (secondary text) */
		baseContentMuted: string
		/** Background color */
		base100: string
		/** Elevated background color */
		base200: string
		/** Card/surface background */
		base300: string
	}
	fonts: {
		/** Font family for labels and text */
		label: string
		/** Font family for numbers/values */
		value: string
	}
	spacing: {
		/** Chart padding/margin */
		chartPadding: number
		/** Gap between chart elements */
		elementGap: number
	}
	animation: {
		/** Default animation duration in ms */
		duration: number
		/** Whether animations are enabled */
		enabled: boolean
	}
}

/**
 * Default chart theme using DaisyUI CSS variables.
 * These resolve at runtime based on the active theme.
 */
const defaultTheme: ChartTheme = {
	colors: {
		primary: 'oklch(var(--p))',
		secondary: 'oklch(var(--s))',
		accent: 'oklch(var(--a))',
		success: 'oklch(var(--su))',
		warning: 'oklch(var(--wa))',
		error: 'oklch(var(--er))',
		info: 'oklch(var(--in))',
		baseContent: 'oklch(var(--bc))',
		baseContentMuted: 'oklch(var(--bc) / 0.6)',
		base100: 'oklch(var(--b1))',
		base200: 'oklch(var(--b2))',
		base300: 'oklch(var(--b3))',
	},
	fonts: {
		label: 'inherit',
		value: 'inherit',
	},
	spacing: {
		chartPadding: 16,
		elementGap: 8,
	},
	animation: {
		duration: 300,
		enabled: true,
	},
}

/**
 * Color palette for multi-series charts.
 * Designed for visual distinction and accessibility.
 */
export const chartColorPalette = [
	'oklch(var(--p))', // Primary
	'oklch(var(--s))', // Secondary
	'oklch(var(--a))', // Accent
	'oklch(var(--su))', // Success
	'oklch(var(--wa))', // Warning
	'oklch(var(--in))', // Info
	'oklch(var(--er))', // Error
] as const

interface ChartContextValue {
	theme: ChartTheme
	colorPalette: readonly string[]
}

const ChartContext = createContext<ChartContextValue | null>(null)

interface ChartProviderProps {
	children: ReactNode
	/** Override default theme */
	theme?: Partial<ChartTheme>
	/** Override color palette */
	colorPalette?: string[]
}

/**
 * Provider component for chart theming.
 *
 * @example
 * ```tsx
 * <ChartProvider>
 *   <AreaChart data={data} />
 * </ChartProvider>
 * ```
 */
export function ChartProvider({
	children,
	theme: themeOverride,
	colorPalette: paletteOverride,
}: ChartProviderProps) {
	const value = useMemo<ChartContextValue>(
		() => ({
			theme: {
				...defaultTheme,
				...themeOverride,
				colors: {
					...defaultTheme.colors,
					...themeOverride?.colors,
				},
				fonts: {
					...defaultTheme.fonts,
					...themeOverride?.fonts,
				},
				spacing: {
					...defaultTheme.spacing,
					...themeOverride?.spacing,
				},
				animation: {
					...defaultTheme.animation,
					...themeOverride?.animation,
				},
			},
			colorPalette: paletteOverride ?? chartColorPalette,
		}),
		[themeOverride, paletteOverride]
	)

	return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
}

/**
 * Hook to access chart theme and color palette.
 *
 * @example
 * ```tsx
 * function MyChart() {
 *   const { theme, colorPalette } = useChartTheme()
 *   return <Bar fill={colorPalette[0]} />
 * }
 * ```
 */
export function useChartTheme(): ChartContextValue {
	const context = useContext(ChartContext)

	// Return defaults if no provider (charts work standalone)
	if (!context) {
		return {
			theme: defaultTheme,
			colorPalette: chartColorPalette,
		}
	}

	return context
}

export { defaultTheme }
