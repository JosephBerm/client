/**
 * Color Variants - Theme-Aware DaisyUI Color System
 * 
 * **MAANG-Level Implementation**: Uses DaisyUI semantic colors that automatically
 * adapt to the selected theme (light, dark, corporate, sunset, winter, luxury).
 * 
 * **Why DaisyUI Semantic Colors?**
 * - Theme-aware: Colors change when user switches themes
 * - Consistent: Maintains brand identity across all pages
 * - Accessible: DaisyUI themes are designed for proper contrast
 * - Maintainable: Single source of truth for colors
 * 
 * **Tailwind CSS Purging Fix:**
 * This file also solves the CSS purging issue by using complete, static class names
 * that Tailwind can detect at build time.
 * - ❌ `text-${color}` (dynamic - gets purged in production)
 * - ✅ `text-primary` (static - preserved)
 * 
 * **DaisyUI Semantic Color Mapping:**
 * - `primary` - Main brand color (brand identity)
 * - `secondary` - Secondary brand color (supporting elements)
 * - `accent` - Accent/highlight color (call-to-actions)
 * - `success` - Positive/success states (green family)
 * - `warning` - Caution/forward-looking (amber/yellow family)
 * - `error` - Error/passion/heart (red family)
 * - `info` - Informational states (blue family)
 * - `neutral` - Neutral content (gray family)
 * 
 * @see https://daisyui.com/docs/colors/
 * @module components/landing/colorVariants
 */

/**
 * Available semantic color variants
 * 
 * These map to DaisyUI's semantic color system which adapts to themes.
 * Use these instead of raw Tailwind colors (blue-500, emerald-500, etc.)
 */
export type ColorVariant = 
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral'

/**
 * Color classes interface
 * 
 * All classes use DaisyUI semantic tokens that adapt to the current theme.
 */
export interface ColorClasses {
	/** Text color class (e.g., 'text-primary') */
	text: string
	/** Background color class with opacity for subtle backgrounds */
	bg: string
	/** Border color class with opacity */
	border: string
	/** Ring color class for focus states */
	ring: string
}

/**
 * Theme-aware color variant mapping
 * 
 * **IMPORTANT**: All class names are complete strings using DaisyUI semantic colors.
 * These automatically adapt to the current theme (light, dark, etc.)
 * 
 * **DO NOT** use raw Tailwind colors (blue-500, emerald-500) as they don't
 * follow the theme and will look the same regardless of theme selection.
 */
const colorVariants: Record<ColorVariant, ColorClasses> = {
	primary: {
		text: 'text-primary',
		bg: 'bg-primary/10',
		border: 'border-primary/20',
		ring: 'ring-primary/20',
	},
	secondary: {
		text: 'text-secondary',
		bg: 'bg-secondary/10',
		border: 'border-secondary/20',
		ring: 'ring-secondary/20',
	},
	accent: {
		text: 'text-accent',
		bg: 'bg-accent/10',
		border: 'border-accent/20',
		ring: 'ring-accent/20',
	},
	success: {
		text: 'text-success',
		bg: 'bg-success/10',
		border: 'border-success/20',
		ring: 'ring-success/20',
	},
	warning: {
		text: 'text-warning',
		bg: 'bg-warning/10',
		border: 'border-warning/20',
		ring: 'ring-warning/20',
	},
	error: {
		text: 'text-error',
		bg: 'bg-error/10',
		border: 'border-error/20',
		ring: 'ring-error/20',
	},
	info: {
		text: 'text-info',
		bg: 'bg-info/10',
		border: 'border-info/20',
		ring: 'ring-info/20',
	},
	neutral: {
		text: 'text-neutral',
		bg: 'bg-neutral/10',
		border: 'border-neutral/20',
		ring: 'ring-neutral/20',
	},
}

/**
 * Get theme-aware color classes for a semantic variant
 * 
 * Returns complete, static class names that:
 * 1. Are detected by Tailwind's scanner (no purging issues)
 * 2. Adapt to the current DaisyUI theme
 * 
 * @param variant - Semantic color variant name
 * @returns Color classes object with text, bg, border, and ring classes
 * 
 * @example
 * ```tsx
 * const { text, bg } = getColorClasses('primary')
 * // text = 'text-primary' (adapts to theme)
 * // bg = 'bg-primary/10' (subtle background, adapts to theme)
 * 
 * <div className={`${bg} ${text}`}>
 *   Theme-aware content
 * </div>
 * ```
 */
export function getColorClasses(variant: ColorVariant): ColorClasses {
	return colorVariants[variant]
}

/**
 * Check if a string is a valid color variant
 * 
 * @param value - String to check
 * @returns True if value is a valid ColorVariant
 */
export function isColorVariant(value: string): value is ColorVariant {
	return value in colorVariants
}

/**
 * All available color variants as an array
 * Useful for mapping/iteration in components
 */
export const ALL_COLOR_VARIANTS: ColorVariant[] = [
	'primary',
	'secondary', 
	'accent',
	'success',
	'warning',
	'error',
	'info',
	'neutral',
]

export default colorVariants
