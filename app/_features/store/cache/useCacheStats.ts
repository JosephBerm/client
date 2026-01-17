/**
 * useCacheStats Hook - Cache Observability
 *
 * Development/debugging hook for monitoring cache performance.
 * Provides real-time cache statistics and metrics.
 *
 * **MAANG Best Practice: Observability**
 * - Track cache hit rates to optimize caching strategy
 * - Monitor memory usage to prevent quota issues
 * - Log cache operations for debugging
 *
 * @module features/store/cache/useCacheStats
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { logger } from '@_core'

import { ProductCache } from './ProductCache'

/**
 * Cache statistics snapshot
 */
export interface CacheStatsSnapshot {
	/** Timestamp of snapshot */
	timestamp: number

	/** Product metadata cache stats */
	productCache: {
		size: number
		hits: number
		misses: number
		hitRate: number
	}

	/** Image cache stats */
	imageCache: {
		size: number
		hits: number
		misses: number
		hitRate: number
	}

	/** Service Worker cache stats (if available) */
	serviceWorkerCache?: {
		imageCacheSize: number
		staticCacheSize: number
	}

	/** Total evictions */
	evictions: number
}

/**
 * Hook options
 */
export interface UseCacheStatsOptions {
	/** Enable automatic polling (default: false in production) */
	enablePolling?: boolean
	/** Polling interval in ms (default: 5000) */
	pollInterval?: number
	/** Log stats to console (default: development only) */
	logStats?: boolean
}

/**
 * useCacheStats Hook
 *
 * Monitor cache performance in development or production debugging.
 *
 * @example
 * ```tsx
 * function CacheDebugPanel() {
 *   const { stats, refresh } = useCacheStats({ enablePolling: true })
 *
 *   return (
 *     <div>
 *       <p>Product Cache Hit Rate: {(stats.productCache.hitRate * 100).toFixed(1)}%</p>
 *       <p>Image Cache Size: {stats.imageCache.size}</p>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useCacheStats(options: UseCacheStatsOptions = {}) {
	const {
		enablePolling = process.env.NODE_ENV === 'development',
		pollInterval = 5000,
		logStats = process.env.NODE_ENV === 'development',
	} = options

	const [stats, setStats] = useState<CacheStatsSnapshot | null>(null)

	/**
	 * Collect cache statistics
	 */
	const collectStats = useCallback(async (): Promise<CacheStatsSnapshot> => {
		const productStats = ProductCache.getStats()

		// Try to get Service Worker cache stats
		let swStats: CacheStatsSnapshot['serviceWorkerCache'] | undefined
		if (typeof window !== 'undefined' && 'caches' in window) {
			try {
				const cacheNames = await caches.keys()
				const imageCacheName = cacheNames.find(name => name.includes('images'))
				const staticCacheName = cacheNames.find(name => name.includes('static'))

				let imageCacheSize = 0
				let staticCacheSize = 0

				if (imageCacheName) {
					const cache = await caches.open(imageCacheName)
					const keys = await cache.keys()
					imageCacheSize = keys.length
				}

				if (staticCacheName) {
					const cache = await caches.open(staticCacheName)
					const keys = await cache.keys()
					staticCacheSize = keys.length
				}

				swStats = { imageCacheSize, staticCacheSize }
			} catch {
				// Service Worker cache access failed (expected in some contexts)
			}
		}

		const snapshot: CacheStatsSnapshot = {
			timestamp: Date.now(),
			productCache: {
				size: productStats.productCacheSize,
				hits: productStats.productHits,
				misses: productStats.productMisses,
				hitRate: productStats.productHitRate,
			},
			imageCache: {
				size: productStats.imageCacheSize,
				hits: productStats.imageHits,
				misses: productStats.imageMisses,
				hitRate: productStats.imageHitRate,
			},
			serviceWorkerCache: swStats,
			evictions: productStats.evictions,
		}

		return snapshot
	}, [])

	/**
	 * Refresh stats manually
	 */
	const refresh = useCallback(async () => {
		const newStats = await collectStats()
		setStats(newStats)

		if (logStats) {
			logger.debug('[CacheStats] Updated', {
				productCache: `${newStats.productCache.size} items, ${(newStats.productCache.hitRate * 100).toFixed(1)}% hit rate`,
				imageCache: `${newStats.imageCache.size} items, ${(newStats.imageCache.hitRate * 100).toFixed(1)}% hit rate`,
				swCache: newStats.serviceWorkerCache
					? `${newStats.serviceWorkerCache.imageCacheSize} images, ${newStats.serviceWorkerCache.staticCacheSize} static`
					: 'N/A',
				evictions: newStats.evictions,
			})
		}

		return newStats
	}, [collectStats, logStats])

	/**
	 * Clear all caches
	 */
	const clearAll = useCallback(async () => {
		ProductCache.clear()

		// Clear Service Worker caches
		if (typeof window !== 'undefined' && 'caches' in window) {
			try {
				const cacheNames = await caches.keys()
				await Promise.all(
					cacheNames.map(async (name) => caches.delete(name))
				)
			} catch {
				// Ignore errors
			}
		}

		logger.info('[CacheStats] All caches cleared')
		await refresh()
	}, [refresh])

	// Initial load and polling
	useEffect(() => {
		void refresh()

		if (enablePolling) {
			const interval = setInterval(() => {
				void refresh()
			}, pollInterval)

			return () => clearInterval(interval)
		}
	}, [enablePolling, pollInterval, refresh])

	return {
		stats,
		refresh,
		clearAll,
	}
}

/**
 * Log cache performance summary
 * Call this periodically or on key events
 */
export function logCachePerformance(): void {
	const stats = ProductCache.getStats()

	logger.info('[CachePerformance] Summary', {
		productCache: {
			size: stats.productCacheSize,
			hitRate: `${(stats.productHitRate * 100).toFixed(1)}%`,
			hits: stats.productHits,
			misses: stats.productMisses,
		},
		imageCache: {
			size: stats.imageCacheSize,
			hitRate: `${(stats.imageHitRate * 100).toFixed(1)}%`,
			hits: stats.imageHits,
			misses: stats.imageMisses,
		},
		evictions: stats.evictions,
	})
}

/**
 * Add to window for console debugging
 */
if (typeof window !== 'undefined') {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).cacheDebug = {
		getStats: () => ProductCache.getStats(),
		clearProductCache: () => ProductCache.clear(),
		clearImageCache: () => ProductCache.clearImages(),
		logPerformance: logCachePerformance,
		help: () => {
			logger.info('[CacheDebug] Available commands: cacheDebug.getStats(), cacheDebug.clearProductCache(), cacheDebug.clearImageCache(), cacheDebug.logPerformance()')
		},
	}
}
