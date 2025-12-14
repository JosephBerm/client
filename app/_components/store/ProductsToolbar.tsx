'use client'

import { ChevronDown } from 'lucide-react'

/**
 * Sort option interface for type safety
 */
export interface SortOption {
	label: string
	value: string
	field: string
	order: 'asc' | 'desc'
}

/**
 * Available sort options following industry standards
 * Based on Amazon, Apple, and Microsoft product catalogs
 * 
 * **Note:** Price-based sorting is intentionally excluded because
 * MedSource Pro uses a quote-based pricing model where prices are
 * determined per-customer by sales representatives.
 * 
 * @see business_flow.md for quote-based ordering details
 */
export const SORT_OPTIONS: SortOption[] = [
	{
		label: 'Relevance',
		value: 'relevance',
		field: '',
		order: 'desc',
	},
	{
		label: 'Name: A to Z',
		value: 'name_asc',
		field: 'name',
		order: 'asc',
	},
	{
		label: 'Name: Z to A',
		value: 'name_desc',
		field: 'name',
		order: 'desc',
	},
	{
		label: 'Newest First',
		value: 'date_desc',
		field: 'createdAt',
		order: 'desc',
	},
	{
		label: 'Oldest First',
		value: 'date_asc',
		field: 'createdAt',
		order: 'asc',
	},
]

/**
 * Available page size options
 * Following industry standards (10, 20, 50, 100)
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/**
 * Products Toolbar Component Props
 */
interface ProductsToolbarProps {
	/** Current sort option value */
	currentSort: string
	/** Callback when sort changes */
	onSortChange: (sortValue: string) => void
	/** Current page size */
	currentPageSize: number
	/** Callback when page size changes */
	onPageSizeChange: (size: number) => void
	/** Number of products currently displayed */
	displayedCount: number
	/** Total number of products available */
	totalCount: number
	/** Whether data is currently loading */
	isLoading?: boolean
}

/**
 * ProductsToolbar Component
 *
 * Industry-standard toolbar for sorting and page size controls.
 * Follows best practices from Amazon, Apple, Microsoft, and Meta.
 *
 * **Features:**
 * - Sort dropdown with common e-commerce options
 * - Page size selector for user preference
 * - Results summary display
 * - Mobile-first responsive design
 * - Touch-friendly controls
 *
 * **Design Inspiration:**
 * - Amazon: Sort dropdown placement and options
 * - Apple: Clean, minimal design
 * - Microsoft: Comprehensive control options
 *
 * @param props - Component props
 * @returns ProductsToolbar component
 */
export default function ProductsToolbar({
	currentSort,
	onSortChange,
	currentPageSize,
	onPageSizeChange,
	displayedCount,
	totalCount,
	isLoading = false,
}: ProductsToolbarProps) {
	const _currentSortOption = SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0]

	return (
		<div
			className="mb-4 flex flex-col gap-3 rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4 md:mb-6"
			role="toolbar"
			aria-label="Product sorting and filtering controls"
		>
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
				<div className="relative">
					<select
						id="sort-select"
						value={currentSort}
						onChange={(e) => onSortChange(e.target.value)}
						disabled={isLoading}
						className="select select-bordered w-full appearance-none pr-10 text-base transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 sm:w-52"
						style={{ fontSize: '0.875rem' }}
						aria-label="Sort products"
					>
						{SORT_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					{/* Dropdown Icon */}
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
						<ChevronDown className="h-5 w-5 text-base-content/50" strokeWidth={2} />
					</div>
				</div>

				{/* Page Size Selector - Hidden on mobile, visible on tablet+ */}
				<div className="hidden items-center gap-2 md:flex">
					<label
						htmlFor="page-size-select"
						className="whitespace-nowrap text-sm text-base-content/70"
						style={{ fontSize: '0.875rem' }}
					>
						Show:
					</label>

					<div className="relative">
						<select
							id="page-size-select"
							value={currentPageSize}
							onChange={(e) => onPageSizeChange(Number(e.target.value))}
							disabled={isLoading}
							className="select select-bordered select-sm appearance-none pr-8 transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
							style={{ fontSize: '0.875rem', minHeight: '2rem' }}
							aria-label="Items per page"
						>
							{PAGE_SIZE_OPTIONS.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>

						{/* Dropdown Icon */}
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronDown className="h-4 w-4 text-base-content/50" strokeWidth={2} />
						</div>
					</div>
				</div>
			</div>

			{/* Right Section: Results Summary */}
			<div
				className="flex items-center justify-between gap-3 sm:justify-end"
				role="status"
				aria-live="polite"
			>
				{/* Results Count */}
				<div className="text-sm text-base-content/80" style={{ fontSize: '0.875rem' }}>
					{isLoading ? (
						<span className="inline-block">Loading...</span>
					) : (
						<>
							<span className="font-semibold text-base-content">
								{displayedCount.toLocaleString()}
							</span>
							<span className="mx-1 text-base-content/50">of</span>
							<span className="font-semibold text-base-content">
								{totalCount.toLocaleString()}
							</span>
							<span className="ml-1 hidden sm:inline text-base-content/70">products</span>
						</>
					)}
				</div>

				{/* Mobile Page Size Selector - Only visible on mobile */}
				<div className="flex items-center gap-2 md:hidden">
					<label
						htmlFor="page-size-select-mobile"
						className="text-xs text-base-content/70"
						style={{ fontSize: '0.75rem' }}
					>
						Show:
					</label>

					<div className="relative">
						<select
							id="page-size-select-mobile"
							value={currentPageSize}
							onChange={(e) => onPageSizeChange(Number(e.target.value))}
							disabled={isLoading}
							className="select select-bordered select-sm appearance-none pr-8 text-xs transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
							style={{ fontSize: '0.75rem', minHeight: '1.75rem', paddingLeft: '0.5rem', paddingRight: '1.75rem' }}
							aria-label="Items per page"
						>
							{PAGE_SIZE_OPTIONS.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>

						{/* Dropdown Icon */}
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
							<ChevronDown className="h-3.5 w-3.5 text-base-content/50" strokeWidth={2} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

