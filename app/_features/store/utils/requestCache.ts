/**
 * Global Request Cache for API Call Deduplication
 * 
 * **FAANG-Level Pattern:**
 * - Netflix: Request deduplication cache
 * - Meta: Singleton pattern for data fetching
 * - Airbnb: Global request state management
 * 
 * **Problem This Solves:**
 * - React 18 Strict Mode double-invocation in development
 * - Component remounts during navigation
 * - Multiple instances of the same component
 * - Hot module reload in development
 * 
 * **How It Works:**
 * 1. Cache stores in-flight requests by cache key
 * 2. Duplicate requests return the same Promise
 * 3. Completed requests are cached for a short time (prevents rapid re-fetches)
 * 4. Failed requests are NOT cached (allows retry)
 * 
 * **Industry References:**
 * - React Query's query cache
 * - SWR's global cache
 * - Apollo Client's normalized cache
 * 
 * @module RequestCache
 */

import { logger } from '@_core'

interface CacheEntry<T> {
	/** The promise of the in-flight request */
	promise: Promise<T>
	/** Timestamp when request started */
	timestamp: number
	/** Status of the request */
	status: 'pending' | 'success' | 'error'
	/** Cached result (if successful) */
	result?: T
	/** AbortController for cancellation */
	controller: AbortController
}

/**
 * Global Request Cache Singleton
 * Persists across component mounts/unmounts
 * 
 * **CRITICAL:** This is intentionally a module-level singleton
 * NOT a React state or context - it survives component lifecycles
 */
class RequestCacheManager {
	private cache = new Map<string, CacheEntry<any>>()
	private readonly CACHE_TTL = 1000 // 1 second - prevents rapid re-fetches
	private readonly MAX_CACHE_SIZE = 100 // Prevent memory leaks

	/**
	 * Execute a request with automatic deduplication
	 * 
	 * **Pattern:** Netflix request deduplication
	 * If same request is already in-flight, returns existing Promise
	 * If recent successful response exists, returns cached data
	 * 
	 * @param cacheKey - Unique identifier for this request
	 * @param requestFn - Function that makes the actual API call
	 * @param options - Configuration options
	 * @returns Promise with the response data
	 */
	async execute<T>(
		cacheKey: string,
		requestFn: (signal: AbortSignal) => Promise<T>,
		options: {
			/** Force fresh fetch, bypassing cache */
			forceFetch?: boolean
			/** Custom TTL for this request */
			ttl?: number
			/** Component name for logging */
			component?: string
		} = {}
	): Promise<T> {
		const { forceFetch = false, ttl = this.CACHE_TTL, component = 'Unknown' } = options

		// Clean up old entries periodically
		this.cleanup()

		const existing = this.cache.get(cacheKey)

		// Case 1: Request is currently in-flight - return existing Promise
		if (existing && existing.status === 'pending') {
			return existing.promise
		}

		// Case 2: Recent successful response exists and not forced - return cached
		if (
			existing &&
			existing.status === 'success' &&
			!forceFetch &&
			Date.now() - existing.timestamp < ttl &&
			existing.result !== undefined
		) {
			return Promise.resolve(existing.result)
		}

		// Case 3: Make new request
		// Cancel previous request if it exists (shouldn't happen, but be safe)
		if (existing) {
			existing.controller.abort()
		}

		const controller = new AbortController()

		// Create the promise and store it immediately
		const promise = requestFn(controller.signal)
			.then((result) => {
				// Update cache with success
				const entry = this.cache.get(cacheKey)
				if (entry) {
					entry.status = 'success'
					entry.result = result
				}
				return result
			})
			.catch((error) => {
				// Remove from cache on error (allows retry)
				this.cache.delete(cacheKey)
				throw error
			})

		// Store in cache
		this.cache.set(cacheKey, {
			promise,
			timestamp: Date.now(),
			status: 'pending',
			controller,
		})

		return promise
	}

	/**
	 * Manually invalidate a cache entry
	 * Useful when you know data has changed
	 */
	invalidate(cacheKey: string): void {
		const entry = this.cache.get(cacheKey)
		if (entry) {
			entry.controller.abort()
			this.cache.delete(cacheKey)
		}
	}

	/**
	 * Clear entire cache
	 * Useful for logout or major state changes
	 */
	clear(): void {
		// Abort all in-flight requests
		this.cache.forEach((entry) => {
			entry.controller.abort()
		})
		
		this.cache.clear()
	}

	/**
	 * Get cache statistics (for debugging)
	 */
	getStats() {
		const entries = Array.from(this.cache.entries())
		return {
			totalEntries: entries.length,
			pending: entries.filter(([, e]) => e.status === 'pending').length,
			success: entries.filter(([, e]) => e.status === 'success').length,
			error: entries.filter(([, e]) => e.status === 'error').length,
			oldestEntry: entries.length > 0
				? Math.min(...entries.map(([, e]) => Date.now() - e.timestamp))
				: 0,
		}
	}

	/**
	 * Clean up old cache entries
	 * Prevents memory leaks
	 */
	private cleanup(): void {
		// Remove entries older than 5 minutes
		const MAX_AGE = 5 * 60 * 1000
		const now = Date.now()
		
		const toDelete: string[] = []
		this.cache.forEach((entry, key) => {
			if (now - entry.timestamp > MAX_AGE) {
				toDelete.push(key)
			}
		})
		
		toDelete.forEach((key) => {
			const entry = this.cache.get(key)
			if (entry) {
				entry.controller.abort()
			}
			this.cache.delete(key)
		})

		// If still too many entries, remove oldest
		if (this.cache.size > this.MAX_CACHE_SIZE) {
			const entries = Array.from(this.cache.entries())
			entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
			
			const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE)
			toRemove.forEach(([key, entry]) => {
				entry.controller.abort()
				this.cache.delete(key)
			})
		}
	}
}

/**
 * Global singleton instance
 * This persists across component mounts/unmounts
 * 
 * **FAANG Pattern:** Single source of truth for request state
 */
export const requestCache = new RequestCacheManager()

/**
 * Helper to create cache keys
 * Ensures consistency across the app
 */
export function createCacheKey(endpoint: string, params: Record<string, any> = {}): string {
	const sortedParams = Object.keys(params)
		.sort()
		.map((key) => `${key}:${JSON.stringify(params[key])}`)
		.join('|')
	
	return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`
}

// Export debug helper for browser console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
	// @ts-ignore
	window.requestCache = {
		getStats: () => requestCache.getStats(),
		clear: () => requestCache.clear(),
		invalidate: (key: string) => requestCache.invalidate(key),
	}
}

