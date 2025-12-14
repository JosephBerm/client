/**
 * @fileoverview Store Page Container Component
 * 
 * Main orchestration component for the store catalog page.
 * Connects business logic hook with presentational components.
 * 
 * **FAANG Best Practice:**
 * - Container/Presentational pattern (Dan Abramov)
 * - Single responsibility (orchestrates child components)
 * - No business logic (delegated to hook)
 * - Clean component composition
 * 
 * **Next.js 16 Hybrid Pattern:**
 * - Accepts optional initial data from Server Component
 * - If initial data provided, uses it for first render (SEO + Performance)
 * - Client-side interactions (search, filter, sort) work as before
 * 
 * **Business Flow Compliance:**
 * - Integrates referral tracking (Section 2.2)
 * - Shows value propositions (Section 4)
 * - Displays quick quote guarantee
 * 
 * @see business_flow.md Section 1 - DISCOVERY & BROWSING
 * @see business_flow.md Section 2.2 - Referral-Based Assignment
 * @module components/store/StorePageContainer
 * @category Components
 */

'use client'

import { useMemo, useState, useCallback } from 'react'

import { useStorePageLogic, PRIORITY_IMAGE_COUNT, useReferralTracking } from '@_features/store'
import type {
	SerializedProduct,
	SerializedPagedResult,
	SerializedCategory,
} from '@_features/store/types'

import { PagedResult } from '@_classes/Base/PagedResult'
import { Product } from '@_classes/Product'
import ProductsCategory from '@_classes/ProductsCategory'

import StoreFilters from '@_components/store/StoreFilters'
import StoreHeader from '@_components/store/StoreHeader'
import StoreProductGrid from '@_components/store/StoreProductGrid'
import UnifiedStoreToolbar from '@_components/store/UnifiedStoreToolbar'
import ReferralBanner from '@_components/store/ReferralBanner'
import StoreValueProposition from '@_components/store/StoreValueProposition'

/**
 * Props for StorePageContainer
 * 
 * All props are optional for backwards compatibility.
 * When props are provided, they're used as initial state (server-side hydration).
 * Data comes serialized from Server Component and is converted to class instances here.
 */
export interface StorePageContainerProps {
	/** Initial products from server-side fetch (serialized) */
	initialProducts?: SerializedProduct[]
	/** Initial pagination result from server-side fetch (serialized) */
	initialProductsResult?: SerializedPagedResult
	/** Initial categories from server-side fetch (serialized) */
	initialCategories?: SerializedCategory[]
	/** Initial search params from URL (server-side parsed) */
	initialSearchParams?: {
		search?: string
		categoryIds?: string[]
		sort?: string
		page?: number
		pageSize?: number
	}
}

/**
 * Store page container component
 * 
 * Orchestrates the store catalog page by:
 * - Using business logic hook for state and handlers
 * - Composing presentational child components
 * - Passing down props and callbacks
 * 
 * **Architecture:**
 * - Header: Static page title and description
 * - Toolbar: Search, sort, filter controls (sticky)
 * - Main Content: Sidebar filters + Product grid
 * - Product Grid: Products display with pagination
 * 
 * **Server-Side Hydration:**
 * When initial data props are provided (from Server Component):
 * - Products render immediately (no loading spinner)
 * - SEO benefits (content in initial HTML)
 * - Faster LCP (no waiting for client JS)
 * 
 * @component
 */
