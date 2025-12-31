/**
 * useFetchWithCache Hook - MAANG-Level Data Fetching
 *
 * Implements SWR (stale-while-revalidate) pattern for optimal data fetching.
 * Provides caching, automatic revalidation, and deduplication.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: SWR Pattern Implementation
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This hook implements the SWR caching strategy used by MAANG companies:
 *
 * 1. **Stale-While-Revalidate**: Returns cached data immediately, then
 *    revalidates in background
 * 2. **Request Deduplication**: Multiple components requesting same data
 *    share a single request
 * 3. **Smart Revalidation**: Automatic refresh on focus, reconnect, or interval
 * 4. **Error Retry**: Exponential backoff for failed requests
 *
 * WHY NOT USE SWR/React-Query DIRECTLY?
 *
 * - Keeps bundle size minimal (no additional dependencies)
 * - Integrates seamlessly with our HttpService
 * - Follows our PRD logging standards
 * - Optimized for our specific use cases
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch, isValidating } = useFetchWithCache(
 *   'rbac-overview',
 *   () => API.RBAC.getOverview(),
 *   {
 *     staleTime: 5 * 60 * 1000, // 5 minutes
 *     revalidateOnFocus: true,
 *   }
 * )
 * ```
 *
 * @module useFetchWithCache
 */

'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

import { logger } from '@_core'

// =========================================================================
// TYPES
// =========================================================================

export interface FetchWithCacheOptions<T> {
	/** Time in ms before cached data is considered stale (default: 5 min) */
	staleTime?: number
	/** Time in ms to keep data in cache (default: 30 min) */
	cacheTime?: number
	/** Revalidate when window regains focus */
	revalidateOnFocus?: boolean
	/** Revalidate when network reconnects */
	revalidateOnReconnect?: boolean
	/** Auto revalidate interval in ms (0 = disabled) */
	revalidateInterval?: number
	/** Retry failed requests */
	retry?: boolean | number
	/** Delay between retries in ms */
	retryDelay?: number
	/** Initial data before fetch completes */
	initialData?: T
	/** Don't fetch automatically (manual trigger only) */
	enabled?: boolean
	/** Called on successful fetch */
	onSuccess?: (data: T) => void
	/** Called on fetch error */
	onError?: (error: Error) => void
	/** Component name for logging */
	componentName?: string
}

export interface FetchWithCacheReturn<T> {
	/** The fetched/cached data */
	data: T | null
	/** True during initial load (no cached data) */
	isLoading: boolean
	/** True during background revalidation */
	isValidating: boolean
	/** Error from last fetch attempt */
	error: Error | null
	/** Manually trigger refetch */
	refetch: () => Promise<void>
	/** Clear cached data */
	invalidate: () => void
	/** True if data came from cache */
	isFromCache: boolean
}

interface CacheEntry<T> {
	data: T
	timestamp: number
	expiresAt: number
}

// =========================================================================
// CACHE STORE (Module-level singleton)
// =========================================================================

const cache = new Map<string, CacheEntry<unknown>>()
const pendingRequests = new Map<string, Promise<unknown>>()
const subscribers = new Map<string, Set<() => void>>()

/**
 * Get cached data if not expired
 */
function getCachedData<T>(key: string, _cacheTime: number): T | null {
	const entry = cache.get(key) as CacheEntry<T> | undefined
	if (!entry) {
		return null
	}

	// Check if expired
	if (Date.now() > entry.expiresAt) {
		cache.delete(key)
		return null
	}

	return entry.data
}

/**
 * Check if data is stale
 */
function isStale(key: string, staleTime: number): boolean {
	const entry = cache.get(key)
	if (!entry) {
		return true
	}
	return Date.now() - entry.timestamp > staleTime
}

/**
 * Set cache entry
 */
function setCachedData<T>(key: string, data: T, cacheTime: number): void {
	cache.set(key, {
		data,
		timestamp: Date.now(),
		expiresAt: Date.now() + cacheTime,
	})
	// Notify all subscribers
	subscribers.get(key)?.forEach((cb) => cb())
}

/**
 * Subscribe to cache updates
 */
function subscribe(key: string, callback: () => void): () => void {
	if (!subscribers.has(key)) {
		subscribers.set(key, new Set())
	}
	const keySubscribers = subscribers.get(key)
	if (keySubscribers) {
		keySubscribers.add(callback)
	}
	return () => {
		subscribers.get(key)?.delete(callback)
	}
}

// =========================================================================
// HOOK IMPLEMENTATION
// =========================================================================

