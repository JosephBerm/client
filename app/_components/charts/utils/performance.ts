/**
 * Chart Performance Utilities
 *
 * Utilities for optimizing chart performance with large datasets.
 *
 * @module charts/utils/performance
 */

/**
 * Downsample time series data using LTTB (Largest Triangle Three Buckets) algorithm.
 * Preserves visual characteristics while reducing data points.
 *
 * @param data - Original data array
 * @param targetPoints - Target number of points
 * @param getX - Accessor for X value (typically date timestamp)
 * @param getY - Accessor for Y value
 * @returns Downsampled data array
 *
 * @example
 * ```ts
 * const downsampled = downsampleLTTB(
 *   largeDataset,
 *   100, // target 100 points
 *   d => new Date(d.date).getTime(),
 *   d => d.value
 * )
 * ```
 */
export function downsampleLTTB<T>(
	data: T[],
	targetPoints: number,
	getX: (d: T) => number,
	getY: (d: T) => number
): T[] {
	if (data.length <= targetPoints) {
		return data
	}

	const result: T[] = []

	// Always keep first point
	result.push(data[0])

	// Bucket size (minus 2 for first and last points)
	const bucketSize = (data.length - 2) / (targetPoints - 2)

	let a = 0 // Point selected from previous bucket

	for (let i = 0; i < targetPoints - 2; i++) {
		// Calculate bucket range
		const bucketStart = Math.floor((i + 1) * bucketSize) + 1
		const bucketEnd = Math.floor((i + 2) * bucketSize) + 1
		const actualBucketEnd = Math.min(bucketEnd, data.length - 1)

		// Calculate average point for next bucket (for area calculation)
		let avgX = 0
		let avgY = 0
		const nextBucketStart = Math.floor((i + 2) * bucketSize) + 1
		const nextBucketEnd = Math.floor((i + 3) * bucketSize) + 1
		const actualNextBucketEnd = Math.min(nextBucketEnd, data.length)
		let count = 0

		for (let j = nextBucketStart; j < actualNextBucketEnd; j++) {
			avgX += getX(data[j])
			avgY += getY(data[j])
			count++
		}

		if (count > 0) {
			avgX /= count
			avgY /= count
		}

		// Find point in current bucket with largest triangle area
		let maxArea = -1
		let maxAreaIndex = bucketStart

		const pointAX = getX(data[a])
		const pointAY = getY(data[a])

		for (let j = bucketStart; j < actualBucketEnd; j++) {
			// Calculate triangle area
			const area = Math.abs(
				(pointAX - avgX) * (getY(data[j]) - pointAY) -
				(pointAX - getX(data[j])) * (avgY - pointAY)
			) * 0.5

			if (area > maxArea) {
				maxArea = area
				maxAreaIndex = j
			}
		}

		result.push(data[maxAreaIndex])
		a = maxAreaIndex
	}

	// Always keep last point
	result.push(data[data.length - 1])

	return result
}

/**
 * Simple min-max downsampling that preserves peaks and valleys.
 * Faster than LTTB but less accurate for visual representation.
 *
 * @param data - Original data array
 * @param targetPoints - Target number of points (will be doubled for min/max pairs)
 * @param getValue - Accessor for the value to compare
 * @returns Downsampled data array
 */
export function downsampleMinMax<T>(
	data: T[],
	targetPoints: number,
	getValue: (d: T) => number
): T[] {
	if (data.length <= targetPoints) {
		return data
	}

	const result: T[] = []
	const bucketSize = Math.ceil(data.length / (targetPoints / 2))

	for (let i = 0; i < data.length; i += bucketSize) {
		const bucket = data.slice(i, Math.min(i + bucketSize, data.length))
		if (bucket.length === 0) continue

		// Find min and max in bucket
		let minItem = bucket[0]
		let maxItem = bucket[0]
		let minValue = getValue(bucket[0])
		let maxValue = getValue(bucket[0])

		for (const item of bucket) {
			const value = getValue(item)
			if (value < minValue) {
				minValue = value
				minItem = item
			}
			if (value > maxValue) {
				maxValue = value
				maxItem = item
			}
		}

		// Add min first, then max (preserves order)
		if (minItem !== maxItem) {
			result.push(minItem)
			result.push(maxItem)
		} else {
			result.push(minItem)
		}
	}

	return result
}

/**
 * Memoization helper for expensive chart data transformations.
 * Uses a simple LRU cache.
 *
 * @param fn - Function to memoize
 * @param maxSize - Maximum cache size
 * @returns Memoized function
 */
export function memoizeChartData<TArgs extends unknown[], TResult>(
	fn: (...args: TArgs) => TResult,
	maxSize: number = 10
): (...args: TArgs) => TResult {
	const cache = new Map<string, { value: TResult; timestamp: number }>()

	return (...args: TArgs): TResult => {
		const key = JSON.stringify(args)
		const cached = cache.get(key)

		if (cached) {
			// Move to end (most recently used)
			cache.delete(key)
			cache.set(key, cached)
			return cached.value
		}

		// Calculate new value
		const value = fn(...args)

		// Evict oldest if at capacity
		if (cache.size >= maxSize) {
			const oldestKey = cache.keys().next().value
			if (oldestKey) cache.delete(oldestKey)
		}

		cache.set(key, { value, timestamp: Date.now() })
		return value
	}
}

/**
 * Determine if data should be downsampled based on size and render target.
 *
 * @param dataLength - Number of data points
 * @param targetWidth - Chart width in pixels
 * @returns Whether to downsample and target point count
 */
export function shouldDownsample(
	dataLength: number,
	targetWidth: number
): { shouldDownsample: boolean; targetPoints: number } {
	// Rule: no more than 2 points per pixel
	const maxPoints = targetWidth * 2

	// Don't downsample if we're under the threshold
	if (dataLength <= maxPoints) {
		return { shouldDownsample: false, targetPoints: dataLength }
	}

	// Downsample to maxPoints
	return { shouldDownsample: true, targetPoints: maxPoints }
}

/**
 * Calculate performance metrics for chart rendering.
 *
 * @param startTime - Performance.now() at start of render
 * @returns Performance metrics object
 */
export function measureRenderPerformance(
	startTime: number
): {
	duration: number
	isWithinBudget: boolean
	budgetMs: number
} {
	const duration = performance.now() - startTime
	const budgetMs = 100 // 100ms render budget

	return {
		duration,
		isWithinBudget: duration < budgetMs,
		budgetMs,
	}
}

/**
 * Debounce function for resize/interaction handlers.
 *
 * @param fn - Function to debounce
 * @param wait - Wait time in ms
 * @returns Debounced function
 */
export function debounce<TArgs extends unknown[]>(
	fn: (...args: TArgs) => void,
	wait: number
): (...args: TArgs) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null

	return (...args: TArgs) => {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
		timeoutId = setTimeout(() => {
			fn(...args)
			timeoutId = null
		}, wait)
	}
}

/**
 * Throttle function for high-frequency events.
 *
 * @param fn - Function to throttle
 * @param limit - Minimum time between calls in ms
 * @returns Throttled function
 */
export function throttle<TArgs extends unknown[]>(
	fn: (...args: TArgs) => void,
	limit: number
): (...args: TArgs) => void {
	let lastRan = 0

	return (...args: TArgs) => {
		const now = Date.now()
		if (now - lastRan >= limit) {
			fn(...args)
			lastRan = now
		}
	}
}
