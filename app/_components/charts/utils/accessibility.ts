/**
 * Chart Accessibility Utilities
 *
 * Utilities for WCAG 2.1 AA compliance in charts.
 *
 * @module charts/utils/accessibility
 */

/**
 * Generate accessible data table from chart data.
 * Provides screen reader alternative to visual chart.
 *
 * @param data - Chart data array
 * @param columns - Column definitions
 * @returns HTML table string
 */
export function generateDataTable<T>(
	data: T[],
	columns: Array<{
		key: keyof T
		label: string
		format?: (value: unknown) => string
	}>
): string {
	const headerRow = columns.map((col) => `<th scope="col">${col.label}</th>`).join('')

	const bodyRows = data
		.map((row) => {
			const cells = columns
				.map((col) => {
					const value = row[col.key]
					const formatted = col.format ? col.format(value) : String(value)
					return `<td>${formatted}</td>`
				})
				.join('')
			return `<tr>${cells}</tr>`
		})
		.join('')

	return `
    <table class="sr-only">
      <caption>Data table alternative to chart</caption>
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `.trim()
}

/**
 * Generate screen reader summary for chart.
 *
 * @param chartType - Type of chart
 * @param dataPoints - Number of data points
 * @param summary - Key insights
 */
export function generateChartSummary(
	chartType: string,
	dataPoints: number,
	summary: {
		min?: { label: string; value: string }
		max?: { label: string; value: string }
		total?: string
		trend?: 'increasing' | 'decreasing' | 'stable'
	}
): string {
	const parts = [`${chartType} with ${dataPoints} data points.`]

	if (summary.max) {
		parts.push(`Highest value: ${summary.max.value} at ${summary.max.label}.`)
	}
	if (summary.min) {
		parts.push(`Lowest value: ${summary.min.value} at ${summary.min.label}.`)
	}
	if (summary.total) {
		parts.push(`Total: ${summary.total}.`)
	}
	if (summary.trend) {
		parts.push(`Overall trend is ${summary.trend}.`)
	}

	return parts.join(' ')
}

/**
 * Check if colors meet WCAG contrast requirements.
 * Requires contrast ratio of 4.5:1 for normal text, 3:1 for large text.
 *
 * Note: This is a simplified check. For production, use a proper color library.
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns Whether contrast meets minimum requirement
 */
export function meetsContrastRequirement(
	foreground: string,
	background: string
): boolean {
	const getLuminance = (hex: string): number => {
		const rgb = hexToRgb(hex)
		if (!rgb) return 0

		const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
			v /= 255
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
		})

		return 0.2126 * r + 0.7152 * g + 0.0722 * b
	}

	const l1 = getLuminance(foreground)
	const l2 = getLuminance(background)

	const lighter = Math.max(l1, l2)
	const darker = Math.min(l1, l2)

	const contrastRatio = (lighter + 0.05) / (darker + 0.05)

	// WCAG AA requires 4.5:1 for normal text
	return contrastRatio >= 4.5
}

/**
 * Convert hex color to RGB.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null
}

/**
 * Generate ARIA attributes for chart elements.
 */
export function getChartAriaAttributes(options: {
	chartId: string
	title: string
	description?: string
	isInteractive?: boolean
}): Record<string, string> {
	const attrs: Record<string, string> = {
		role: 'img',
		'aria-labelledby': `${options.chartId}-title`,
	}

	if (options.description) {
		attrs['aria-describedby'] = `${options.chartId}-desc`
	}

	if (options.isInteractive) {
		attrs.role = 'application'
		attrs['aria-roledescription'] = 'interactive chart'
	}

	return attrs
}

/**
 * Generate keyboard navigation instructions for interactive charts.
 */
export function getKeyboardInstructions(): string {
	return `
    Use arrow keys to navigate between data points.
    Press Enter or Space to select a data point.
    Press Escape to exit chart navigation.
    Press Tab to move to the next interactive element.
  `.trim()
}

/**
 * Color-blind safe palette.
 * Designed to be distinguishable with common color vision deficiencies.
 */
export const COLOR_BLIND_SAFE_PALETTE = [
	'#0072B2', // Blue
	'#E69F00', // Orange
	'#009E73', // Teal
	'#CC79A7', // Pink
	'#F0E442', // Yellow
	'#56B4E9', // Sky blue
	'#D55E00', // Vermilion
] as const

/**
 * Pattern definitions for SVG charts (color-blind alternative).
 */
export const PATTERN_DEFINITIONS = [
	{ id: 'pattern-solid', type: 'solid' },
	{ id: 'pattern-diagonal', type: 'diagonal-lines' },
	{ id: 'pattern-dots', type: 'dots' },
	{ id: 'pattern-crosshatch', type: 'crosshatch' },
	{ id: 'pattern-horizontal', type: 'horizontal-lines' },
] as const

/**
 * Generate SVG pattern definition for color-blind accessibility.
 */
export function generatePatternDef(
	patternId: string,
	type: string,
	color: string
): string {
	switch (type) {
		case 'diagonal-lines':
			return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="${color}" strokeWidth="2"/>
        </pattern>
      `
		case 'dots':
			return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="2" fill="${color}"/>
        </pattern>
      `
		case 'crosshatch':
			return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M0,0 l8,8 M8,0 l-8,8" stroke="${color}" strokeWidth="1"/>
        </pattern>
      `
		case 'horizontal-lines':
			return `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="8" height="4">
          <line x1="0" y1="2" x2="8" y2="2" stroke="${color}" strokeWidth="2"/>
        </pattern>
      `
		default:
			return ''
	}
}
