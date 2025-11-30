'use client'

import { Search, X } from 'lucide-react'

import { SORT_OPTIONS, PAGE_SIZE_OPTIONS } from '@_components/store/ProductsToolbar'
import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'
import ResultsCount from '@_components/ui/ResultsCount'
import Select, { createSelectOptions } from '@_components/ui/Select'

/**
 * UnifiedStoreToolbar Component Props
 */
export interface UnifiedStoreToolbarProps {
	// Search
	searchText: string
	onSearchChange: (value: string) => void
	onSearchClear: () => void
	onSearchSubmit?: () => void // ✅ NEW - Manual search trigger
	isSearchTooShort?: boolean
	searchInputRef?: React.RefObject<HTMLInputElement | null>
	onSearchFocus?: () => void
	onSearchBlur?: (e: React.FocusEvent<HTMLInputElement>) => void

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
	onSearchSubmit, // ✅ NEW - Manual search trigger
	isSearchTooShort = false,
	searchInputRef,
	onSearchFocus,
	onSearchBlur,
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
	const _currentSortOption = SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0]
	
	// Handle Enter key press for manual search
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && onSearchSubmit) {
			e.preventDefault()
			onSearchSubmit()
		}
	}

	return (
		<div
			className="py-3 sm:py-4 md:py-5"
			role="search"
			aria-label="Product search and filtering toolbar"
		>
				{/* Mobile/Tablet Layout: Stacked */}
				<div className="flex flex-col gap-4 lg:hidden">
					{/* Row 1: Search Input */}
					<div>
						{/* Label - Hidden on mobile, visible on tablet+ */}
						<label
							htmlFor="product-search"
							className="mb-1.5 hidden text-sm font-semibold text-base-content md:block"
						>
							Search products
						</label>

						<Input
							id="product-search"
							ref={searchInputRef}
							type="text"
							value={searchText}
							onChange={(e) => onSearchChange(e.target.value)}
							onKeyDown={handleKeyDown}
							onFocus={onSearchFocus}
							onBlur={onSearchBlur}
							placeholder="Search products..."
							aria-label="Search products"
							size="base"
							width="full"
							leftIcon={<Search strokeWidth={2} />}
							rightElement={
								searchText ? (
									<button
										onClick={onSearchClear}
										className="flex items-center justify-center text-base-content/50 transition-colors hover:text-base-content rounded p-1"
										aria-label="Clear search"
										type="button"
									>
										<X className="h-5 w-5" strokeWidth={2} />
									</button>
								) : undefined
							}
						/>

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

					{/* Row 2: Sort + Page Size Controls */}
					<div className="flex items-center gap-2 border-t border-base-300 pt-3 sm:gap-3 sm:justify-between md:pt-4">
						{/* Left Section: Sort Dropdown with Label */}
						<div className="flex flex-1 items-center gap-2 sm:gap-3">
							<label
								htmlFor="sort-select"
								className="shrink-0 text-xs font-medium text-base-content/70 sm:text-sm sm:font-semibold sm:text-base-content sm:whitespace-nowrap"
								style={{ fontSize: '0.75rem' }}
							>
								Sort by
							</label>

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
								className="min-w-0 sm:min-w-[180px] sm:w-52!"
							/>
						</div>

						{/* Right Section: Page Size Selector */}
						<div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
							<label
								htmlFor="page-size-select"
								className="shrink-0 text-xs font-medium text-base-content/70 sm:text-sm sm:font-medium sm:text-base-content/70 sm:whitespace-nowrap"
								style={{ fontSize: '0.75rem' }}
							>
								Show
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
								className="min-w-[60px]"
							/>

							<span className="hidden text-xs text-base-content/60 sm:inline sm:text-sm" style={{ fontSize: '0.75rem' }}>
								per page
							</span>
						</div>
					</div>

					{/* Row 3: Results Count + Reset */}
					<div className="flex items-center justify-center gap-3 border-t border-base-300 pt-3 md:pt-4">
						<ResultsCount 
							displayed={displayedCount} 
							total={totalCount} 
							isLoading={isLoading}
							className="text-center"
						/>

						<div
							className="shrink-0 transition-all duration-200 ease-in-out"
							style={{
								maxWidth: isFiltered ? '90px' : '0',
								opacity: isFiltered ? 1 : 0,
								visibility: isFiltered ? 'visible' : 'hidden',
								overflow: 'hidden',
							}}
							aria-hidden={!isFiltered}
						>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClearFilters}
							disabled={isLoading}
							className="flex-col items-center justify-center gap-0.5 whitespace-nowrap px-3 py-1.5 text-center"
							aria-label="Reset all filters"
						>
							<X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
							<span className="text-xs font-medium leading-tight">Reset</span>
						</Button>
						</div>
					</div>
				</div>

				{/* Desktop Layout (lg+): Elegant full-width single-row layout */}
				<div className="hidden lg:flex lg:items-center lg:gap-4 xl:gap-5 min-w-0">
					{/* Left Section: Search Bar - Takes available space with proper min-width */}
					<div className="flex-1 min-w-[200px]">
						<Input
							id="product-search-lg"
							ref={searchInputRef}
							type="text"
							value={searchText}
							onChange={(e) => onSearchChange(e.target.value)}
							onKeyDown={handleKeyDown}
							onFocus={onSearchFocus}
							onBlur={onSearchBlur}
							placeholder="Search products..."
							aria-label="Search products"
							size="base"
							width="full"
							leftIcon={<Search strokeWidth={2} />}
							rightElement={
								searchText ? (
									<button
										onClick={onSearchClear}
										className="flex items-center justify-center text-base-content/50 transition-colors hover:text-base-content rounded p-1"
										aria-label="Clear search"
										type="button"
									>
										<X className="h-5 w-5" strokeWidth={2} />
									</button>
								) : undefined
							}
						/>
					</div>

					{/* Center Section: Results Count + Controls Group */}
					<div className="flex items-center gap-4 xl:gap-5 shrink-0">
						{/* Results Count */}
						<div className="shrink-0">
							<ResultsCount 
								displayed={displayedCount} 
								total={totalCount} 
								isLoading={isLoading}
								size="base"
								showLabel={true}
							/>
						</div>

						{/* Vertical Separator */}
						<div className="h-8 w-px bg-base-300" aria-hidden="true" />

						{/* Sort Control */}
						<div className="flex items-center gap-2 shrink-0">
						<label
								htmlFor="sort-select-lg"
								className="text-sm font-medium text-base-content/70 whitespace-nowrap"
							style={{ fontSize: '0.875rem' }}
						>
								Sort by
						</label>
						<Select
								id="sort-select-lg"
							value={currentSort}
							onChange={(e) => onSortChange(e.target.value)}
							options={SORT_OPTIONS.map((opt) => ({
								value: opt.value,
								label: opt.label,
							}))}
								width="auto"
							size="sm"
							disabled={isLoading}
							aria-label="Sort products"
								className="w-48!"
						/>
					</div>

						{/* Vertical Separator */}
						<div className="h-8 w-px bg-base-300" aria-hidden="true" />

						{/* Page Size Control */}
						<div className="flex items-center gap-2 shrink-0">
						<label
								htmlFor="page-size-select-lg"
								className="text-sm font-medium text-base-content/70 whitespace-nowrap"
							style={{ fontSize: '0.875rem' }}
						>
								Show
						</label>
						<Select
								id="page-size-select-lg"
							value={currentPageSize}
							onChange={(e) => onPageSizeChange(Number(e.target.value))}
							options={createSelectOptions(PAGE_SIZE_OPTIONS)}
							width="xs"
							size="sm"
							disabled={isLoading}
							aria-label="Items per page"
								className="min-w-[60px]"
						/>
							<span className="text-sm text-base-content/60 whitespace-nowrap" style={{ fontSize: '0.875rem' }}>
							per page
						</span>
						</div>
					</div>

					{/* Right Section: Reset Button */}
					<div
						className="shrink-0 transition-all duration-200 ease-in-out"
						style={{
							maxWidth: isFiltered ? '90px' : '0',
							opacity: isFiltered ? 1 : 0,
							visibility: isFiltered ? 'visible' : 'hidden',
							overflow: 'hidden',
						}}
						aria-hidden={!isFiltered}
					>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearFilters}
						disabled={isLoading}
						className="flex-col items-center justify-center gap-0.5 whitespace-nowrap px-4 py-2 text-center"
						aria-label="Reset all filters"
					>
						<X className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
						<span className="text-sm font-medium leading-tight">Reset</span>
					</Button>
					</div>
				</div>
		</div>
	)
}

