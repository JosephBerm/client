/**
 * @fileoverview Store Page Logic Hook - MINIMAL VERSION
 * 
 * 🚨 STRIPPED DOWN TO DEBUG INFINITE LOOP 🚨
 * 
 * This is a MINIMAL implementation with ALL complex features commented out.
 * We will add features back ONE BY ONE to identify the infinite loop cause.
 * 
 * **Current Status: MINIMAL WORKING VERSION**
 * - ✅ Fetches products once on mount
 * - ✅ Fetches categories once on mount
 * - ⏸️ All other features DISABLED
 * 
 * **Disabled Features (to be re-added incrementally):**
 * 1. ⏸️ Search functionality
 * 2. ⏸️ Category filtering
 * 3. ⏸️ Sorting
 * 4. ⏸️ Pagination
 * 5. ⏸️ Load more
 * 6. ⏸️ Page size changes
 * 7. ⏸️ URL parameter handling
 * 8. ⏸️ Focus management
 * 9. ⏸️ Request cancellation
 * 10. ⏸️ Clear filters
 * 
 * @see useStorePageLogic.BACKUP.ts for full implementation
 * @module features/store/hooks/useStorePageLogic
 * @category State Management
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation' // ⏸️ DISABLED - URL params

import {
	useProductsState,
	useSearchFilterState,
	createInitialSearchFilterState,
	useStoreData,
	type RetrievalOverrides, // ✅ ENABLED - needed for unified fetch
	INITIAL_PAGE_SIZE,
	createInitialFilter,
	// SEARCH_DEBOUNCE_MS, // ⏸️ DISABLED - search auto-fetch (save for last)
	// MIN_SEARCH_LENGTH, // ⏸️ DISABLED - search auto-fetch (save for last)
	// PRIORITY_IMAGE_COUNT, // ⏸️ DISABLED - not used in minimal version
} from '@_features/store'

import { logger } from '@_core'

import { notificationService } from '@_shared'
// import { useDebounce } from '@_shared' // ⏸️ DISABLED - debounce

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

/**
 * Store page logic hook return type
 */
export interface UseStorePageLogicReturn {
	// State
	products: Product[]
	productsResult: PagedResult<Product>
	isLoading: boolean
	hasLoaded: boolean
	categories: ProductsCategory[]
	searchText: string
	selectedCategories: ProductsCategory[]
	searchCriteria: GenericSearchFilter
	currentSort: string
	currentPageSize: number
	
	// Derived state
	debouncedSearchText: string
	hasMoreProducts: boolean
	totalResults: number
	displayedCount: number
	isFiltered: boolean
	isSearchTooShort: boolean
	
	// Refs for focus management
	searchInputRef: React.RefObject<HTMLInputElement | null>
	
	// Event handlers
	handleSearchChange: (value: string) => void
	handleSearchClear: () => void
	handleSearchSubmit: () => void // ✅ NEW - Manual search trigger
	handleSearchFocus: () => void
	handleSearchBlur: (e: React.FocusEvent<HTMLInputElement>) => void
	handleCategorySelectionChange: (selected: ProductsCategory[]) => void
	handleSortChange: (sortValue: string) => void
	handlePageSizeChange: (size: number) => void
	handlePageChange: (page: number) => void
	handleLoadMore: () => void
	handleClearFilters: () => void
	handleCategoryFilter: (category: ProductsCategory) => void
}

/**
 * Custom hook for store page business logic
 * 
 * Centralizes all state management, data fetching, and event handling
 * for the store catalog page. Fixes infinite loop issues by properly
 * managing effect dependencies.
 * 
 * **Architecture:**
 * - Uses composition of smaller hooks (useProductsState, useSearchFilterState, useStoreData)
 * - Manages side effects with proper dependency tracking
 * - Provides memoized event handlers to prevent unnecessary re-renders
 * - Handles focus management for search input
 * - DRY principle with unified fetch function
 * 
 * @returns Store page state and event handlers
 * 
 * @example
 * ```typescript
 * const {
 *   products,
 *   isLoading,
 *   handleSearchChange,
 *   handleCategorySelectionChange,
 * } = useStorePageLogic()
 * ```
 */
