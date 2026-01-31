/**
 * Chart Hooks Tests
 *
 * Unit tests for chart custom hooks.
 *
 * @module charts/hooks.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'

import {
	getInnerDimensions,
	getResponsiveMargin,
	BREAKPOINTS,
	useChartColors,
	getColorByIndex,
} from '../hooks'
import { DEFAULT_MARGIN, MOBILE_MARGIN, COMPACT_MARGIN } from '../utils/constants'

describe('getInnerDimensions', () => {
	it('calculates inner dimensions with default margin', () => {
		const margin = { top: 20, right: 20, bottom: 40, left: 50 }
		const result = getInnerDimensions(500, 300, margin)

		expect(result.innerWidth).toBe(430) // 500 - 20 - 50
		expect(result.innerHeight).toBe(240) // 300 - 20 - 40
	})

	it('handles zero margin', () => {
		const margin = { top: 0, right: 0, bottom: 0, left: 0 }
		const result = getInnerDimensions(500, 300, margin)

		expect(result.innerWidth).toBe(500)
		expect(result.innerHeight).toBe(300)
	})

	it('handles large margins', () => {
		const margin = { top: 50, right: 50, bottom: 50, left: 50 }
		const result = getInnerDimensions(200, 200, margin)

		expect(result.innerWidth).toBe(100) // 200 - 50 - 50
		expect(result.innerHeight).toBe(100) // 200 - 50 - 50
	})

	it('returns non-negative dimensions when margin exceeds size', () => {
		const margin = { top: 200, right: 200, bottom: 200, left: 200 }
		const result = getInnerDimensions(100, 100, margin)

		expect(result.innerWidth).toBe(0)
		expect(result.innerHeight).toBe(0)
	})

	it('uses default margin when not provided', () => {
		const result = getInnerDimensions(500, 300)

		expect(result.innerWidth).toBe(500 - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right)
		expect(result.innerHeight).toBe(300 - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom)
	})
})

describe('getResponsiveMargin', () => {
	it('returns mobile margin on mobile', () => {
		const margin = getResponsiveMargin(true)
		expect(margin).toEqual(MOBILE_MARGIN)
	})

	it('returns default margin on desktop', () => {
		const margin = getResponsiveMargin(false)
		expect(margin).toEqual(DEFAULT_MARGIN)
	})

	it('returns compact margin when compact flag is true', () => {
		const margin = getResponsiveMargin(true, true)
		expect(margin).toEqual(COMPACT_MARGIN)
	})

	it('returns compact margin on desktop when compact is true', () => {
		const margin = getResponsiveMargin(false, true)
		expect(margin).toEqual(COMPACT_MARGIN)
	})
})

describe('BREAKPOINTS', () => {
	it('defines expected breakpoints', () => {
		expect(BREAKPOINTS).toHaveProperty('sm')
		expect(BREAKPOINTS).toHaveProperty('md')
		expect(BREAKPOINTS).toHaveProperty('lg')
		expect(BREAKPOINTS).toHaveProperty('xl')
	})

	it('has breakpoints in ascending order', () => {
		expect(BREAKPOINTS.sm).toBeLessThan(BREAKPOINTS.md)
		expect(BREAKPOINTS.md).toBeLessThan(BREAKPOINTS.lg)
		expect(BREAKPOINTS.lg).toBeLessThan(BREAKPOINTS.xl)
	})

	it('has reasonable breakpoint values', () => {
		expect(BREAKPOINTS.sm).toBe(640)
		expect(BREAKPOINTS.md).toBe(768)
		expect(BREAKPOINTS.lg).toBe(1024)
		expect(BREAKPOINTS.xl).toBe(1280)
	})
})

describe('useChartColors tenant palette', () => {
	const paletteVars = ['--chart-series-1', '--chart-series-2', '--chart-series-3']
	const paletteValues = ['#0f172a', '#0ea5e9', '#22c55e']

	beforeEach(() => {
		paletteVars.forEach((key, index) => {
			document.documentElement.style.setProperty(key, paletteValues[index])
		})
	})

	afterEach(() => {
		paletteVars.forEach((key) => {
			document.documentElement.style.removeProperty(key)
		})
	})

	it('uses tenant palette when CSS variables are set', () => {
		const { result } = renderHook(() => useChartColors())
		expect(result.current.seriesPalette).toEqual(paletteValues)
	})

	it('getColorByIndex prefers tenant palette', () => {
		const { result } = renderHook(() => useChartColors())
		const color = getColorByIndex(result.current, 1)
		expect(color).toBe(paletteValues[1])
	})
})
