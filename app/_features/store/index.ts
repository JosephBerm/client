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

// ============================================================================
// UTILITIES (Server + Client Safe)
// ============================================================================

export {
	requestCache,
	createCacheKey,
} from './utils/requestCache'
