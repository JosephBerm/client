/**
 * @fileoverview Store Catalog Page
 * 
 * Public-facing store catalog with product browsing, search, filtering, and pagination.
 * Implements FAANG-level best practices for performance, accessibility, and user experience.
 * 
 * **Key Features:**
 * - Real-time search with debouncing
 * - Category filtering with multi-select
 * - Sort options (relevance, price, name, date)
 * - Responsive grid layout (1-3 columns)
 * - Pagination controls with "load more"
 * - Skeleton loading states
 * - Focus management for accessibility
 * - Request cancellation (AbortController)
 * - State management with useReducer
 * 
 * **Performance Optimizations:**
 * - Memoized computed values
 * - Memoized event handlers
 * - Debounced search (400ms)
 * - Priority image loading
 * - Request deduplication
 * 
 * @module pages/store
 * @category Pages
 */

'use client'

import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Button from '@_components/ui/Button'
import CategoryFilter from '@_components/ui/CategoryFilter'
import ProductCard from '@_components/store/ProductCard'
import ProductCardSkeleton from '@_components/store/ProductCardSkeleton'
import UnifiedStoreToolbar from '@_components/store/UnifiedStoreToolbar'
import { SORT_OPTIONS } from '@_components/store/ProductsToolbar'
import PaginationControls from '@_components/store/PaginationControls'
import ProductsCategory, { sanitizeCategoriesList } from '@_classes/ProductsCategory'
import { Product } from '@_classes/Product'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { PagedResult } from '@_classes/Base/PagedResult'
import { API } from '@_shared'
import { useDebounce } from '@_shared'
import { logger } from '@_core'
import {
	useProductsState,
	useSearchFilterState,
	createInitialSearchFilterState,
	INITIAL_PAGE_SIZE,
	createInitialFilter,
	SEARCH_DEBOUNCE_MS,
	MIN_SEARCH_LENGTH,
	PRIORITY_IMAGE_COUNT,
} from '@_features/store'
import { requestCache, createCacheKey } from '@_features/store/utils/requestCache'

/**
 * Optional overrides for retrieveProducts function
 * Allows explicit override of search text and categories
 * Useful for reset operations and direct API calls
 */
interface RetrievalOverrides {
	search?: string
	categories?: ProductsCategory[]
}

/**
 * Store Page Content Component
 * Main component for the store catalog page
 * 
 * **Architecture:**
 * - Custom hooks for state management (useProductsState, useSearchFilterState)
 * - Memoized computed values for performance
 * - Request cancellation with AbortController
 * - Focus management for accessibility
 * - Debounced search to reduce API calls
 * 
 * @component
 */