export function useStorePageLogic(): UseStorePageLogicReturn {
	// ============================================================================
	// ROUTING & URL - ⏸️ DISABLED
	// ============================================================================
	
	// const router = useRouter() // ⏸️ DISABLED
	// const searchParams = useSearchParams() // ⏸️ DISABLED

	// ============================================================================
	// STATE MANAGEMENT
	// ============================================================================
	
	// Products state (custom hook)
	const {
		state: productsState,
		setProducts,
		setLoading,
	} = useProductsState()
	
	// Search/filter state (custom hook)
	const {
		state: searchFilterState,
		setSearchText: setSearchTextAction, // ✅ ENABLED - Feature #4: Search input changes
		setSelectedCategories: setSelectedCategoriesAction, // ✅ ENABLED - Feature #1: Category filtering
		setSearchCriteria: setSearchCriteriaAction, // ✅ ENABLED - Feature #5: Unified fetch needs this
		setCurrentSort: setCurrentSortAction, // ✅ ENABLED - Feature #2: Sort functionality
		setCurrentPageSize: setCurrentPageSizeAction, // ✅ ENABLED - Feature #3: Page size changes
		resetFilters, // ✅ ENABLED - Feature #5: Clear filters
	} = useSearchFilterState(
		createInitialSearchFilterState(INITIAL_PAGE_SIZE, createInitialFilter())
	)
	
	// Categories state (independent data)
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	
	// Data fetching hook
	const { fetchCategories, fetchProducts, cancelPendingRequests } = useStoreData() // ✅ ENABLED - cancellation

	// ============================================================================
	// REFS (Mutable values that don't trigger re-renders)
	// ============================================================================
	
	const searchInputRef = useRef<HTMLInputElement | null>(null)
	// const shouldMaintainFocusRef = useRef(false) // ⏸️ DISABLED - focus management
	// const userIntentionallyBlurredRef = useRef(false) // ⏸️ DISABLED - focus management
	// const isInitialMountRef = useRef(true) // ⏸️ DISABLED - search effect
	const hasInitializedRef = useRef(false)
	
	/**
	 * 🛡️ RACE CONDITION PROTECTION
	 * 
	 * Request ID counter to prevent stale data from overwriting fresh data
	 * when user makes rapid filter changes.
	 * 
	 * **Problem:** User changes filters quickly:
	 *   1. Select Category A → Request 1 starts
	 *   2. Select Category B → Request 2 starts
	 *   3. Request 2 completes first ✅
	 *   4. Request 1 completes later, overwrites with Category A ❌
	 * 
	 * **Solution:** Only apply results from the latest request.
	 */
	const requestIdRef = useRef(0)

	// ============================================================================
	// EXTRACT STATE VALUES
	// ============================================================================
	
	const { products, productsResult, isLoading, hasLoaded } = productsState
	const { searchText, selectedCategories, searchCriteria, currentSort, currentPageSize } = searchFilterState

	// ============================================================================
	// DERIVED STATE & MEMOIZED VALUES - MINIMAL
	// ============================================================================
	
	// const debouncedSearchText = useDebounce(searchText, SEARCH_DEBOUNCE_MS) // ⏸️ DISABLED - search
	
	const hasMoreProducts = productsResult.hasNext // ✅ ENABLED - pagination
	
	const totalResults = productsResult.total || products.length // ✅ ENABLED - pagination
	
	const displayedCount = products.length
	
	const isFiltered = false // ⏸️ DISABLED - filtering
	// const isFiltered = useMemo(
	// 	() => selectedCategories.length > 0 || searchText.trim().length > 0,
	// 	[selectedCategories.length, searchText]
	// ) // ⏸️ DISABLED
	
	const isSearchTooShort = false // ⏸️ DISABLED - search
	// const isSearchTooShort = useMemo(
	// 	() => searchText.length > 0 && searchText.length < MIN_SEARCH_LENGTH,
	// 	[searchText.length]
	// ) // ⏸️ DISABLED

	// ============================================================================
	// ✅ UNIFIED FETCH FUNCTION - Feature #5
	// ============================================================================
	
	/**
	 * ✅ FEATURE #5 ENABLED - Unified fetch function
	 * 
	 * Central function for ALL product fetching operations.
	 * This implements the DRY principle - one place to fetch products.
	 * 
	 * **CRITICAL FIX:** This function does NOT trigger effects itself.
	 * It's called BY event handlers and effects, but doesn't create new effects.
	 * 
	 * @param criteriaUpdates - Partial or full search criteria
	 * @param overrides - Override search text and categories
	 * @param options - Control loading state and callbacks
	 */
	const fetchAndUpdateProducts = useCallback(async (
		criteriaUpdates: Partial<GenericSearchFilter> | GenericSearchFilter,
		overrides?: RetrievalOverrides,
		options?: {
			suppressLoading?: boolean
			onSuccess?: () => void
		}
	) => {
		// 🛡️ Increment request ID to track this specific request
		const currentRequestId = ++requestIdRef.current
		
		try {
			if (!options?.suppressLoading) {
				setLoading(true)
			}
			
			// Build updated criteria
			const updatedCriteria = criteriaUpdates instanceof GenericSearchFilter
				? criteriaUpdates
				: new GenericSearchFilter({
					...searchCriteria,
					...criteriaUpdates,
				})
			
			// Update search criteria state
			setSearchCriteriaAction(updatedCriteria)
			
			logger.info('🔄 Fetching products with criteria', {
				requestId: String(currentRequestId),
				criteria: updatedCriteria,
				sort: currentSort,
				overrides,
			})
			
			// Fetch products
			const { products: newProducts, result } = await fetchProducts(
				updatedCriteria,
				currentSort,
				overrides ?? { search: searchText, categories: selectedCategories }
			)
			
			// 🛡️ CRITICAL: Only update state if this is still the latest request
			if (currentRequestId !== requestIdRef.current) {
				logger.warn('⚠️ Discarding stale request results', { 
					requestId: String(currentRequestId),
					latestRequestId: String(requestIdRef.current),
					count: newProducts.length 
				})
				return // Discard stale results
			}
			
			// Update state with fresh data
			setProducts(newProducts, result)
			
			logger.info('✅ Products fetched successfully', { 
				requestId: String(currentRequestId),
				count: newProducts.length,
				total: result.total 
			})
			
			// Call success callback if provided
			options?.onSuccess?.()
			
		} catch (error) {
			// 🛡️ Only show error if this was the latest request
			if (currentRequestId !== requestIdRef.current) {
				logger.warn('⚠️ Ignoring error from stale request', { 
					requestId: String(currentRequestId),
					error 
				})
				return // Ignore errors from stale requests
			}
			
			logger.error('❌ Failed to fetch products', { 
				requestId: String(currentRequestId),
				error, 
				criteriaUpdates, 
				overrides 
			})
			notificationService.error('Failed to load products', {
				metadata: { error, criteriaUpdates, overrides },
				component: 'useStorePageLogic',
				action: 'fetchAndUpdateProducts',
			})
		} finally {
			// 🛡️ Only reset loading if this was the latest request
			if (currentRequestId === requestIdRef.current && !options?.suppressLoading) {
				setLoading(false)
			}
		}
	}, [
		searchCriteria, 
		currentSort, 
		searchText, 
		selectedCategories, 
		fetchProducts, 
		setProducts, 
		setSearchCriteriaAction, 
		setLoading
	])
	
	// ============================================================================
	// MINIMAL FETCH - Just fetch products once on mount
	// ============================================================================

	// ============================================================================
	// EVENT HANDLERS - ⏸️ ALL DISABLED (stub implementations)
	// ============================================================================
	
	/**
	 * ✅ FEATURE #1 + #5 ENABLED - Category selection with fetch
	 * 
	 * Updates selected categories state AND fetches products with new filter.
	 * This is a user-initiated action, safe from infinite loops.
	 */
	const handleCategorySelectionChange = useCallback((selected: ProductsCategory[]) => {
		logger.info('✅ Feature #1+5: Category selection changed - fetching products', { 
			count: selected.length,
			categories: selected.map(c => c.name) 
		})
		
		// Update state
		setSelectedCategoriesAction(selected)
		
		// Fetch products with new categories
		void fetchAndUpdateProducts(
			searchCriteria,
			{ search: searchText, categories: selected }
		)
	}, [setSelectedCategoriesAction, fetchAndUpdateProducts, searchCriteria, searchText])

	/**
	 * ✅ FEATURE #5 ENABLED - Load more
	 * 
	 * Appends the next page of products to the current list.
	 * This is a user-initiated action (button click), safe from infinite loops.
	 */
	const handleLoadMore = useCallback(() => {
		if (!productsResult.hasNext) {
			logger.warn('⚠️ No more products to load')
			return
		}
		
		const nextPage = productsResult.page + 1
		logger.info('✅ Feature #5: Loading more products', { 
			currentPage: productsResult.page,
			nextPage 
		})
		
		// Fetch next page
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page: nextPage,
		})
		
		void fetchAndUpdateProducts(
			updatedCriteria,
			{ search: searchText, categories: selectedCategories }
		)
	}, [productsResult, searchCriteria, fetchAndUpdateProducts, searchText, selectedCategories])

	/**
	 * ✅ FEATURE #5 ENABLED - Page change
	 * 
	 * Goes to a specific page number (for traditional pagination).
	 * This is a user-initiated action (pagination button click), safe from infinite loops.
	 */
	const handlePageChange = useCallback((page: number) => {
		logger.info('✅ Feature #5: Changing to page', { 
			from: productsResult.page,
			to: page 
		})
		
		// Fetch specific page
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page,
		})
		
		void fetchAndUpdateProducts(
			updatedCriteria,
			{ search: searchText, categories: selectedCategories }
		)
	}, [productsResult.page, searchCriteria, fetchAndUpdateProducts, searchText, selectedCategories])

	/**
	 * ✅ FEATURE #2 + #5 ENABLED - Sort change with fetch
	 * 
	 * Updates sort state AND fetches products with new sort order.
	 * This is a user-initiated action, safe from infinite loops.
	 * 
	 * ⚠️ NOTE: We update state first, but pass the NEW sort value to fetch.
	 * This prevents using stale sort value from closure.
	 */
	const handleSortChange = useCallback((sortValue: string) => {
		logger.info('✅ Feature #2+5: Sort changed - fetching products', { 
			from: currentSort,
			to: sortValue 
		})
		
		// Update state
		setCurrentSortAction(sortValue)
		
		// Fetch products with new sort - IMPORTANT: use sortValue param, not currentSort state!
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
		})
		
		// Wrap async call to avoid Promise return type issue
		void (async () => {
			try {
				setLoading(true)
				const { products: newProducts, result } = await fetchProducts(
					updatedCriteria,
					sortValue, // Use the new sort value directly
					{ search: searchText, categories: selectedCategories }
				)
				setProducts(newProducts, result)
				logger.info('✅ Products fetched with new sort', { count: newProducts.length })
			} catch (error) {
				logger.error('❌ Failed to fetch with new sort', { error })
				notificationService.error('Failed to sort products', {
					metadata: { error, sortValue },
					component: 'useStorePageLogic',
					action: 'handleSortChange',
				})
			} finally {
				setLoading(false)
			}
		})()
	}, [currentSort, setCurrentSortAction, searchCriteria, fetchProducts, searchText, selectedCategories, setProducts, setLoading])

	/**
	 * ✅ FEATURE #3 + #5 ENABLED - Page size change with fetch
	 * 
	 * Updates page size AND fetches products with new page size.
	 * Resets to page 1 when page size changes (standard pagination behavior).
	 * This is a user-initiated action, safe from infinite loops.
	 */
	const handlePageSizeChange = useCallback((size: number) => {
		logger.info('✅ Feature #3+5: Page size changed - fetching products', { 
			from: currentPageSize,
			to: size 
		})
		
		// Update state
		setCurrentPageSizeAction(size)
		
		// Fetch products with new page size, reset to page 1
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			pageSize: size,
			page: 1, // Reset to first page
		})
		
		void fetchAndUpdateProducts(
			updatedCriteria,
			{ search: searchText, categories: selectedCategories }
		)
	}, [currentPageSize, setCurrentPageSizeAction, searchCriteria, fetchAndUpdateProducts, searchText, selectedCategories])

	/**
	 * ✅ FEATURE #5 ENABLED - Clear filters
	 * 
	 * Resets all filters to default and fetches products.
	 * This is a user-initiated action, safe from infinite loops.
	 */
	const handleClearFilters = useCallback(() => {
		logger.info('✅ Feature #5: Clearing all filters')
		
		// Reset all filters to default
		const initialFilter = createInitialFilter()
		resetFilters(initialFilter)
		
		// Fetch products with empty filters
		void fetchAndUpdateProducts(
			initialFilter,
			{ search: '', categories: [] }
		)
	}, [resetFilters, fetchAndUpdateProducts])

	/**
	 * ✅ FEATURE #4 ENABLED - Search input change
	 * 
	 * Updates search text state when user types in the search box.
	 * This is a SIMPLE state update - no debouncing, no fetching, no effects.
	 */
	const handleSearchChange = useCallback((value: string) => {
		logger.info('✅ Feature #4: Search text changed', { 
			length: value.length,
			value: value.substring(0, 20) + (value.length > 20 ? '...' : '')
		})
		setSearchTextAction(value)
	}, [setSearchTextAction])

	/**
	 * ✅ FEATURE #4 ENABLED - Search clear
	 * 
	 * Clears the search text state AND fetches all products.
	 * This is a user-initiated action, safe from infinite loops.
	 */
	const handleSearchClear = useCallback(() => {
		logger.info('✅ Feature #4+6: Search cleared - fetching all products')
		setSearchTextAction('')
		
		// Fetch products without search text
		void fetchAndUpdateProducts(
			searchCriteria,
			{ search: '', categories: selectedCategories }
		)
	}, [setSearchTextAction, fetchAndUpdateProducts, searchCriteria, selectedCategories])
	
	/**
	 * ✅ FEATURE #6 ENABLED - Manual search submit
	 * 
	 * Triggers product fetch with current search text when user presses Enter.
	 * This replaces the auto-search debounced effect with manual trigger.
	 * This is a user-initiated action, safe from infinite loops.
	 */
	const handleSearchSubmit = useCallback(() => {
		logger.info('✅ Feature #6: Manual search submitted', { 
			searchText,
			length: searchText.length 
		})
		
		// Fetch products with current search text
		void fetchAndUpdateProducts(
			searchCriteria,
			{ search: searchText, categories: selectedCategories }
		)
	}, [fetchAndUpdateProducts, searchCriteria, searchText, selectedCategories])

	/**
	 * ✅ FEATURE #6 ENABLED - Search focus
	 * 
	 * Handles when user focuses on the search input.
	 * Just logs for now - can add focus management later if needed.
	 */
	const handleSearchFocus = useCallback(() => {
		logger.debug('🔍 Search input focused')
	}, [])

	/**
	 * ✅ FEATURE #6 ENABLED - Search blur
	 * 
	 * Handles when user leaves the search input.
	 * Just logs for now - can add focus management later if needed.
	 */
	const handleSearchBlur = useCallback((_e: React.FocusEvent<HTMLInputElement>) => {
		logger.debug('🔍 Search input blurred')
	}, [])

	/**
	 * ✅ FEATURE #5 ENABLED - Category filter from product card
	 * 
	 * When user clicks a category badge on a product card, filter by that category.
	 * This is a user-initiated action, safe from infinite loops.
	 */
	const handleCategoryFilter = useCallback((category: ProductsCategory) => {
		logger.info('✅ Feature #5: Filtering by category from card', { 
			category: category.name 
		})
		
		// Set the category as selected
		setSelectedCategoriesAction([category])
		
		// Fetch products with this category
		void fetchAndUpdateProducts(
			searchCriteria,
			{ search: searchText, categories: [category] }
		)
	}, [setSelectedCategoriesAction, fetchAndUpdateProducts, searchCriteria, searchText])

	// ============================================================================
	// EFFECTS - MINIMAL (Only initial fetch)
	// ============================================================================

	/**
	 * ✅ MINIMAL - Initial data fetch ONLY
	 * Fetches categories and products ONCE on mount
	 * NO other effects to prevent infinite loops
	 */
	useEffect(() => {
		if (hasInitializedRef.current) {
			return
		}
		hasInitializedRef.current = true

		const initialize = async () => {
			try {
				logger.info('🔵 Fetching initial data (ONCE)...')
				setLoading(true)
				
				// Fetch categories
				const fetchedCategories = await fetchCategories()
				setCategories(fetchedCategories)
				logger.info('✅ Categories fetched', { count: fetchedCategories.length })

				// Fetch initial products - SIMPLE, NO complex criteria
				const initialCriteria = createInitialFilter()
				const { products: newProducts, result } = await fetchProducts(
					initialCriteria,
					currentSort,
					{ search: '', categories: [] }
				)
				setProducts(newProducts, result)
				logger.info('✅ Products fetched', { count: newProducts.length })
				
			} catch (error) {
				logger.error('❌ Failed to initialize store', { error })
				notificationService.error('Failed to initialize store', {
					metadata: { error },
					component: 'useStorePageLogic',
					action: 'initialize',
				})
			} finally {
				setLoading(false)
			}
		}

		void initialize()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run once on mount - NO other dependencies!

	/**
	 * ⏸️ DISABLED - URL parameter handling
	 * This was causing extra fetches - will re-add later
	 */
	// useEffect(() => {
	// 	... URL param logic ...
	// }, [router, searchParams, ...])

	/**
	 * ⏸️ DISABLED - Search effect with debouncing
	 * This might have been causing the infinite loop
	 */
	// useEffect(() => {
	// 	... search logic ...
	// }, [debouncedSearchText, selectedCategories, currentSort])
	
	/**
	 * ⏸️ DISABLED - Focus restoration
	 * Not needed for minimal version
	 */
	// useEffect(() => {
	// 	... focus logic ...
	// }, [products, isLoading])

	/**
	 * ✅ FEATURE #5 ENABLED - Cleanup effect
	 * 
	 * Cancels all pending API requests when component unmounts.
	 * This prevents memory leaks and "setState on unmounted component" warnings.
	 * 
	 * This is a CLEANUP effect - runs ONCE on unmount, cannot cause infinite loops.
	 */
	useEffect(() => {
		return () => {
			logger.info('🧹 Cleaning up: Cancelling pending requests')
			cancelPendingRequests()
		}
	}, [cancelPendingRequests])

	// ============================================================================
	// RETURN
	// ============================================================================

	return {
		// State
		products,
		productsResult,
		isLoading,
		hasLoaded,
		categories,
		searchText,
		selectedCategories,
		searchCriteria,
		currentSort,
		currentPageSize,
		
		// Derived state - MINIMAL
		debouncedSearchText: searchText, // ⏸️ No debounce for now
		hasMoreProducts,
		totalResults,
		displayedCount,
		isFiltered,
		isSearchTooShort,
		
		// Refs
		searchInputRef,
		
		// Event handlers
		handleSearchChange,
		handleSearchClear,
		handleSearchSubmit, // ✅ NEW - Manual search trigger
		handleSearchFocus,
		handleSearchBlur,
		handleCategorySelectionChange,
		handleSortChange,
		handlePageSizeChange,
		handlePageChange,
		handleLoadMore,
		handleClearFilters,
		handleCategoryFilter,
	}
}

/**
 * 📋 RESTORATION CHECKLIST
 * 
 * Features to add back in order (check console logs for each):
 * 
 * □ 1. Search (handleSearchChange + debounce effect)
 * □ 2. Category filtering (handleCategorySelectionChange)
 * □ 3. Sorting (handleSortChange)
 * □ 4. Pagination (handlePageChange)
 * □ 5. Load more (handleLoadMore)
 * □ 6. Page size (handlePageSizeChange)
 * □ 7. Clear filters (handleClearFilters)
 * □ 8. URL parameters
 * □ 9. Focus management
 * □ 10. Request cancellation
 * 
 * When adding each feature:
 * 1. Uncomment the code
 * 2. Test in browser
 * 3. Watch console for infinite loops
 * 4. If loop occurs, that feature is the culprit!
 */

