/**
 * Store Feature Barrel Export (Optimized for Tree-Shaking)
 *
 * Public store (e-commerce) feature module.
 * Hooks are client-only, utils are server-safe.
 *
 * @example
 * ```typescript
 * import { useProductsState, requestCache } from '@_features/store'
 * ```
 *
 * @module store
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export {
	INITIAL_PAGE_SIZE,
	PRODUCT_API_INCLUDES,
	createInitialFilter,
	SEARCH_DEBOUNCE_MS,
	MIN_SEARCH_LENGTH,
	PRIORITY_IMAGE_COUNT,
	FEATURED_PRODUCTS_COUNT,
} from './constants'

// ============================================================================
// HOOKS (Client-Only - have 'use client')
// ============================================================================

export {
	useProductsState,
	productsReducer,
	initialProductsState,
	type ProductsState,
	type ProductsAction,
	type UseProductsStateReturn,
} from './hooks/useProductsState'

export {
	useSearchFilterState,
	createInitialSearchFilterState,
	searchFilterReducer,
	type SearchFilterState,
	type SearchFilterAction,
	type UseSearchFilterStateReturn,
} from './hooks/useSearchFilterState'

export {
	useStoreData,
	type UseStoreDataReturn,
	type RetrievalOverrides,
	type ProductFetchResult,
} from './hooks/useStoreData'

export {
	useStorePageLogic,
	type UseStorePageLogicReturn,
} from './hooks/useStorePageLogic'

export {
	useReferralTracking,
	getStoredReferral,
	storeReferral,
	clearReferral,
	type ReferralData,
	type UseReferralTrackingReturn,
} from './hooks/useReferralTracking'

export {
	useProductsInfiniteQuery,
	flattenProductPages,
	getTotalProductCount,
	productQueryKeys,
	type ProductsPage,
	type ProductQueryFilters,
} from './hooks/useProductsInfiniteQuery'

// ============================================================================
// UTILITIES (Server + Client Safe)
// ============================================================================

export {
	requestCache,
	createCacheKey,
} from './utils/requestCache'

// ============================================================================
// CLIENT-SIDE CACHE (Client-Only)
// ============================================================================

export {
	ProductCache,
	getCachedProduct,
	cacheProducts,
	useCacheStats,
	logCachePerformance,
	// Cache configuration constants
	MAX_PRODUCT_CACHE_ENTRIES,
	MAX_IMAGE_CACHE_ENTRIES,
	PRODUCT_CACHE_TTL_MS,
	IMAGE_CACHE_TTL_MS,
	// Types
	type CachedProductMetadata,
	type CachedImageEntry,
	type ProductCacheConfig,
	type CacheStatsSnapshot,
	type UseCacheStatsOptions,
} from './cache'

// ============================================================================
// TYPES (Server + Client Safe)
// ============================================================================

export type {
	SerializedProduct,
	SerializedPagedResult,
	SerializedCategory,
	InitialStoreData,
	StoreSearchParams,
} from './types'

// ============================================================================
// SERVER FUNCTIONS
// ============================================================================
// NOTE: Server-side fetch functions are NOT exported from this barrel.
// Import them directly from '@_features/store/server' in Server Components.
// This prevents accidental import in Client Components.