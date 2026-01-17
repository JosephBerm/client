/**
 * Store Cache Module Exports
 * 
 * Client-side caching utilities for store data.
 */

export {
	ProductCache,
	getCachedProduct,
	cacheProducts,
	// Constants
	MAX_PRODUCT_CACHE_ENTRIES,
	MAX_IMAGE_CACHE_ENTRIES,
	PRODUCT_CACHE_TTL_MS,
	IMAGE_CACHE_TTL_MS,
	// Types
	type CachedProductMetadata,
	type CachedImageEntry,
	type ProductCacheConfig,
} from './ProductCache'

export {
	useCacheStats,
	logCachePerformance,
	type CacheStatsSnapshot,
	type UseCacheStatsOptions,
} from './useCacheStats'
