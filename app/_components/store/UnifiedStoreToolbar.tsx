'use client'

import { Search, X } from 'lucide-react'
import Button from '@_components/ui/Button'
import ResultsCount from '@_components/ui/ResultsCount'
import Select, { createSelectOptions } from '@_components/ui/Select'
import type { SelectOption } from '@_components/ui/Select'
import { SORT_OPTIONS, PAGE_SIZE_OPTIONS } from '@_components/store/ProductsToolbar'

/**
 * UnifiedStoreToolbar Component Props
 */
export interface UnifiedStoreToolbarProps {
	// Search
	searchText: string
	onSearchChange: (value: string) => void
	onSearchClear: () => void
	isSearchTooShort?: boolean

	// Results & Filtering
	displayedCount: number
	totalCount: number
	isFiltered: boolean
	onClearFilters: () => void

	// Sorting
	currentSort: string
	onSortChange: (value: string) => void

	// Page Size
	currentPageSize: number
	onPageSizeChange: (size: number) => void

	// Loading state
	isLoading?: boolean
}

/**
 * UnifiedStoreToolbar Component
 *
 * Industry-standard unified toolbar combining search, sort, filters, and results.
 * Follows best practices from Amazon, Apple, Microsoft, and Google.
 *
 * **Design Pattern:**
 * - Amazon: Single toolbar with search, sort, and results
 * - Apple: Minimal unified control bar
 * - Microsoft: Comprehensive toolbar with all options
 * - Google: Search bar with filters and results count
 *
 * **Features:**
 * - Search input with icons
 * - Sort dropdown (7 options)
 * - Page size selector (4 options)
 * - Results count display
 * - Reset filters button
 * - Mobile-first responsive design
 * - Sticky positioning
 *
 * **Responsive Behavior:**
 * - Mobile: Stacked layout, essential controls
 * - Tablet: 2-row layout, all controls visible
 * - Desktop: Single row, optimal spacing
 *
 * @param props - Component props
 * @returns UnifiedStoreToolbar component
 */
export default function UnifiedStoreToolbar({
	searchText,
	onSearchChange,
	onSearchClear,
	isSearchTooShort = false,
	displayedCount,
	totalCount,
	isFiltered,
	onClearFilters,
	currentSort,
	onSortChange,
	currentPageSize,
	onPageSizeChange,
	isLoading = false,
}: UnifiedStoreToolbarProps) {
	const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0]

	return (
		<div
			className="sticky z-20 mb-6 rounded-lg border border-base-300 bg-base-100/98 shadow-md backdrop-blur-sm transition-shadow duration-200 hover:shadow-lg md:mb-8 md:rounded-xl"
			style={{ top: 'var(--sticky-top-offset)' }}
			role="search"
			aria-label="Product search and filtering toolbar"
		>
			<div className="p-3 sm:p-4 md:p-5">
				{/* Row 1: Search Input + Results Count */}
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4 lg:items-center lg:gap-6">
					{/* Search Input - Mobile-First with Icon */}
					<div className="flex-1">
						{/* Label - Hidden on mobile, visible on tablet+ */}
						<label
							htmlFor="product-search"
							className="mb-1.5 hidden text-sm font-semibold text-base-content md:block"
						>
							Search products
						</label>

						<div className="relative">
							{/* Search Icon */}
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Search className="h-5 w-5 text-base-content/50" strokeWidth={2} />
							</div>

							{/* Input Field */}
							<input
								id="product-search"
								type="text"
								value={searchText}
								onChange={(e) => onSearchChange(e.target.value)}
								className="input input-bordered w-full pl-10 pr-10 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
								placeholder="Search products..."
								aria-label="Search products"
								disabled={isLoading}
							/>

							{/* Clear Button - Only shown when there's text */}
							{searchText && (
								<button
									onClick={onSearchClear}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/50 transition-colors hover:text-base-content disabled:opacity-50"
									aria-label="Clear search"
									disabled={isLoading}
								>
									<X className="h-5 w-5" strokeWidth={2} />
								</button>
							)}
						</div>

						{/* Helper Text */}
						{isSearchTooShort ? (
							<p className="mt-1 text-xs text-warning" style={{ fontSize: '0.75rem' }}>
								Enter at least 3 characters
							</p>
						) : searchText.length > 0 ? (
							<p className="mt-1 text-xs text-base-content/60" style={{ fontSize: '0.75rem' }}>
								Search active
							</p>
						) : (
							<p
								className="mt-1 hidden text-xs text-base-content/60 md:block"
								style={{ fontSize: '0.75rem' }}
							>
								Search applies automatically
							</p>
						)}
					</div>

					{/* Results Count + Reset - Right Section */}
					<div className="flex shrink-0 items-center gap-3 md:gap-4">
						<ResultsCount displayed={displayedCount} total={totalCount} isLoading={isLoading} />

						{/* Reset Button - Only show when filtered */}
						{isFiltered && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearFilters}
								disabled={isLoading}
								className="shrink-0"
								style={{
									fontSize: '0.875rem',
									padding: '0.5rem 0.75rem',
									minHeight: '2rem',
								}}
								aria-label="Reset all filters"
							>
								<X className="mr-1.5 h-4 w-4" strokeWidth={2} />
								<span className="hidden sm:inline">Reset</span>
								<span className="sm:hidden">×</span>
							</Button>
						)}
					</div>
				</div>

				{/* Row 2: Sort + Page Size Controls */}
				<div className="mt-3 flex flex-col gap-3 border-t border-base-300 pt-3 sm:flex-row sm:items-center sm:justify-between md:mt-4 md:pt-4">
					{/* Left Section: Sort Dropdown */}
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
						{/* Sort By Label - Hidden on mobile */}
						<label
							htmlFor="sort-select"
							className="hidden text-sm font-semibold text-base-content sm:block"
							style={{ fontSize: '0.875rem' }}
						>
							Sort by:
						</label>

						{/* Sort Dropdown */}
						<Select
							id="sort-select"
							value={currentSort}
							onChange={(e) => onSortChange(e.target.value)}
							options={SORT_OPTIONS.map((opt) => ({
								value: opt.value,
								label: opt.label,
							}))}
							width="full"
							size="sm"
							disabled={isLoading}
							aria-label="Sort products"
							className="sm:w-52!"
						/>
					</div>

					{/* Right Section: Page Size Selector */}
					<div className="flex items-center gap-2">
						<label
							htmlFor="page-size-select"
							className="whitespace-nowrap text-sm font-medium text-base-content/70"
							style={{ fontSize: '0.875rem' }}
						>
							Show:
						</label>

						<Select
							id="page-size-select"
							value={currentPageSize}
							onChange={(e) => onPageSizeChange(Number(e.target.value))}
							options={createSelectOptions(PAGE_SIZE_OPTIONS)}
							width="xs"
							size="sm"
							disabled={isLoading}
							aria-label="Items per page"
						/>

						<span className="text-sm text-base-content/60" style={{ fontSize: '0.875rem' }}>
							per page
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

