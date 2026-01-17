/**
 * ProductCache - Client-Side LRU Cache for Product Metadata
 *
 * MAANG-level in-memory cache for product card data with:
 * - O(1) lookup by product ID (Map-based)
 * - LRU eviction when cache exceeds capacity
 * - Separate image URL cache with stricter limits
 * - Automatic cleanup of stale entries
 *
 * **Industry Patterns (Google/Meta/Amazon):**
 * - LRU (Least Recently Used) eviction policy
 * - Separate hot/cold storage for different data types
 * - Memory-bounded cache with configurable limits
 * - Fast O(1) operations for scroll performance
 *
 * **Why This Matters:**
 * When users scroll rapidly through the store:
 * 1. Products they've seen are instantly available (no re-fetch)
 * 2. Memory stays bounded (LRU evicts oldest entries)
 * 3. Images have stricter limits (larger memory footprint)
 *
 * @module features/store/cache/ProductCache
 */

import type { Product } from '@_classes/Product'

// =============================================================================
// CACHE CONFIGURATION CONSTANTS
// =============================================================================

/** Maximum number of product metadata entries in cache */
export const MAX_PRODUCT_CACHE_ENTRIES = 500

/** Maximum number of image URL entries in cache */
export const MAX_IMAGE_CACHE_ENTRIES = 30

/** TTL for product metadata in milliseconds (5 minutes) */
export const PRODUCT_CACHE_TTL_MS = 5 * 60 * 1000

/** TTL for image entries in milliseconds (2 minutes) */
export const IMAGE_CACHE_TTL_MS = 2 * 60 * 1000

/** Default estimated image size in bytes for LRU tracking */
export const DEFAULT_IMAGE_SIZE_ESTIMATE = 50_000

/** Soft limit percentage for proactive eviction (80% of max) */
export const CACHE_SOFT_LIMIT_PERCENT = 0.8

// =============================================================================
// TYPES
// =============================================================================

/**
 * Cached product metadata (lightweight - no images)
 * Only essential data needed to render a product card
 */
export interface CachedProductMetadata {
	id: string
	name: string
	sku?: string
	stock?: number
	manufacturer?: string
	providerName?: string
	/** Category names only (not full objects) */
	categoryNames: string[]
	/** Primary image URL (for cache key) */
	primaryImageUrl?: string
	/** Timestamp when cached */
	cachedAt: number
}

/**
 * Cached image entry
 */
export interface CachedImageEntry {
	url: string
	productId: string
	/** Approximate size in bytes (for LRU-by-size) */
	estimatedSize: number
	/** Last access timestamp */
	lastAccessedAt: number
	/** Whether image is currently loaded in DOM */
	isLoaded: boolean
}

/**
 * Cache configuration
 */
export interface ProductCacheConfig {
	/** Max number of product metadata entries (default: 500) */
	maxProducts: number
	/** Max number of cached image URLs (default: 30) */
	maxImages: number
	/** TTL for product metadata in ms (default: 5 minutes) */
	productTtl: number
	/** TTL for image entries in ms (default: 2 minutes) */
	imageTtl: number
}

const DEFAULT_CONFIG: ProductCacheConfig = {
	maxProducts: MAX_PRODUCT_CACHE_ENTRIES,
	maxImages: MAX_IMAGE_CACHE_ENTRIES,
	productTtl: PRODUCT_CACHE_TTL_MS,
	imageTtl: IMAGE_CACHE_TTL_MS,
}

/**
 * ProductCache - Singleton LRU Cache
 *
 * Provides fast O(1) lookups for product data during rapid scrolling.
 * Uses two separate caches:
 * 1. Product metadata cache (500 entries) - text data, small footprint
 * 2. Image URL cache (30 entries) - tracks which images are "hot"
 */
class ProductCacheImpl {
	private config: ProductCacheConfig

	/** Product metadata cache - Map preserves insertion order for LRU */
	private productCache: Map<string, CachedProductMetadata>

	/** Image cache - tracks recently accessed image URLs */
	private imageCache: Map<string, CachedImageEntry>

	/** Access order tracking for true LRU (most recent at end) */
	private productAccessOrder: string[]
	private imageAccessOrder: string[]

	/** Cache statistics */
	private stats = {
		productHits: 0,
		productMisses: 0,
		imageHits: 0,
		imageMisses: 0,
		evictions: 0,
	}