export function useFetchWithCache<T>(
	key: string,
	fetcher: () => Promise<{ data: { statusCode: number; message?: string | null; payload?: T | null } }>,
	options: FetchWithCacheOptions<T> = {}
): FetchWithCacheReturn<T> {
	const {
		staleTime = 5 * 60 * 1000, // 5 minutes
		cacheTime = 30 * 60 * 1000, // 30 minutes
		revalidateOnFocus = true,
		revalidateOnReconnect = true,
		revalidateInterval = 0,
		retry = 3,
		retryDelay = 1000,
		initialData,
		enabled = true,
		onSuccess,
		onError,
		componentName = 'useFetchWithCache',
	} = options

	// State
	const [data, setData] = useState<T | null>(() => {
		const cached = getCachedData<T>(key, cacheTime)
		return cached ?? initialData ?? null
	})
	const [isLoading, setIsLoading] = useState(!data && enabled)
	const [isValidating, setIsValidating] = useState(false)
	const [error, setError] = useState<Error | null>(null)
	const [isFromCache, setIsFromCache] = useState(!!getCachedData(key, cacheTime))

	// Refs
	const retryCountRef = useRef(0)
	const mountedRef = useRef(true)

	// Fetch function with deduplication
	const doFetch = useCallback(
		async (isBackground = false) => {
			// Check for pending request
			const pending = pendingRequests.get(key)
			if (pending) {
				try {
					const result = (await pending) as T
					if (mountedRef.current) {
						setData(result)
						setIsFromCache(false)
					}
					return
				} catch {
					// Continue with new fetch
				}
			}

			if (!isBackground) {
				setIsLoading(true)
			}
			setIsValidating(true)
			setError(null)

			const fetchPromise = (async () => {
				const maxRetries = typeof retry === 'number' ? retry : retry ? 3 : 0

				for (let attempt = 0; attempt <= maxRetries; attempt++) {
					try {
						const response = await fetcher()

						// Check for successful response (2xx status codes)
						const isSuccess = response.data.statusCode >= 200 && response.data.statusCode < 300

						if (isSuccess && response.data.payload !== undefined) {
							const result = response.data.payload as T
							setCachedData(key, result, cacheTime)
							retryCountRef.current = 0

							logger.debug(`Data fetched successfully`, {
								component: componentName,
								action: 'fetch',
								key,
								fromCache: false,
							})

							return result
						}

						// Propagate actual API error message instead of generic error
						const errorMessage = response.data.message 
							|| `Request failed with status ${response.data.statusCode}`
						throw new Error(errorMessage)
					} catch (err) {
						if (attempt < maxRetries) {
							await new Promise((r) => setTimeout(r, retryDelay * Math.pow(2, attempt)))
							continue
						}
						throw err
					}
				}
			})()

			pendingRequests.set(key, fetchPromise)

			try {
				const result = await fetchPromise
				if (mountedRef.current) {
					setData(result as T)
					setIsFromCache(false)
					onSuccess?.(result as T)
				}
			} catch (err) {
				const fetchError = err instanceof Error ? err : new Error('Fetch failed')
				if (mountedRef.current) {
					setError(fetchError)
					onError?.(fetchError)
				}
				logger.error(`Fetch failed`, {
					component: componentName,
					action: 'fetch',
					key,
					error: fetchError.message,
				})
			} finally {
				pendingRequests.delete(key)
				if (mountedRef.current) {
					setIsLoading(false)
					setIsValidating(false)
				}
			}
		},
		[key, fetcher, cacheTime, retry, retryDelay, onSuccess, onError, componentName]
	)

	// Refetch function
	const refetch = useCallback(async () => {
		await doFetch(false)
	}, [doFetch])

	// Invalidate cache
	const invalidate = useCallback(() => {
		cache.delete(key)
		setData(null)
		setIsFromCache(false)
	}, [key])

	// Initial fetch
	useEffect(() => {
		mountedRef.current = true

		if (!enabled) {
			return
		}

		// If we have cached data and it's not stale, use it
		const cached = getCachedData<T>(key, cacheTime)
		if (cached) {
			setData(cached)
			setIsFromCache(true)
			setIsLoading(false)

			// Revalidate in background if stale
			if (isStale(key, staleTime)) {
				void doFetch(true)
			}
		} else {
			void doFetch(false)
		}

		return () => {
			mountedRef.current = false
		}
	}, [key, enabled, cacheTime, staleTime, doFetch])

	// Subscribe to cache updates from other components
	useEffect(() => {
		return subscribe(key, () => {
			const cached = getCachedData<T>(key, cacheTime)
			if (cached && mountedRef.current) {
				setData(cached)
				setIsFromCache(true)
			}
		})
	}, [key, cacheTime])

	// Revalidate on focus
	useEffect(() => {
		if (!revalidateOnFocus || typeof window === 'undefined') {
			return
		}

		const handleFocus = () => {
			if (isStale(key, staleTime)) {
				void doFetch(true)
			}
		}

		window.addEventListener('focus', handleFocus)
		return () => window.removeEventListener('focus', handleFocus)
	}, [key, staleTime, revalidateOnFocus, doFetch])

	// Revalidate on reconnect
	useEffect(() => {
		if (!revalidateOnReconnect || typeof window === 'undefined') {
			return
		}

		const handleOnline = () => {
			void doFetch(true)
		}

		window.addEventListener('online', handleOnline)
		return () => window.removeEventListener('online', handleOnline)
	}, [revalidateOnReconnect, doFetch])

	// Polling interval
	useEffect(() => {
		if (!revalidateInterval || revalidateInterval <= 0) {
			return
		}

		const interval = setInterval(() => {
			void doFetch(true)
		}, revalidateInterval)

		return () => clearInterval(interval)
	}, [revalidateInterval, doFetch])

	return useMemo(
		() => ({
			data,
			isLoading,
			isValidating,
			error,
			refetch,
			invalidate,
			isFromCache,
		}),
		[data, isLoading, isValidating, error, refetch, invalidate, isFromCache]
	)
}

// =========================================================================
// CACHE UTILITIES
// =========================================================================

/**
 * Prefetch data into cache
 */
export async function prefetch<T>(
	key: string,
	fetcher: () => Promise<{ data: { statusCode: number; message?: string | null; payload?: T | null } }>,
	cacheTime = 30 * 60 * 1000
): Promise<void> {
	try {
		const response = await fetcher()
		if (response.data.statusCode === 200 && response.data.payload) {
			setCachedData(key, response.data.payload, cacheTime)
		}
	} catch {
		// Prefetch failures are silent
	}
}

/**
 * Invalidate all cache entries matching a prefix
 */
export function invalidateCache(keyPrefix?: string): void {
	if (!keyPrefix) {
		cache.clear()
		return
	}

	for (const key of cache.keys()) {
		if (key.startsWith(keyPrefix)) {
			cache.delete(key)
		}
	}
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
	return {
		size: cache.size,
		keys: Array.from(cache.keys()),
	}
}

export default useFetchWithCache

