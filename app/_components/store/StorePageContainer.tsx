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
 * @module components/store/StorePageContainer
 * @category Components
 */

'use client'

import { useStorePageLogic, PRIORITY_IMAGE_COUNT } from '@_features/store'

import StoreFilters from '@_components/store/StoreFilters'
import StoreHeader from '@_components/store/StoreHeader'
import StoreProductGrid from '@_components/store/StoreProductGrid'
import UnifiedStoreToolbar from '@_components/store/UnifiedStoreToolbar'

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
 * @component
 */
export default function StorePageContainer() {
	// Get all state and handlers from business logic hook
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
	} = useStorePageLogic()

	return (
		<div className="min-h-screen w-full">
			{/* Page Header - Static */}
			<StoreHeader />

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