export default function StorePageContainer({
	initialProducts,
	initialProductsResult,
	initialCategories,
	initialSearchParams,
}: StorePageContainerProps = {}) {
	// Track referral banner dismissal
	const [showReferralBanner, setShowReferralBanner] = useState(true)
	
	// Initialize referral tracking - captures ?ref= from URL
	// Per business_flow.md Section 2.2: Referral-Based Assignment
	useReferralTracking()
	
	// Handler for dismissing referral banner
	const handleDismissReferral = useCallback(() => {
		setShowReferralBanner(false)
	}, [])
	
	// Convert serialized data from server to class instances
	// This is only done once on initial render (useMemo)
	// Type assertions are safe because Product/ProductsCategory constructors
	// handle plain objects with string dates via parseRequiredTimestamp/parseDateSafe
	const hydratedProducts = useMemo(() => {
		if (!initialProducts?.length) return undefined
		return initialProducts.map((p) => new Product(p as unknown as Partial<Product>))
	}, [initialProducts])
	
	const hydratedProductsResult = useMemo(() => {
		if (!initialProductsResult) return undefined
		return new PagedResult<Product>({
			...initialProductsResult,
			data: hydratedProducts ?? [],
		})
	}, [initialProductsResult, hydratedProducts])
	
	const hydratedCategories = useMemo(() => {
		if (!initialCategories?.length) return undefined
		
		// Recursively hydrate categories with their subCategories
		const hydrateCategory = (serialized: SerializedCategory): ProductsCategory => {
			const category = new ProductsCategory({
				id: serialized.id,
				name: serialized.name,
				parentCategoryId: serialized.parentCategoryId,
				subCategories: [], // Will be populated below
			})
			
			// Recursively hydrate subCategories if present
			if (serialized.subCategories?.length) {
				category.subCategories = serialized.subCategories.map(hydrateCategory)
			}
			
			return category
		}
		
		return initialCategories.map(hydrateCategory)
	}, [initialCategories])
	
	// Get all state and handlers from business logic hook
	// Pass initial data for server-side hydration when available
	const {
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
		
		// Derived state
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
		handleClearFilters,
		handleCategoryFilter,
	} = useStorePageLogic({
		initialProducts: hydratedProducts,
		initialProductsResult: hydratedProductsResult,
		initialCategories: hydratedCategories,
		initialSearchParams,
	})

	return (
		<div className="min-h-screen w-full">
			{/* Referral Banner - Shows when user arrives via ?ref= link */}
			{showReferralBanner && (
				<ReferralBanner 
					dismissible={true} 
					onDismiss={handleDismissReferral} 
				/>
			)}
			
			{/* Page Header - Enhanced with Quick Quote Guarantee */}
			<StoreHeader />
			
			{/* Value Propositions - Business Flow Section 4 Competitive Advantages */}
			<StoreValueProposition variant="horizontal" />

			{/* Unified Store Toolbar - Sticky */}
			<div 
				className="sticky z-20 border-b border-base-300 bg-base-100/98 shadow-md backdrop-blur-sm" 
				style={{ top: 'var(--sticky-top-offset)' }}
			>
				<div className="container mx-auto px-4 md:px-8 max-w-screen-2xl">
					<UnifiedStoreToolbar
						searchText={searchText}
						onSearchChange={handleSearchChange}
						onSearchClear={handleSearchClear}
						onSearchSubmit={handleSearchSubmit}
						onSearchFocus={handleSearchFocus}
						onSearchBlur={handleSearchBlur}
						isSearchTooShort={isSearchTooShort}
						displayedCount={displayedCount}
						totalCount={totalResults}
						isFiltered={isFiltered}
						onClearFilters={handleClearFilters}
						currentSort={currentSort}
						onSortChange={handleSortChange}
						currentPageSize={currentPageSize}
						onPageSizeChange={handlePageSizeChange}
						currentPage={searchCriteria.page}
						totalPages={productsResult.totalPages || 1}
						onPageChange={handlePageChange}
						isLoading={isLoading}
						searchInputRef={searchInputRef}
					/>
				</div>
			</div>

			{/* Main Content: Sidebar + Product Grid */}
			<div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-screen-2xl">
				<div className="flex flex-col gap-6 lg:flex-row">
					{/* Filters Sidebar */}
					<StoreFilters
						categories={categories}
						selectedCategories={selectedCategories}
						onSelectionChange={handleCategorySelectionChange}
						showCount={false}
						collapsible={true}
						emptyMessage="Categories load automatically once available."
					/>

					{/* Product Grid - Main Content */}
					<StoreProductGrid
						products={products}
						productsResult={productsResult}
						searchCriteria={searchCriteria}
						isLoading={isLoading}
						hasLoaded={hasLoaded}
						isFiltered={isFiltered}
						currentPageSize={currentPageSize}
						priorityImageCount={PRIORITY_IMAGE_COUNT}
						onClearFilters={handleClearFilters}
						onCategoryFilter={handleCategoryFilter}
						onPageChange={handlePageChange}
					/>
				</div>
			</div>
		</div>
	)
}