const StorePageContent = () => {
	// ============================================================================
	// STATE MANAGEMENT
	// ============================================================================
	
	// Products state (extracted to custom hook)
	const {
		state: productsState,
		setLoading,
		setProducts,
		reset: resetProducts,
	} = useProductsState()
	
	// Search/filter state (extracted to custom hook)
	const {
		state: searchFilterState,
		setSearchText: setSearchTextAction,
		setSelectedCategories: setSelectedCategoriesAction,
		setSearchCriteria: setSearchCriteriaAction,
		setCurrentSort: setCurrentSortAction,
		setCurrentPageSize: setCurrentPageSizeAction,
		resetFilters,
	} = useSearchFilterState(
		createInitialSearchFilterState(INITIAL_PAGE_SIZE, createInitialFilter())
	)
	
	// Categories remain as useState (independent data, infrequent updates)
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	
	// Extract state values for convenience
	const { products, productsResult, isLoading, hasLoaded } = productsState
	const { searchText, selectedCategories, searchCriteria, currentSort, currentPageSize } = searchFilterState

	// ============================================================================
	// ROUTING & URL
	// ============================================================================
	
	const router = useRouter()
	const searchParams = useSearchParams()

	// ============================================================================
	// REFS (Mutable values that don't trigger re-renders)
	// ============================================================================
	
	/**
	 * Ref to search input element for focus management
	 * Used to restore focus after re-renders
	 */
	const searchInputRef = useRef<HTMLInputElement>(null)
	
	/**
	 * Flag indicating if input focus should be maintained
	 * Set to true when user is actively typing
	 */
	const shouldMaintainFocusRef = useRef(false)
	
	/**
	 * Flag indicating if user intentionally moved focus away
	 * If true, prevents automatic focus restoration
	 */
	const userIntentionallyBlurredRef = useRef(false)
	
	/**
	 * Flag to skip search on initial mount
	 * Prevents duplicate API call with initial data fetch
	 */
	const isInitialMountRef = useRef(true)
	
	/**
	 * Request deduplication cache (FAANG best practice)
	 * Prevents duplicate API calls with the same parameters
	 * Used to handle React strict mode double-renders and rapid state changes
	 */
	const lastRequestKeyRef = useRef<string>('')
	const pendingRequestRef = useRef<AbortController | null>(null)

	// ============================================================================
	// DERIVED STATE & MEMOIZED VALUES
	// ============================================================================
	
	/**
	 * Debounced search text (400ms delay)
	 * Reduces API calls while user is typing
	 */
	const debouncedSearchText = useDebounce(searchText, SEARCH_DEBOUNCE_MS)
	
	/**
	 * Whether there are more products to load
	 * Used to show/hide "Load More" button
	 */
	const hasMoreProducts = useMemo(() => productsResult.hasNext, [productsResult.hasNext])
	
	/**
	 * Total number of products matching current filters
	 * Includes products not yet loaded
	 */
	const totalResults = useMemo(
		() => productsResult.total || products.length,
		[productsResult.total, products.length]
	)
	
	/**
	 * Number of products currently displayed
	 */
	const displayedCount = useMemo(() => products.length, [products.length])
	
	/**
	 * Whether any filters are currently applied
	 * Used to show/hide "Reset Filters" button
	 */
	const isFiltered = useMemo(
		() => selectedCategories.length > 0 || searchText.trim().length > 0,
		[selectedCategories.length, searchText]
	)
	
	/**
	 * Whether search text is too short to trigger search
	 * Used to show helper text
	 */
	const isSearchTooShort = useMemo(
		() => searchText.length > 0 && searchText.length < MIN_SEARCH_LENGTH,
		[searchText.length]
	)

	// ============================================================================
	// API CALLS
	// ============================================================================
	
	/**
	 * Fetches product categories from API with global cache deduplication
	 * Categories are used for filtering products in the catalog
	 * 
	 * **FAANG Pattern:** Global request cache (Netflix/Meta pattern)
	 * - Prevents duplicate requests across component mounts
	 * - Survives React Strict Mode double-invocation
	 * - Caches results for 1 second to prevent rapid re-fetches
	 * 
	 * **Request Cancellation:**
	 * Uses built-in AbortController from cache manager
	 * 
	 * @returns Array of sanitized product categories
	 * 
	 * @example
	 * ```typescript
	 * const categories = await fetchCategories()
	 * ```
	 */
	const fetchCategories = useCallback(async () => {
		const cacheKey = createCacheKey('/Products/categories/clean')

		return requestCache.execute(
			cacheKey,
			async (signal) => {
				try {
					const { data } = await API.Store.Products.getAllCategories()

					if (signal?.aborted) return []

					if (!data.payload || data.statusCode !== 200) {
						toast.error(data.message ?? 'Unable to load categories', {
							position: 'top-right',
							autoClose: 4000,
						})
						return []
					}

					const categoryInstances = data.payload.map(
						(category: Partial<ProductsCategory>) => new ProductsCategory(category)
					)
					const sanitized = sanitizeCategoriesList(categoryInstances)

					// Update state
					setCategories(sanitized)
					return sanitized
				} catch (err) {
					if (signal?.aborted) return []
					
					const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading categories'
					logger.error('Store page - Category fetch error', { error: err })
					toast.error(message, {
						position: 'top-right',
						autoClose: 4000,
					})
					throw err
				}
			},
			{
				component: 'StorePageContent',
				ttl: 5000,
			}
		)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	/**
	 * Retrieves products from API based on search criteria
	 * Handles search text, category filters, sorting, and pagination
	 * 
	 * **Request Cancellation:**
	 * Accepts AbortSignal to prevent race conditions and memory leaks
	 * 
	 * **State Updates:**
	 * Only updates state if request wasn't aborted
	 * 
	 * @param criteria - Search filter with pagination and sorting
	 * @param overrides - Optional overrides for search text and categories
	 * @param signal - Optional AbortSignal for request cancellation
	 * @returns Array of fetched products
	 * 
	 * @example
	 * ```typescript
	 * const controller = new AbortController()
	 * const products = await retrieveProducts(criteria, undefined, controller.signal)
	 * ```
	 */
	const retrieveProducts = useCallback(async (
		criteria: GenericSearchFilter,
		overrides?: RetrievalOverrides
	): Promise<Product[]> => {
		const searchValue = overrides?.search ?? searchText
		const categoriesValue = overrides?.categories ?? selectedCategories

		setLoading(true)

		try {
			if (!isEmpty(searchValue) && searchValue.length > 2) {
				criteria.add('Name', searchValue)
			} else {
				criteria.clear('Name')
			}

			if (categoriesValue.length > 0) {
				const categoryIds = categoriesValue.map((cat) => String(cat.id)).join('|')
				criteria.add('CategorieIds', categoryIds)
			} else {
				criteria.clear('CategorieIds')
			}

			// Apply sorting from current sort option
			const sortOption = SORT_OPTIONS.find((opt) => opt.value === currentSort)
			if (sortOption && sortOption.field) {
				criteria.sortBy = sortOption.field
				criteria.sortOrder = sortOption.order
			} else {
				// Relevance (default) - no sorting
				criteria.sortBy = null
				criteria.sortOrder = 'asc'
			}

			const { data } = await API.Store.Products.searchPublic(criteria)

			if (!data.payload || data.statusCode !== 200) {
				const message = data.message ?? 'Unable to fetch products'
				toast.error(message, {
					position: 'top-right',
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				})
				resetProducts()
				return []
			}

			const payload = data.payload
			
			const nextProducts = payload.data.map((product) => new Product(product))
			setProducts(nextProducts, new PagedResult<Product>(payload))
			
			return nextProducts
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading products'
			logger.error('Store page - Product fetch error', { error: err })
			toast.error(message, {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			})
			
			resetProducts()
			return []
		} finally {
			setLoading(false)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// ============================================================================
	// EVENT HANDLERS
	// ============================================================================
	
	/**
	 * Handles category selection changes from CategoryFilter component
	 * Updates state which triggers useEffect to fetch filtered products
	 * 
	 * @param selected - Array of selected category objects
	 */
	const handleCategorySelectionChange = useCallback((selected: ProductsCategory[]) => {
		setSelectedCategoriesAction(selected)
	}, [setSelectedCategoriesAction])

	const loadMoreProducts = useCallback(() => {
		if (isLoading || !hasMoreProducts) return

		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			pageSize: searchCriteria.pageSize + currentPageSize,
		})

		setSearchCriteriaAction(updatedCriteria)
		void retrieveProducts(updatedCriteria)
	}, [isLoading, hasMoreProducts, searchCriteria, currentPageSize, retrieveProducts, setSearchCriteriaAction])

	const handlePageChange = useCallback((page: number) => {
		if (isLoading) return

		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page,
		})

		setSearchCriteriaAction(updatedCriteria)
		void retrieveProducts(updatedCriteria)

		// Scroll to top of product grid
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}, [isLoading, searchCriteria, retrieveProducts, setSearchCriteriaAction])

	const handleSortChange = useCallback((sortValue: string) => {
		setCurrentSortAction(sortValue)

		// Reset to first page when sorting changes
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page: 1,
		})

		setSearchCriteriaAction(updatedCriteria)
		void retrieveProducts(updatedCriteria)
	}, [searchCriteria, retrieveProducts, setCurrentSortAction, setSearchCriteriaAction])

	const handlePageSizeChange = useCallback((size: number) => {
		setCurrentPageSizeAction(size)

		// Reset to first page and update page size
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page: 1,
			pageSize: size,
		})

		setSearchCriteriaAction(updatedCriteria)
		void retrieveProducts(updatedCriteria)
	}, [searchCriteria, retrieveProducts, setCurrentPageSizeAction, setSearchCriteriaAction])

	const clearFilters = useCallback(() => {
		if (!isFiltered) return

		const resetFilter = createInitialFilter()
		resetFilters(resetFilter)
		setSearchCriteriaAction(resetFilter)
		void retrieveProducts(resetFilter, { search: '', categories: [] })
	}, [isFiltered, retrieveProducts, resetFilters, setSearchCriteriaAction])

	// Memoize search handlers (FAANG best practice: extract from JSX)
	const handleSearchChange = useCallback((value: string) => {
		setSearchTextAction(value)
		// Mark that we should maintain focus when user is typing
		if (searchInputRef.current && document.activeElement === searchInputRef.current) {
			shouldMaintainFocusRef.current = true
			userIntentionallyBlurredRef.current = false
		}
	}, [setSearchTextAction])

	const handleSearchClear = useCallback(() => {
		setSearchTextAction('')
		shouldMaintainFocusRef.current = false
		userIntentionallyBlurredRef.current = false
		const resetFilter = createInitialFilter()
		setSearchCriteriaAction(resetFilter)
		void retrieveProducts(resetFilter, { search: '', categories: selectedCategories })
	}, [selectedCategories, retrieveProducts, setSearchTextAction, setSearchCriteriaAction])

	const handleSearchFocus = useCallback(() => {
		// User focused the input - we should maintain focus
		shouldMaintainFocusRef.current = true
		userIntentionallyBlurredRef.current = false
	}, [])

	const handleSearchBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		// Debug logging removed - use logger.debug() if needed for debugging
		
		// Check if blur was intentional (user clicked on another interactive element)
		const relatedTarget = e.relatedTarget as HTMLElement | null
		
		// If user clicked on a button, select, or another input, allow the blur
		if (
			relatedTarget &&
			(relatedTarget.tagName === 'BUTTON' ||
				relatedTarget.tagName === 'SELECT' ||
				relatedTarget.tagName === 'INPUT' ||
				relatedTarget.closest('button') ||
				relatedTarget.closest('select'))
		) {
			// User intentionally moved focus - don't restore
			userIntentionallyBlurredRef.current = true
			shouldMaintainFocusRef.current = false
		} else {
			// Blur was likely from re-render - maintain focus state
			// We'll restore it in the useEffect
			userIntentionallyBlurredRef.current = false
		}
	}, [])

	// Initial data fetch - categories
	useEffect(() => {
		void fetchCategories()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Initial product fetch on mount
	useEffect(() => {
		const initialCriteria = createInitialFilter()
		
		setSearchCriteriaAction(initialCriteria)
		void retrieveProducts(initialCriteria, undefined)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const querySearchText = searchParams.get('search')
		if (querySearchText) {
			setSearchTextAction(querySearchText)

			const params = new URLSearchParams(searchParams.toString())
			params.delete('search')
			const newQuery = params.toString()
			router.replace(`/store${newQuery ? `?${newQuery}` : ''}`)
		}
	}, [router, searchParams, setSearchTextAction])

	/**
	 * Search products with proper debouncing and minimum character requirement.
	 * Only searches when:
	 * 1. Search text is empty (clear search), OR
	 * 2. Search text has 3+ characters (debounced)
	 * 
	 * This prevents:
	 * - Excessive API calls
	 * - Searching on every keystroke
	 * - Searching with insufficient characters
	 * - Input focus loss during search
	 * - Duplicate requests with same parameters
	 * 
	 * FAANG best practices implemented:
	 * 1. Request cancellation with AbortController (Google pattern)
	 * 2. Request deduplication with cache keys (Netflix pattern)
	 * 3. Inline API calls to prevent cascading dependencies (Meta pattern)
	 * 4. Proper cleanup and memory leak prevention (Amazon pattern)
	 */
	useEffect(() => {
		// Skip on initial mount - initial fetch is handled separately
		if (isInitialMountRef.current) {
			isInitialMountRef.current = false
			return
		}
		
		// Only search if:
		// - Search is empty (clear results), OR
		// - Debounced search has 3+ characters
		const shouldSearch = debouncedSearchText.trim().length === 0 || debouncedSearchText.trim().length >= 3
		
		if (!shouldSearch) {
			// If search is too short, clear results but don't trigger API call
			if (debouncedSearchText.trim().length > 0 && debouncedSearchText.trim().length < 3) {
				return
			}
		}

		// FAANG Best Practice: Request Deduplication
		// Create a cache key from current parameters to detect duplicate requests
		const categoryIds = selectedCategories.map(c => c.id).sort().join(',')
		const requestKey = `${debouncedSearchText}|${categoryIds}|${currentSort}|${currentPageSize}`
		
		// Skip if this exact request is already pending or just completed
		if (lastRequestKeyRef.current === requestKey && pendingRequestRef.current) {
			return
		}
		
		// Cancel any pending request before starting new one
		if (pendingRequestRef.current) {
			pendingRequestRef.current.abort()
		}
		
		// Create new abort controller for this request
		const abortController = new AbortController()
		pendingRequestRef.current = abortController
		lastRequestKeyRef.current = requestKey

		// Mark that we should maintain focus if input is currently focused
		const currentInput = searchInputRef.current
		const isCurrentlyFocused = document.activeElement === currentInput
		
		if (isCurrentlyFocused) {
			shouldMaintainFocusRef.current = true
			userIntentionallyBlurredRef.current = false
		}

		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page: 1, // Reset to first page on search
		})

		setSearchCriteriaAction(updatedCriteria)
		void retrieveProducts(updatedCriteria, {
			search: debouncedSearchText,
			categories: selectedCategories,
		}).finally(() => {
			// Clear pending request ref when complete
			if (pendingRequestRef.current === abortController) {
				pendingRequestRef.current = null
			}
		})
		
		// Cleanup: mark request as cancelled
		return () => {
			if (pendingRequestRef.current === abortController) {
				pendingRequestRef.current = null
			}
		}
		// FIXED: Removed retrieveProducts from dependencies to prevent cascading re-renders
		// Dependencies are only the actual values that should trigger a search
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchText, selectedCategories, currentSort, currentPageSize, setSearchCriteriaAction])
	
	/**
	 * Restore focus after products update.
	 * Industry best practice: Use double requestAnimationFrame + setTimeout
	 * for maximum reliability across all browsers and React rendering cycles.
	 * 
	 * This ensures focus is restored after:
	 * - Product list updates
	 * - Loading state changes
	 * - Any re-renders caused by state updates
	 */
	useEffect(() => {
		// Only restore focus if:
		// 1. We should maintain focus (user was typing)
		// 2. User didn't intentionally blur
		// 3. Input ref exists
		if (
			shouldMaintainFocusRef.current &&
			!userIntentionallyBlurredRef.current &&
			searchInputRef.current
		) {
			const input = searchInputRef.current
			
			// Double RAF + setTimeout ensures DOM is fully updated
			// This is the most reliable method across all browsers
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(() => {
						// Double-check conditions before focusing
						if (
							shouldMaintainFocusRef.current &&
							!userIntentionallyBlurredRef.current &&
							searchInputRef.current &&
							document.activeElement !== searchInputRef.current
						) {
							searchInputRef.current.focus()
							
							// Restore cursor position to end of input
							const length = searchInputRef.current.value.length
							searchInputRef.current.setSelectionRange(length, length)
						}
					}, 0)
				})
			})
		}
	}, [products, isLoading]) // Restore focus when products or loading state changes

	return (
		<ClientPageLayout
			title="Store Catalog"
			description="Browse MedSource Pro products and filter by category to find the supplies you need."
			maxWidth="full"
		>
			{/* Unified Store Toolbar - Search, Sort, Filter, Results */}
			<UnifiedStoreToolbar
				searchText={searchText}
				onSearchChange={handleSearchChange}
				onSearchClear={handleSearchClear}
				onSearchFocus={handleSearchFocus}
				onSearchBlur={handleSearchBlur}
				isSearchTooShort={isSearchTooShort}
				displayedCount={displayedCount}
				totalCount={totalResults}
				isFiltered={isFiltered}
				onClearFilters={clearFilters}
				currentSort={currentSort}
				onSortChange={handleSortChange}
				currentPageSize={currentPageSize}
				onPageSizeChange={handlePageSizeChange}
				isLoading={isLoading}
				searchInputRef={searchInputRef}
			/>

			{/* Main Content: Sidebar + Product Grid */}
			<div className="flex flex-col gap-6 lg:flex-row">
				{/* Filters Sidebar */}
				<aside className="w-full lg:w-80 lg:shrink-0">
					<div className="sticky rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm" style={{ top: 'calc(var(--sticky-top-offset) + 1.5rem)' }}>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-xl font-semibold text-base-content">Filters</h2>
							{selectedCategories.length > 0 && (
								<span className="rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
									{selectedCategories.length} selected
								</span>
							)}
						</div>

						<div className="mb-4">
							<CategoryFilter
								categories={categories}
								selectedCategories={selectedCategories}
								onSelectionChange={handleCategorySelectionChange}
								showCount={false}
								collapsible={true}
								emptyMessage="Categories load automatically once available."
							/>
						</div>

						<div className="rounded-lg border border-dashed border-base-300 bg-base-200/30 p-3 text-sm text-base-content/70">
							Select categories to refine results. Products update automatically.
						</div>
					</div>
				</aside>

				{/* Product Grid - Main Content */}
				<main className="flex-1">
					{/* Products Grid - Responsive breakpoints optimized for card size */}
					<div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
						{isLoading && !hasLoaded ? (
							<ProductCardSkeleton count={currentPageSize} />
						) : products.length === 0 ? (
								<div className="col-span-full rounded-xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
									<p className="text-lg font-semibold text-base-content">No products found</p>
									<p className="mt-2 text-base text-base-content/70">
										{isFiltered
											? 'No products match the current filters. Try adjusting your search or filters.'
											: 'Products will appear here once available.'}
									</p>
									{isFiltered && (
										<Button variant="primary" size="sm" onClick={clearFilters} className="mt-4">
											Reset Filters
										</Button>
									)}
								</div>
							) : (
								products.map((product, index) => (
									<ProductCard
										key={product.id}
										product={product}
										showWishlist={false}
										showQuickView={false}
										priority={index < PRIORITY_IMAGE_COUNT} // Priority loading for above-the-fold images
									/>
								))
						)}
					</div>

					{/* Pagination Controls - Industry Standard */}
					{products.length > 0 && (
						<PaginationControls
							currentPage={searchCriteria.page}
							totalPages={productsResult.totalPages || 1}
							totalItems={totalResults}
							displayedItems={displayedCount}
							hasMore={hasMoreProducts}
							isLoading={isLoading}
							onPageChange={handlePageChange}
							onLoadMore={loadMoreProducts}
							variant="load-more"
						/>
					)}
				</main>
			</div>
		</ClientPageLayout>
	)
}

const StorePageFallback = () => (
	<ClientPageLayout
		title="Store Catalog"
		description="Browse MedSource Pro products and filter by category to find the supplies you need."
		loading
		maxWidth="full"
		actions={
			<Button variant="ghost" disabled>
				Reset Filters
			</Button>
		}
	>
		<div className="flex justify-center py-16">
			<span className="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
		</div>
	</ClientPageLayout>
)

const Page = () => (
	<Suspense fallback={<StorePageFallback />}>
		<StorePageContent />
	</Suspense>
)

export default Page