	constructor(config: Partial<ProductCacheConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config }
		this.productCache = new Map()
		this.imageCache = new Map()
		this.productAccessOrder = []
		this.imageAccessOrder = []
	}

	/**
	 * Get product metadata from cache
	 * @returns Cached metadata or undefined if not found/expired
	 */
	getProduct(productId: string): CachedProductMetadata | undefined {
		const entry = this.productCache.get(productId)

		if (!entry) {
			this.stats.productMisses++
			return undefined
		}

		// Check TTL
		if (Date.now() - entry.cachedAt > this.config.productTtl) {
			this.productCache.delete(productId)
			this.removeFromAccessOrder(this.productAccessOrder, productId)
			this.stats.productMisses++
			return undefined
		}

		// Update access order (move to end = most recent)
		this.updateAccessOrder(this.productAccessOrder, productId)
		this.stats.productHits++

		return entry
	}

	/**
	 * Cache product metadata
	 * Extracts essential data from Product instance
	 */
	setProduct(product: Product): void {
		const productId = String(product.id)

		// Extract lightweight metadata
		const metadata: CachedProductMetadata = {
			id: productId,
			name: product.name ?? '',
			sku: product.sku,
			stock: product.stock,
			manufacturer: product.manufacturer,
			providerName: product.provider?.name,
			categoryNames: product.categories?.map(c => c.name).filter((name): name is string => Boolean(name)) ?? [],
			primaryImageUrl: product.files?.[0]?.name ?? undefined,
			cachedAt: Date.now(),
		}

		// Evict if at capacity (before adding new entry)
		if (this.productCache.size >= this.config.maxProducts && !this.productCache.has(productId)) {
			this.evictLru(this.productCache, this.productAccessOrder)
		}

		this.productCache.set(productId, metadata)
		this.updateAccessOrder(this.productAccessOrder, productId)
	}

	/**
	 * Batch cache multiple products
	 */
	setProducts(products: Product[]): void {
		for (const product of products) {
			this.setProduct(product)
		}
	}

	/**
	 * Check if product is cached
	 */
	hasProduct(productId: string): boolean {
		const entry = this.productCache.get(productId)
		if (!entry) {
			return false
		}

		// Check TTL
		if (Date.now() - entry.cachedAt > this.config.productTtl) {
			this.productCache.delete(productId)
			this.removeFromAccessOrder(this.productAccessOrder, productId)
			return false
		}

		return true
	}

	/**
	 * Track image access (for LRU eviction)
	 */
	trackImageAccess(url: string, productId: string, estimatedSize: number = DEFAULT_IMAGE_SIZE_ESTIMATE): void {
		const existing = this.imageCache.get(url)

		if (existing) {
			// Update access time
			existing.lastAccessedAt = Date.now()
			this.updateAccessOrder(this.imageAccessOrder, url)
			this.stats.imageHits++
			return
		}

		// Evict if at capacity
		if (this.imageCache.size >= this.config.maxImages) {
			this.evictLru(this.imageCache, this.imageAccessOrder)
		}

		const entry: CachedImageEntry = {
			url,
			productId,
			estimatedSize,
			lastAccessedAt: Date.now(),
			isLoaded: false,
		}

		this.imageCache.set(url, entry)
		this.updateAccessOrder(this.imageAccessOrder, url)
		this.stats.imageMisses++
	}

	/**
	 * Mark image as loaded
	 */
	markImageLoaded(url: string): void {
		const entry = this.imageCache.get(url)
		if (entry) {
			entry.isLoaded = true
			entry.lastAccessedAt = Date.now()
			this.updateAccessOrder(this.imageAccessOrder, url)
		}
	}

	/**
	 * Check if image is in hot cache
	 */
	isImageHot(url: string): boolean {
		const entry = this.imageCache.get(url)
		if (!entry) {
			return false
		}

		// Check TTL
		if (Date.now() - entry.lastAccessedAt > this.config.imageTtl) {
			this.imageCache.delete(url)
			this.removeFromAccessOrder(this.imageAccessOrder, url)
			return false
		}

		return true
	}

	/**
	 * Get URLs of images that should be evicted
	 * (oldest entries that exceed the limit)
	 */
	getEvictableImageUrls(): string[] {
		const urls: string[] = []
		const now = Date.now()

		for (const [url, entry] of this.imageCache) {
			// Expired entries
			if (now - entry.lastAccessedAt > this.config.imageTtl) {
				urls.push(url)
			}
		}

		// Also include oldest entries if over soft limit
		const softLimit = Math.floor(this.config.maxImages * CACHE_SOFT_LIMIT_PERCENT)
		if (this.imageCache.size > softLimit) {
			const toEvict = this.imageCache.size - softLimit
			for (let i = 0; i < toEvict && i < this.imageAccessOrder.length; i++) {
				const url = this.imageAccessOrder[i]
				if (!urls.includes(url)) {
					urls.push(url)
				}
			}
		}

		return urls
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return {
			...this.stats,
			productCacheSize: this.productCache.size,
			imageCacheSize: this.imageCache.size,
			productHitRate: this.stats.productHits / (this.stats.productHits + this.stats.productMisses) || 0,
			imageHitRate: this.stats.imageHits / (this.stats.imageHits + this.stats.imageMisses) || 0,
		}
	}

	/**
	 * Clear all caches
	 */
	clear(): void {
		this.productCache.clear()
		this.imageCache.clear()
		this.productAccessOrder = []
		this.imageAccessOrder = []
	}

	/**
	 * Clear only image cache
	 */
	clearImages(): void {
		this.imageCache.clear()
		this.imageAccessOrder = []
	}

	// Private helpers

	private updateAccessOrder(order: string[], key: string): void {
		const index = order.indexOf(key)
		if (index > -1) {
			order.splice(index, 1)
		}
		order.push(key) // Most recent at end
	}

	private removeFromAccessOrder(order: string[], key: string): void {
		const index = order.indexOf(key)
		if (index > -1) {
			order.splice(index, 1)
		}
	}

	private evictLru<T>(cache: Map<string, T>, order: string[]): void {
		if (order.length === 0) {
			return
		}

		// Evict oldest (first in order array)
		const oldestKey = order.shift()
		if (oldestKey) {
			cache.delete(oldestKey)
			this.stats.evictions++
		}
	}
}

/**
 * Singleton instance
 * Use this throughout the app for consistent caching
 */
export const ProductCache = new ProductCacheImpl()

/**
 * Hook-friendly cache access
 * @example
 * const cachedProduct = useProductCache(productId)
 */
export function getCachedProduct(productId: string): CachedProductMetadata | undefined {
	return ProductCache.getProduct(productId)
}

/**
 * Cache products from a query result
 */
export function cacheProducts(products: Product[]): void {
	ProductCache.setProducts(products)
}
