/**
 * Performance Utilities Tests
 *
 * Unit tests for chart performance optimization utilities.
 *
 * @module charts/utils/performance.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
	downsampleLTTB,
	memoizeChartData,
	debounce,
	shouldDownsample,
} from '../utils/performance'

describe('downsampleLTTB', () => {
	// Generate test data
	const generateData = (count: number) =>
		Array.from({ length: count }, (_, i) => ({
			x: i,
			y: Math.sin(i / 10) * 100 + Math.random() * 10,
		}))

	it('reduces data to target size', () => {
		const data = generateData(1000)
		const result = downsampleLTTB(data, 100, (d) => d.x, (d) => d.y)

		expect(result.length).toBe(100)
	})

	it('preserves first and last points', () => {
		const data = generateData(100)
		const result = downsampleLTTB(data, 20, (d) => d.x, (d) => d.y)

		expect(result[0]).toBe(data[0])
		expect(result[result.length - 1]).toBe(data[data.length - 1])
	})

	it('returns original data when below threshold', () => {
		const data = generateData(50)
		const result = downsampleLTTB(data, 100, (d) => d.x, (d) => d.y)

		expect(result.length).toBe(50)
		expect(result).toEqual(data)
	})

	it('handles empty array', () => {
		const result = downsampleLTTB([] as Array<{x: number, y: number}>, 100, (d) => d.x, (d) => d.y)
		expect(result).toEqual([])
	})

	it('handles single element', () => {
		const data = [{ x: 0, y: 0 }]
		const result = downsampleLTTB(data, 100, (d) => d.x, (d) => d.y)
		expect(result).toEqual(data)
	})

	it('handles two elements', () => {
		const data = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
		const result = downsampleLTTB(data, 100, (d) => d.x, (d) => d.y)
		expect(result).toEqual(data)
	})

	it('selects representative points', () => {
		// Create data with a clear peak
		const data = [
			{ x: 0, y: 0 },
			{ x: 1, y: 10 },
			{ x: 2, y: 100 }, // Peak
			{ x: 3, y: 10 },
			{ x: 4, y: 0 },
		]
		const result = downsampleLTTB(data, 3, (d) => d.x, (d) => d.y)

		// Should preserve the peak
		expect(result).toContainEqual({ x: 2, y: 100 })
	})
})

describe('memoizeChartData', () => {
	it('returns cached result for same input', () => {
		const expensiveComputation = vi.fn((data: number[]) => data.map((d) => d * 2))
		const memoized = memoizeChartData(expensiveComputation)

		const data = [1, 2, 3]
		const result1 = memoized(data)
		const result2 = memoized(data)

		expect(result1).toEqual(result2)
		expect(expensiveComputation).toHaveBeenCalledTimes(1)
	})

	it('recomputes for different input', () => {
		const expensiveComputation = vi.fn((data: number[]) => data.map((d) => d * 2))
		const memoized = memoizeChartData(expensiveComputation)

		memoized([1, 2, 3])
		memoized([4, 5, 6])

		expect(expensiveComputation).toHaveBeenCalledTimes(2)
	})

	it('evicts oldest entries when at capacity', () => {
		const computation = vi.fn((n: number) => n * 2)
		const memoized = memoizeChartData(computation, 3)

		memoized(1)
		memoized(2)
		memoized(3)
		memoized(4) // This should evict 1

		expect(computation).toHaveBeenCalledTimes(4)

		// Accessing 1 again should recompute
		memoized(1)
		expect(computation).toHaveBeenCalledTimes(5)
	})
})

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('delays function execution', () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 100)

		debounced()
		expect(fn).not.toHaveBeenCalled()

		vi.advanceTimersByTime(100)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('only executes once for rapid calls', () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 100)

		debounced()
		debounced()
		debounced()

		vi.advanceTimersByTime(100)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('resets timer on each call', () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 100)

		debounced()
		vi.advanceTimersByTime(50)
		debounced()
		vi.advanceTimersByTime(50)
		expect(fn).not.toHaveBeenCalled()

		vi.advanceTimersByTime(50)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})

describe('shouldDownsample', () => {
	it('returns false when data fits in chart width', () => {
		const result = shouldDownsample(100, 500) // 100 points for 500px
		expect(result.shouldDownsample).toBe(false)
		expect(result.targetPoints).toBe(100)
	})

	it('returns true when data exceeds 2 points per pixel', () => {
		const result = shouldDownsample(10000, 500) // 10000 points for 500px
		expect(result.shouldDownsample).toBe(true)
		expect(result.targetPoints).toBe(1000) // 500 * 2
	})

	it('uses 2 points per pixel rule', () => {
		// Exactly at threshold
		const result = shouldDownsample(1000, 500)
		expect(result.shouldDownsample).toBe(false)
		expect(result.targetPoints).toBe(1000)
	})

	it('returns correct target for large datasets', () => {
		const result = shouldDownsample(100000, 1920) // Full HD width
		expect(result.shouldDownsample).toBe(true)
		expect(result.targetPoints).toBe(3840) // 1920 * 2
	})
})
