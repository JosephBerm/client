/**
 * Accessibility Utilities Tests
 *
 * Unit tests for chart accessibility utilities.
 *
 * @module charts/utils/accessibility.test
 */

import { describe, it, expect } from 'vitest'

import {
	generateDataTable,
	generateChartSummary,
	meetsContrastRequirement,
	getChartAriaAttributes,
	COLOR_BLIND_SAFE_PALETTE,
	generatePatternDef,
} from '../utils/accessibility'

describe('generateDataTable', () => {
	const testData = [
		{ date: '2024-01-01', revenue: 1000, orders: 10 },
		{ date: '2024-02-01', revenue: 1500, orders: 15 },
		{ date: '2024-03-01', revenue: 2000, orders: 20 },
	]

	it('generates valid HTML table structure', () => {
		const html = generateDataTable(testData, [
			{ key: 'date', label: 'Date' },
			{ key: 'revenue', label: 'Revenue' },
		])

		expect(html).toContain('<table')
		expect(html).toContain('</table>')
		expect(html).toContain('<thead>')
		expect(html).toContain('<tbody>')
		expect(html).toContain('<th')
		expect(html).toContain('<td')
	})

	it('includes all column headers', () => {
		const html = generateDataTable(testData, [
			{ key: 'date', label: 'Date' },
			{ key: 'revenue', label: 'Revenue' },
			{ key: 'orders', label: 'Orders' },
		])

		expect(html).toContain('Date')
		expect(html).toContain('Revenue')
		expect(html).toContain('Orders')
	})

	it('includes all data rows', () => {
		const html = generateDataTable(testData, [
			{ key: 'date', label: 'Date' },
			{ key: 'revenue', label: 'Revenue' },
		])

		expect(html).toContain('2024-01-01')
		expect(html).toContain('2024-02-01')
		expect(html).toContain('2024-03-01')
		expect(html).toContain('1000')
		expect(html).toContain('1500')
		expect(html).toContain('2000')
	})

	it('applies format function when provided', () => {
		const html = generateDataTable(testData, [
			{ key: 'revenue', label: 'Revenue', format: (v) => `$${v}` },
		])

		expect(html).toContain('$1000')
		expect(html).toContain('$1500')
		expect(html).toContain('$2000')
	})

	it('includes accessibility attributes', () => {
		const html = generateDataTable(testData, [{ key: 'date', label: 'Date' }])

		expect(html).toContain('scope="col"')
	})
})

describe('generateChartSummary', () => {
	it('generates summary with all metrics', () => {
		const summary = generateChartSummary('Area chart', 12, {
			min: { label: 'January', value: '$1,200' },
			max: { label: 'December', value: '$5,400' },
			total: '$45,000',
			trend: 'increasing',
		})

		expect(summary).toContain('Area chart')
		expect(summary).toContain('12 data points')
		expect(summary).toContain('$5,400')
		expect(summary).toContain('December')
		expect(summary).toContain('$1,200')
		expect(summary).toContain('January')
		expect(summary).toContain('$45,000')
		expect(summary).toContain('increasing')
	})

	it('handles decreasing trend', () => {
		const summary = generateChartSummary('Line chart', 10, {
			min: { label: 'Oct', value: '100' },
			max: { label: 'Jan', value: '500' },
			trend: 'decreasing',
		})

		expect(summary).toContain('decreasing')
	})

	it('handles stable trend', () => {
		const summary = generateChartSummary('Bar chart', 5, {
			min: { label: 'A', value: '100' },
			max: { label: 'B', value: '110' },
			trend: 'stable',
		})

		expect(summary).toContain('stable')
	})

	it('excludes optional total when not provided', () => {
		const summary = generateChartSummary('Chart', 5, {
			min: { label: 'A', value: '0' },
			max: { label: 'B', value: '100' },
		})

		expect(summary).not.toContain('Total:')
	})
})

describe('meetsContrastRequirement', () => {
	it('returns true for black on white', () => {
		expect(meetsContrastRequirement('#000000', '#ffffff')).toBe(true)
	})

	it('returns true for white on black', () => {
		expect(meetsContrastRequirement('#ffffff', '#000000')).toBe(true)
	})

	it('returns false for low contrast', () => {
		expect(meetsContrastRequirement('#cccccc', '#ffffff')).toBe(false)
	})

	it('returns true for high contrast colors', () => {
		// Navy on white should pass
		expect(meetsContrastRequirement('#000080', '#ffffff')).toBe(true)
	})
})

describe('getChartAriaAttributes', () => {
	it('returns required aria attributes', () => {
		const attrs = getChartAriaAttributes({
			chartId: 'revenue-chart',
			title: 'Revenue Trends',
		})

		expect(attrs.role).toBe('img')
		expect(attrs['aria-labelledby']).toContain('revenue-chart')
	})

	it('includes description when provided', () => {
		const attrs = getChartAriaAttributes({
			chartId: 'test-chart',
			title: 'Test',
			description: 'A test chart description',
		})

		expect(attrs['aria-describedby']).toContain('test-chart')
	})

	it('marks interactive charts appropriately', () => {
		const attrs = getChartAriaAttributes({
			chartId: 'interactive-chart',
			title: 'Interactive',
			isInteractive: true,
		})

		expect(attrs.role).toBe('application')
	})

	it('marks non-interactive charts appropriately', () => {
		const attrs = getChartAriaAttributes({
			chartId: 'static-chart',
			title: 'Static',
			isInteractive: false,
		})

		expect(attrs.role).toBe('img')
	})
})

describe('COLOR_BLIND_SAFE_PALETTE', () => {
	it('has 7 colors', () => {
		expect(COLOR_BLIND_SAFE_PALETTE).toHaveLength(7)
	})

	it('contains valid hex colors', () => {
		const hexRegex = /^#[0-9A-Fa-f]{6}$/
		COLOR_BLIND_SAFE_PALETTE.forEach((color) => {
			expect(color).toMatch(hexRegex)
		})
	})

	it('has no duplicate colors', () => {
		const unique = new Set(COLOR_BLIND_SAFE_PALETTE)
		expect(unique.size).toBe(COLOR_BLIND_SAFE_PALETTE.length)
	})
})

describe('generatePatternDef', () => {
	it('generates diagonal lines pattern', () => {
		const pattern = generatePatternDef('pattern-1', 'diagonal-lines', '#6366f1')

		expect(pattern).toContain('<pattern')
		expect(pattern).toContain('id="pattern-1"')
		expect(pattern).toContain('#6366f1')
	})

	it('generates dots pattern', () => {
		const pattern = generatePatternDef('pattern-2', 'dots', '#22c55e')

		expect(pattern).toContain('<pattern')
		expect(pattern).toContain('id="pattern-2"')
		expect(pattern).toContain('<circle')
	})

	it('generates crosshatch pattern', () => {
		const pattern = generatePatternDef('pattern-3', 'crosshatch', '#ef4444')

		expect(pattern).toContain('<pattern')
		expect(pattern).toContain('id="pattern-3"')
	})

	it('generates horizontal lines pattern', () => {
		const pattern = generatePatternDef('pattern-4', 'horizontal-lines', '#f59e0b')

		expect(pattern).toContain('<pattern')
		expect(pattern).toContain('id="pattern-4"')
	})

	it('returns empty string for unknown pattern type', () => {
		const pattern = generatePatternDef('pattern-5', 'unknown', '#000')
		expect(pattern).toBe('')
	})
})
