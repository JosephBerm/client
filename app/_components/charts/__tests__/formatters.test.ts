/**
 * Formatter Utilities Tests
 *
 * Unit tests for chart formatting utilities.
 *
 * @module charts/utils/formatters.test
 */

import { describe, it, expect } from 'vitest'

import {
	formatCurrency,
	formatNumber,
	formatPercent,
	formatAxisDate,
	formatTooltipDate,
	formatTooltipValue,
	createYAxisFormatter,
	generateNiceTicks,
} from '../utils/formatters'

describe('formatCurrency', () => {
	it('formats millions with M suffix', () => {
		expect(formatCurrency(1_500_000)).toBe('$1.5M')
		expect(formatCurrency(2_000_000)).toBe('$2M')
	})

	it('formats thousands with K suffix', () => {
		expect(formatCurrency(45_300)).toBe('$45.3K')
		expect(formatCurrency(1_000)).toBe('$1K')
	})

	it('formats small values with decimals', () => {
		expect(formatCurrency(123)).toBe('$123.00')
		expect(formatCurrency(99.5)).toBe('$99.50')
	})

	it('handles zero', () => {
		expect(formatCurrency(0)).toBe('$0.00')
	})

	it('handles negative values', () => {
		expect(formatCurrency(-1_500_000)).toBe('-$1.5M')
		expect(formatCurrency(-45_300)).toBe('-$45.3K')
	})

	it('respects custom decimal places', () => {
		expect(formatCurrency(1_234_567, 2)).toBe('$1.23M')
		expect(formatCurrency(1_234_567, 0)).toBe('$1M')
	})
})

describe('formatNumber', () => {
	it('formats millions with M suffix', () => {
		expect(formatNumber(1_500_000)).toBe('1.5M')
		expect(formatNumber(2_000_000)).toBe('2M')
	})

	it('formats thousands with K suffix', () => {
		expect(formatNumber(45_300)).toBe('45.3K')
		expect(formatNumber(1_000)).toBe('1K')
	})

	it('formats small values as-is', () => {
		expect(formatNumber(123)).toBe('123')
		expect(formatNumber(999)).toBe('999')
	})

	it('handles zero', () => {
		expect(formatNumber(0)).toBe('0')
	})
})

describe('formatPercent', () => {
	it('formats basic percentage', () => {
		expect(formatPercent(15.5)).toBe('15.5%')
		expect(formatPercent(100)).toBe('100%')
	})

	it('handles showSign option', () => {
		expect(formatPercent(15.5, { showSign: true })).toBe('+15.5%')
		expect(formatPercent(-5.2, { showSign: true })).toBe('-5.2%')
		expect(formatPercent(0, { showSign: true })).toBe('0%')
	})

	it('handles custom decimals', () => {
		expect(formatPercent(15.567, { decimals: 2 })).toBe('15.57%')
		expect(formatPercent(15.567, { decimals: 0 })).toBe('16%')
	})

	it('handles zero and edge cases', () => {
		expect(formatPercent(0)).toBe('0%')
		expect(formatPercent(0.1)).toBe('0.1%')
	})
})

describe('formatAxisDate', () => {
	it('formats by day granularity', () => {
		const date = new Date('2024-01-15')
		expect(formatAxisDate(date, 'day')).toBe('Jan 15')
	})

	it('formats by week granularity', () => {
		const date = new Date('2024-01-15')
		expect(formatAxisDate(date, 'week')).toBe('Jan 15')
	})

	it('formats by month granularity', () => {
		const date = new Date('2024-01-15')
		expect(formatAxisDate(date, 'month')).toMatch(/Jan.?'?24/)
	})

	it('formats by year granularity', () => {
		const date = new Date('2024-01-15')
		expect(formatAxisDate(date, 'year')).toBe('2024')
	})

	it('handles string dates', () => {
		expect(formatAxisDate('2024-01-15', 'day')).toBe('Jan 15')
	})
})

describe('formatTooltipDate', () => {
	it('formats full date for tooltips', () => {
		const date = new Date('2024-01-15')
		const result = formatTooltipDate(date)
		expect(result).toContain('January')
		expect(result).toContain('15')
		expect(result).toContain('2024')
	})

	it('handles string dates', () => {
		const result = formatTooltipDate('2024-01-15')
		expect(result).toContain('January')
	})
})

describe('formatTooltipValue', () => {
	it('formats currency type', () => {
		expect(formatTooltipValue(1234.56, 'currency')).toBe('$1,234.56')
	})

	it('formats percent type', () => {
		expect(formatTooltipValue(15.5, 'percent')).toBe('15.5%')
	})

	it('formats number type with commas', () => {
		expect(formatTooltipValue(1234567, 'number')).toBe('1,234,567')
	})

	it('handles undefined type', () => {
		expect(formatTooltipValue(1234)).toBe('1,234')
	})
})

describe('createYAxisFormatter', () => {
	it('creates currency formatter for large values', () => {
		const formatter = createYAxisFormatter(1_500_000, 'currency')
		expect(formatter(1_000_000)).toBe('$1M')
	})

	it('creates number formatter for large values', () => {
		const formatter = createYAxisFormatter(1_500_000, 'number')
		expect(formatter(1_000_000)).toBe('1M')
	})

	it('creates percent formatter', () => {
		const formatter = createYAxisFormatter(100, 'percent')
		expect(formatter(50)).toBe('50%')
	})
})

describe('generateNiceTicks', () => {
	it('generates nice round tick values', () => {
		const ticks = generateNiceTicks(0, 100, 5)
		expect(ticks).toEqual([0, 25, 50, 75, 100])
	})

	it('handles minimum to maximum range', () => {
		const ticks = generateNiceTicks(10, 90, 5)
		expect(ticks[0]).toBeGreaterThanOrEqual(10)
		expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(90)
	})

	it('handles large values', () => {
		const ticks = generateNiceTicks(0, 1_000_000, 5)
		expect(ticks.length).toBeLessThanOrEqual(6)
		expect(ticks.every((t) => t % 200_000 === 0)).toBe(true)
	})

	it('handles small ranges', () => {
		const ticks = generateNiceTicks(0, 10, 5)
		expect(ticks.length).toBeLessThanOrEqual(6)
	})
})
