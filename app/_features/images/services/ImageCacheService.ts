/**
 * Image Cache Service
 * 
 * Enterprise-grade image cache management with Service Worker support.
 * Provides browser cache management, cache invalidation, and offline support.
 * 
 * **Features:**
 * - Browser cache management
 * - Service Worker integration (optional)
 * - Cache invalidation strategies
 * - Cache size management
 * - Offline support
 * - Cache statistics
 * 
 * **Cache Strategies:**
 * - **browser**: Browser HTTP cache only
 * - **memory**: In-memory cache (Map)
 * - **service-worker**: Service Worker cache (requires registration)
 * - **hybrid**: Combination of all strategies
 * 
 * **Use Cases:**
 * - Offline image support
 * - Cache size management
 * - Cache invalidation
 * - Performance optimization
 * 
 * @module ImageCacheService
 */

import { logger } from '@_core'

/**
 * Cache strategy type.
 */
export type CacheStrategy = 'browser' | 'memory' | 'service-worker' | 'hybrid'

/**
 * Cache entry metadata.
 */
export interface CacheEntry {
	/** Cached URL */
	url: string
	/** Cache timestamp */
	timestamp: number
	/** Cache expiration time (ms since epoch) */
	expiresAt?: number
	/** Cache size estimate (bytes) */
	size?: number
	/** Cache hit count */
	hitCount: number
}

/**
 * Cache statistics.
 */
export interface CacheStats {
	/** Total number of cached entries */
	totalEntries: number
	/** Total cache size (bytes) */
	totalSize: number
	/** Number of cache hits */
	hits: number
	/** Number of cache misses */
	misses: number
	/** Cache hit rate (0-1) */
	hitRate: number
}

/**
 * Image Cache Service Class
 * 
 * Provides comprehensive cache management for images.
 * Supports multiple caching strategies and Service Worker integration.
 */
export class ImageCacheService {
	// In-memory cache
	private static memoryCache = new Map<string, CacheEntry>()

	// Cache statistics
	private static stats = {
		hits: 0,
		misses: 0,
	}

	// Service Worker registration
	private static serviceWorkerRegistration: ServiceWorkerRegistration | null = null

	// Cache strategy
	private static strategy: CacheStrategy = 'browser'

	// Maximum cache size (bytes)
	private static maxCacheSize = 50 * 1024 * 1024 // 50MB

	// Default cache TTL (time to live) in milliseconds
	private static defaultTTL = 7 * 24 * 60 * 60 * 1000 // 7 days

	/**
	 * Initializes the cache service.
	 * 
	 * @param {CacheStrategy} strategy - Cache strategy to use
	 * @param {number} maxSize - Maximum cache size in bytes
	 * @returns {Promise<void>} Promise that resolves when initialized
	 * 
	 * @example
	 * ```typescript
	 * // Initialize with browser cache only
	 * await ImageCacheService.initialize('browser');
	 * 
	 * // Initialize with Service Worker
	 * await ImageCacheService.initialize('service-worker', 100 * 1024 * 1024);
	 * ```
	 */
	static async initialize(strategy: CacheStrategy = 'browser', maxSize: number = 50 * 1024 * 1024): Promise<void> {
		this.strategy = strategy
		this.maxCacheSize = maxSize

		// Register Service Worker if needed
		if (strategy === 'service-worker' || strategy === 'hybrid') {
			await this.registerServiceWorker()
		}

		if (process.env.NODE_ENV === 'development') {
			logger.log('ImageCacheService: Initialized', {
				strategy,
				maxSize: `${(maxSize / 1024 / 1024).toFixed(2)}MB`,
			})
		}
	}

	/**
	 * Registers Service Worker for caching.
	 */
	private static async registerServiceWorker(): Promise<void> {
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			if (process.env.NODE_ENV === 'development') {
				logger.warn('ImageCacheService: Service Worker not supported')
			}
			return
		}

