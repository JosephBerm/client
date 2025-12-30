/**
 * Store Feature Hooks - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Custom hooks for the store/catalog feature.
 * Client-only (all have 'use client' directive).
 * 
 * @module features/store/hooks
 */

export {
	useProductsState,
	productsReducer,
	initialProductsState,
	type ProductsState,
	type ProductsAction,
	type UseProductsStateReturn,
} from './useProductsState'

export {
	useSearchFilterState,
	createInitialSearchFilterState,
	searchFilterReducer,
	type SearchFilterState,
	type SearchFilterAction,
	type UseSearchFilterStateReturn,
} from './useSearchFilterState'

export {
	useStoreData,
	type UseStoreDataReturn,
	type RetrievalOverrides,
	type ProductFetchResult,
} from './useStoreData'

export {
	useStorePageLogic,
	type UseStorePageLogicReturn,
	type UseStorePageLogicProps,
	type StoreDisplayMode,
} from './useStorePageLogic'

export {
	useReferralTracking,
	getStoredReferral,
	storeReferral,
	clearReferral,
	type ReferralData,
	type UseReferralTrackingReturn,
} from './useReferralTracking'

