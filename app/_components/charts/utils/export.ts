/**
 * Chart Export Utilities
 *
 * Utilities for exporting chart data and images.
 *
 * @module charts/utils/export
 */

/**
 * Export chart data to CSV format.
 *
 * @param data - Array of data objects
 * @param columns - Column definitions with key and header
 * @param filename - Output filename (without extension)
 *
 * @example
 * ```ts
 * exportToCSV(
 *   revenueData,
 *   [
 *     { key: 'date', header: 'Date' },
 *     { key: 'revenue', header: 'Revenue' },
 *     { key: 'orderCount', header: 'Orders' },
 *   ],
 *   'revenue-report'
 * )
 * ```
 */
export function exportToCSV<T extends Record<string, unknown>>(
	data: T[],
	columns: Array<{ key: keyof T; header: string }>,
	filename: string
): void {
	// Build CSV content
	const headers = columns.map((col) => escapeCSVValue(col.header)).join(',')
	const rows = data.map((row) =>
		columns
			.map((col) => {
				const value = row[col.key]
				return escapeCSVValue(formatCSVValue(value))
			})
			.join(',')
	)

	const csvContent = [headers, ...rows].join('\n')

	// Create blob and download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	downloadBlob(blob, `${filename}.csv`)
}

/**
 * Export SVG chart to PNG image.
 *
 * @param svgElement - SVG element to export
 * @param filename - Output filename (without extension)
 * @param options - Export options
 *
 * @example
 * ```ts
 * const svg = document.querySelector('svg')
 * await exportToPNG(svg, 'revenue-chart', { scale: 2 })
 * ```
 */
export async function exportToPNG(
	svgElement: SVGElement,
	filename: string,
	options: {
		/** Scale factor (2 = 2x resolution) */
		scale?: number
		/** Background color */
		backgroundColor?: string
	} = {}
): Promise<void> {
	const { scale = 2, backgroundColor = '#ffffff' } = options

	// Get SVG dimensions
	const bbox = svgElement.getBoundingClientRect()
	const width = bbox.width * scale
	const height = bbox.height * scale

	// Clone SVG and inline styles
	const svgClone = svgElement.cloneNode(true) as SVGElement
	inlineStyles(svgElement, svgClone)

	// Serialize SVG to string
	const serializer = new XMLSerializer()
	const svgString = serializer.serializeToString(svgClone)

	// Create canvas
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height

	const ctx = canvas.getContext('2d')
	if (!ctx) {
		throw new Error('Failed to get canvas context')
	}

	// Fill background
	ctx.fillStyle = backgroundColor
	ctx.fillRect(0, 0, width, height)

	// Load SVG as image
	const img = new Image()
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(svgBlob)

	return new Promise((resolve, reject) => {
		img.onload = () => {
			ctx.drawImage(img, 0, 0, width, height)
			URL.revokeObjectURL(url)

			// Convert to PNG
			canvas.toBlob(
				(blob) => {
					if (blob) {
						downloadBlob(blob, `${filename}.png`)
						resolve()
					} else {
						reject(new Error('Failed to create PNG blob'))
					}
				},
				'image/png',
				1.0
			)
		}
		img.onerror = () => {
			URL.revokeObjectURL(url)
			reject(new Error('Failed to load SVG image'))
		}
		img.src = url
	})
}

/**
 * Export SVG chart directly.
 *
 * @param svgElement - SVG element to export
 * @param filename - Output filename (without extension)
 */
export function exportToSVG(svgElement: SVGElement, filename: string): void {
	// Clone and inline styles
	const svgClone = svgElement.cloneNode(true) as SVGElement
	inlineStyles(svgElement, svgClone)

	// Add XML declaration
	const serializer = new XMLSerializer()
	const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(svgClone)

	const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
	downloadBlob(blob, `${filename}.svg`)
}

/**
 * Copy chart data to clipboard as tab-separated values.
 * Can be pasted directly into Excel/Sheets.
 *
 * @param data - Array of data objects
 * @param columns - Column definitions
 */
export async function copyToClipboard<T extends Record<string, unknown>>(
	data: T[],
	columns: Array<{ key: keyof T; header: string }>
): Promise<void> {
	const headers = columns.map((col) => col.header).join('\t')
	const rows = data.map((row) =>
		columns.map((col) => formatCSVValue(row[col.key])).join('\t')
	)

	const content = [headers, ...rows].join('\n')

	await navigator.clipboard.writeText(content)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Escape CSV value to handle commas, quotes, and newlines.
 */
function escapeCSVValue(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`
	}
	return value
}

/**
 * Format value for CSV output.
 */
function formatCSVValue(value: unknown): string {
	if (value === null || value === undefined) {
		return ''
	}
	if (value instanceof Date) {
		return value.toISOString()
	}
	if (typeof value === 'number') {
		return value.toString()
	}
	return String(value)
}

/**
 * Download blob as file.
 */
function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

/**
 * Inline computed styles from source to target element.
 * Needed for SVG export to preserve styling.
 */
function inlineStyles(source: Element, target: Element): void {
	const computedStyle = window.getComputedStyle(source)

	// Copy relevant style properties
	const styleProps = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'opacity']

	styleProps.forEach((prop) => {
		const value = computedStyle.getPropertyValue(prop)
		if (value) {
			;(target as HTMLElement).style.setProperty(prop, value)
		}
	})

	// Recursively process children
	const sourceChildren = source.children
	const targetChildren = target.children

	for (let i = 0; i < sourceChildren.length; i++) {
		if (targetChildren[i]) {
			inlineStyles(sourceChildren[i], targetChildren[i])
		}
	}
}