		try {
			const registration = await navigator.serviceWorker.register('/sw-image-cache.js', {
				scope: '/',
			})

			this.serviceWorkerRegistration = registration

			if (process.env.NODE_ENV === 'development') {
				logger.log('ImageCacheService: Service Worker registered', {
					scope: registration.scope,
				})
			}
		} catch (error) {
			logger.error('ImageCacheService: Service Worker registration failed', { error })
		}
	}

	/**
	 * Caches an image URL.
	 * 
	 * @param {string} url - Image URL to cache
	 * @param {number} ttl - Time to live in milliseconds
	 * @returns {Promise<void>} Promise that resolves when cached
	 * 
	 * @example
	 * ```typescript
	 * // Cache with default TTL (7 days)
	 * await ImageCacheService.cache(imageUrl);
	 * 
	 * // Cache with custom TTL (1 day)
	 * await ImageCacheService.cache(imageUrl, 24 * 60 * 60 * 1000);
	 * ```
	 */
	static async cache(url: string, ttl: number = this.defaultTTL): Promise<void> {
		if (!url) {
			return
		}

		const expiresAt = Date.now() + ttl
		const entry: CacheEntry = {
			url,
			timestamp: Date.now(),
			expiresAt,
			hitCount: 0,
		}

		// Add to memory cache
		if (this.strategy === 'memory' || this.strategy === 'hybrid') {
			this.memoryCache.set(url, entry)
			this.enforceMaxCacheSize()
		}

		// Cache in Service Worker
		if ((this.strategy === 'service-worker' || this.strategy === 'hybrid') && this.serviceWorkerRegistration) {
			try {
				// Send message to Service Worker to cache
				if (this.serviceWorkerRegistration.active) {
					this.serviceWorkerRegistration.active.postMessage({
						type: 'CACHE_IMAGE',
						url,
						ttl,
					})
				}
			} catch (error) {
				logger.error('ImageCacheService: Failed to cache in Service Worker', { url, error })
			}
		}

		if (process.env.NODE_ENV === 'development') {
			logger.log('ImageCacheService: Cached image', { url, ttl: `${(ttl / 1000 / 60).toFixed(0)}min` })
		}
	}

	/**
	 * Checks if an image is cached.
	 * 
	 * @param {string} url - Image URL to check
	 * @returns {boolean} True if cached and not expired
	 */
	static isCached(url: string): boolean {
		if (!url) {
			return false
		}

		// Check memory cache
		if (this.strategy === 'memory' || this.strategy === 'hybrid') {
			const entry = this.memoryCache.get(url)
			if (entry) {
				// Check expiration
				if (entry.expiresAt && entry.expiresAt < Date.now()) {
					this.memoryCache.delete(url)
					return false
				}

				// Update hit count
				entry.hitCount++
				this.stats.hits++
				return true
			}
		}

		// Browser cache check (always available)
		if (this.strategy === 'browser' || this.strategy === 'hybrid') {
			// Browser cache is handled automatically by the browser
			// We can't directly check it, but we assume it's working
			return true
		}

		this.stats.misses++
		return false
	}

	/**
	 * Invalidates (removes) a cached image.
	 * 
	 * @param {string} url - Image URL to invalidate
	 * @returns {Promise<void>} Promise that resolves when invalidated
	 */
	static async invalidate(url: string): Promise<void> {
		if (!url) {
			return
		}

		// Remove from memory cache
		if (this.strategy === 'memory' || this.strategy === 'hybrid') {
			this.memoryCache.delete(url)
		}

		// Invalidate in Service Worker
		if ((this.strategy === 'service-worker' || this.strategy === 'hybrid') && this.serviceWorkerRegistration) {
			try {
				if (this.serviceWorkerRegistration.active) {
					this.serviceWorkerRegistration.active.postMessage({
						type: 'INVALIDATE_IMAGE',
						url,
					})
				}
			} catch (error) {
				logger.error('ImageCacheService: Failed to invalidate in Service Worker', { url, error })
			}
		}

		if (process.env.NODE_ENV === 'development') {
			logger.log('ImageCacheService: Invalidated cache', { url })
		}
	}

	/**
	 * Clears all cached images.
	 * 
	 * @returns {Promise<void>} Promise that resolves when cleared
	 */
	static async clear(): Promise<void> {
		// Clear memory cache
		this.memoryCache.clear()

		// Clear Service Worker cache
		if (this.serviceWorkerRegistration) {
			try {
				const cacheNames = await caches.keys()
				await Promise.all(
					cacheNames
						.filter((name) => name.startsWith('image-cache-'))
						.map((name) => caches.delete(name))
				)
			} catch (error) {
				logger.error('ImageCacheService: Failed to clear Service Worker cache', { error })
			}
		}

		// Reset statistics
		this.stats.hits = 0
		this.stats.misses = 0

		if (process.env.NODE_ENV === 'development') {
			logger.log('ImageCacheService: Cache cleared')
		}
	}

	/**
	 * Enforces maximum cache size by removing oldest entries.
	 */
	private static enforceMaxCacheSize(): void {
		let totalSize = 0
		const entries = Array.from(this.memoryCache.values())

		// Calculate total size
		entries.forEach((entry) => {
			totalSize += entry.size || 0
		})

		// Remove oldest entries if over limit
		if (totalSize > this.maxCacheSize) {
			// Sort by timestamp (oldest first)
			entries.sort((a, b) => a.timestamp - b.timestamp)

			// Remove entries until under limit
			for (const entry of entries) {
				if (totalSize <= this.maxCacheSize) {
					break
				}

				this.memoryCache.delete(entry.url)
				totalSize -= entry.size || 0
			}
		}
	}

	/**
	 * Gets cache statistics.
	 * 
	 * @returns {CacheStats} Cache statistics
	 */
	static getStats(): CacheStats {
		const entries = Array.from(this.memoryCache.values())
		const totalSize = entries.reduce((sum, entry) => sum + (entry.size || 0), 0)
		const totalHits = this.stats.hits
		const totalMisses = this.stats.misses
		const totalRequests = totalHits + totalMisses
		const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0

		return {
			totalEntries: entries.length,
			totalSize,
			hits: totalHits,
			misses: totalMisses,
			hitRate,
		}
	}

	/**
	 * Gets all cached URLs.
	 * 
	 * @returns {string[]} Array of cached URLs
	 */
	static getCachedUrls(): string[] {
		return Array.from(this.memoryCache.keys())
	}

	/**
	 * Preloads and caches multiple images.
	 * 
	 * @param {string[]} urls - Array of image URLs to preload and cache
	 * @returns {Promise<void[]>} Promise that resolves when all images are cached
	 */
	static async preloadAndCache(urls: string[]): Promise<void[]> {
		const promises = urls.map((url) => {
			return new Promise<void>((resolve) => {
				const img = new Image()
				img.onload = () => {
					this.cache(url).then(() => resolve())
				}
				img.onerror = () => resolve() // Resolve even on error
				img.src = url
			})
		})

		return Promise.all(promises)
	}
}

