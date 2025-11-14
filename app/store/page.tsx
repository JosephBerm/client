'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
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

type RetrievalOverrides = {
	search?: string
	categories?: ProductsCategory[]
}

const INITIAL_PAGE_SIZE = 20
// Include Categories and Files in the API response
const INITIAL_FILTER = () => new GenericSearchFilter({ pageSize: INITIAL_PAGE_SIZE, includes: ['Categories', 'Files'] })

const StorePageContent = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	const [selectedCategories, setSelectedCategories] = useState<ProductsCategory[]>([])
	const [searchText, setSearchText] = useState('')
	const [searchCriteria, setSearchCriteria] = useState<GenericSearchFilter>(INITIAL_FILTER)
	const [productsResult, setProductsResult] = useState<PagedResult<Product>>(new PagedResult<Product>())
	const [isLoading, setIsLoading] = useState(true)
	const [hasLoaded, setHasLoaded] = useState(false)
	const [currentSort, setCurrentSort] = useState('relevance')
	const [currentPageSize, setCurrentPageSize] = useState(INITIAL_PAGE_SIZE)

	const router = useRouter()
	const searchParams = useSearchParams()
	
	// Debounce search text - industry standard 400ms for search inputs
	// Only debounce when user is actively typing (length >= 3)
	const debouncedSearchText = useDebounce(searchText, 400)
	
	// Ref to maintain input focus during re-renders
	const searchInputRef = useRef<HTMLInputElement>(null)
	
	// Track focus state - use ref to avoid re-renders
	// This persists across re-renders and tracks if input should maintain focus
	const shouldMaintainFocusRef = useRef(false)
	
	// Track if user intentionally blurred (clicked away)
	// If true, we won't restore focus
	const userIntentionallyBlurredRef = useRef(false)

	const hasMoreProducts = productsResult.hasNext
	const totalResults = productsResult.total || products.length
	const displayedCount = products.length
	const isFiltered = selectedCategories.length > 0 || searchText.trim().length > 0
	const firstLoad = !hasLoaded && isLoading
	const isSearchTooShort = searchText.length > 0 && searchText.length < 3

	const fetchCategories = async () => {
		try {
			const { data } = await API.Store.Products.getAllCategories()

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
			
			console.log('Categories loaded:', sanitized.length, 'root categories')
			console.log('Categories with children:', 
				sanitized.filter(c => c.subCategories && c.subCategories.length > 0).map(c => ({
					name: c.name,
					childCount: c.subCategories.length
				}))
			)

			setCategories(sanitized)
			return sanitized
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading categories'
			console.error('Store page - Category fetch error:', err)
			toast.error(message, {
				position: 'top-right',
				autoClose: 4000,
			})
			return []
		}
	}

	const retrieveProducts = async (
		criteria: GenericSearchFilter,
		overrides?: RetrievalOverrides
	): Promise<Product[]> => {
		const searchValue = overrides?.search ?? searchText
		const categoriesValue = overrides?.categories ?? selectedCategories

		setIsLoading(true)

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
				setProducts([])
				setProductsResult(new PagedResult<Product>())
				return []
			}

			const payload = data.payload
			
			const nextProducts = payload.data.map((product) => new Product(product))
			
			setProducts(nextProducts)
			setProductsResult(new PagedResult<Product>(payload))
			return nextProducts
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading products'
			console.error('Store page - Product fetch error:', err)
			toast.error(message, {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			})
			setProducts([])
			setProductsResult(new PagedResult<Product>())
			return []
		} finally {
			setIsLoading(false)
			setHasLoaded(true)
		}
	}

	/**
	 * Handles category selection changes from CategoryFilter component.
	 * The selection logic is now handled within CategoryFilter component,
	 * this just updates the state to trigger product refresh.
	 */
	const handleCategorySelectionChange = (selected: ProductsCategory[]) => {
		setSelectedCategories(selected)
	}


	const loadMoreProducts = () => {
		if (isLoading || !hasMoreProducts) return

		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			pageSize: searchCriteria.pageSize + currentPageSize,
		})

		setSearchCriteria(updatedCriteria)
		void retrieveProducts(updatedCriteria)
	}

	const handlePageChange = (page: number) => {
		if (isLoading) return

		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page,
		})

		setSearchCriteria(updatedCriteria)
		void retrieveProducts(updatedCriteria)

		// Scroll to top of product grid
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleSortChange = (sortValue: string) => {
		setCurrentSort(sortValue)

		// Reset to first page when sorting changes
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page: 1,
		})

		setSearchCriteria(updatedCriteria)
		void retrieveProducts(updatedCriteria)
	}

	const handlePageSizeChange = (size: number) => {
		setCurrentPageSize(size)

		// Reset to first page and update page size
		const updatedCriteria = new GenericSearchFilter({
			...searchCriteria,
			page: 1,
			pageSize: size,
		})

		setSearchCriteria(updatedCriteria)
		void retrieveProducts(updatedCriteria)
	}

	const clearFilters = () => {
		if (!isFiltered) return

		const resetFilter = INITIAL_FILTER()
		setSearchText('')
		setSelectedCategories([])
		setSearchCriteria(resetFilter)
		void retrieveProducts(resetFilter, { search: '', categories: [] })
	}

	useEffect(() => {
		void fetchCategories()
	}, [])

	useEffect(() => {
		const querySearchText = searchParams.get('search')
		if (querySearchText) {
			setSearchText(querySearchText)

			const params = new URLSearchParams(searchParams.toString())
			params.delete('search')
			const newQuery = params.toString()
			router.replace(`/store${newQuery ? `?${newQuery}` : ''}`)
		}
	}, [router, searchParams])

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
	 */
	// 🎨 TEMPORARY: Disabled to show skeleton loaders
	/*
	useEffect(() => {
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

		setSearchCriteria(updatedCriteria)
		void retrieveProducts(updatedCriteria, {
			search: debouncedSearchText,
			categories: selectedCategories,
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchText, selectedCategories])
	*/
	
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
				onSearchChange={(value) => {
					setSearchText(value)
					// Mark that we should maintain focus when user is typing
					if (searchInputRef.current && document.activeElement === searchInputRef.current) {
						shouldMaintainFocusRef.current = true
						userIntentionallyBlurredRef.current = false
					}
				}}
				onSearchClear={() => {
					setSearchText('')
					shouldMaintainFocusRef.current = false
					userIntentionallyBlurredRef.current = false
					const resetFilter = INITIAL_FILTER()
					setSearchCriteria(resetFilter)
					void retrieveProducts(resetFilter, { search: '', categories: selectedCategories })
				}}
				onSearchFocus={() => {
					// User focused the input - we should maintain focus
					shouldMaintainFocusRef.current = true
					userIntentionallyBlurredRef.current = false
				}}
				onSearchBlur={(e) => {
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
				}}
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
						{/* 🎨 TEMPORARY: Always show skeleton loaders */}
						<ProductCardSkeleton count={8} />

						{/* Products - TEMPORARILY HIDDEN */}
						{/* {!isLoading || hasLoaded ? (
							products.length === 0 ? (
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
										priority={index < 8} // Priority loading for first 8 images (above the fold)
									/>
								))
							)
						) : null} */}
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


