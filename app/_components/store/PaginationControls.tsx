'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import Button from '@_components/ui/Button'

/**
 * Pagination Controls Component Props
 */
interface PaginationControlsProps {
	/** Current page number (1-based) */
	currentPage: number
	/** Total number of pages */
	totalPages: number
	/** Total number of items */
	totalItems: number
	/** Number of items displayed */
	displayedItems: number
	/** Whether more data is available */
	hasMore: boolean
	/** Whether data is currently loading */
	isLoading?: boolean
	/** Callback when page changes */
	onPageChange: (page: number) => void
	/** Callback for "Load More" action */
	onLoadMore?: () => void
	/** Pagination style: 'numbered' | 'load-more' | 'both' */
	variant?: 'numbered' | 'load-more' | 'both'
}

/**
 * Helper to generate page numbers array with ellipsis
 * Shows: [1] ... [4] [5] [6] ... [20]
 */
function generatePageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1)
	}

	const pages: (number | 'ellipsis')[] = []

	// Always show first page
	pages.push(1)

	// Calculate range around current page
	const rangeStart = Math.max(2, currentPage - 1)
	const rangeEnd = Math.min(totalPages - 1, currentPage + 1)

	// Add ellipsis after first page if needed
	if (rangeStart > 2) {
		pages.push('ellipsis')
	}

	// Add range around current page
	for (let i = rangeStart; i <= rangeEnd; i++) {
		pages.push(i)
	}

	// Add ellipsis before last page if needed
	if (rangeEnd < totalPages - 1) {
		pages.push('ellipsis')
	}

	// Always show last page
	if (totalPages > 1) {
		pages.push(totalPages)
	}

	return pages
}

/**
 * PaginationControls Component
 *
 * Industry-standard pagination controls for product listings.
 * Supports multiple pagination styles following best practices from
 * Amazon, Apple, Microsoft, and Netflix.
 *
 * **Variants:**
 * - `numbered`: Traditional pagination with page numbers (Apple, Microsoft)
 * - `load-more`: "Load More" button for progressive loading (Amazon mobile, Netflix)
 * - `both`: Combines numbered pagination with "Load More" (comprehensive)
 *
 * **Features:**
 * - Responsive design (mobile-first)
 * - Keyboard navigation support
 * - Accessibility (ARIA labels)
 * - Smart page number display with ellipsis
 * - Touch-friendly buttons
 *
 * @param props - Component props
 * @returns PaginationControls component
 */
export default function PaginationControls({
	currentPage,
	totalPages,
	totalItems,
	displayedItems,
	hasMore,
	isLoading = false,
	onPageChange,
	onLoadMore,
	variant = 'both',
}: PaginationControlsProps) {
	const showNumbered = variant === 'numbered' || variant === 'both'
	const showLoadMore = variant === 'load-more' || variant === 'both'

	// Don't show anything if there's only one page
	if (totalPages <= 1 && !hasMore) {
		return null
	}

	const pageNumbers = generatePageNumbers(currentPage, totalPages)

	return (
		<div className="mt-8 flex flex-col gap-6">
			{/* Numbered Pagination */}
			{showNumbered && totalPages > 1 && (
				<nav
					className="flex items-center justify-center"
					role="navigation"
					aria-label="Pagination navigation"
				>
					<div className="flex items-center gap-1 sm:gap-2">
						{/* First Page Button */}
						<button
							onClick={() => onPageChange(1)}
							disabled={currentPage === 1 || isLoading}
							className="btn btn-ghost btn-sm hidden items-center justify-center transition-all duration-200 hover:bg-base-200 disabled:opacity-50 sm:flex"
							style={{ minHeight: '2.5rem', minWidth: '2.5rem' }}
							aria-label="Go to first page"
						>
							<ChevronsLeft className="h-4 w-4" strokeWidth={2} />
						</button>

						{/* Previous Page Button */}
						<button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1 || isLoading}
							className="btn btn-ghost btn-sm flex items-center justify-center gap-1 transition-all duration-200 hover:bg-base-200 disabled:opacity-50"
							style={{ minHeight: '2.5rem', fontSize: '0.875rem' }}
							aria-label="Go to previous page"
						>
							<ChevronLeft className="h-4 w-4" strokeWidth={2} />
							<span className="hidden sm:inline">Previous</span>
						</button>

						{/* Page Numbers */}
						<div className="flex items-center gap-1">
							{pageNumbers.map((page, index) => {
								if (page === 'ellipsis') {
									return (
										<span
											key={`ellipsis-${index}`}
											className="flex h-10 w-10 items-center justify-center text-base-content/50"
											aria-hidden="true"
										>
											...
										</span>
									)
								}

								const isActive = page === currentPage

								return (
									<button
										key={page}
										onClick={() => onPageChange(page)}
										disabled={isLoading}
										className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
											isActive
												? 'bg-primary text-primary-content shadow-md hover:bg-primary/90'
												: 'bg-base-200 text-base-content hover:bg-base-300 disabled:opacity-50'
										}`}
										style={{ fontSize: '0.875rem' }}
										aria-label={`Go to page ${page}`}
										aria-current={isActive ? 'page' : undefined}
									>
										{page}
									</button>
								)
							})}
						</div>

						{/* Next Page Button */}
						<button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages || isLoading}
							className="btn btn-ghost btn-sm flex items-center justify-center gap-1 transition-all duration-200 hover:bg-base-200 disabled:opacity-50"
							style={{ minHeight: '2.5rem', fontSize: '0.875rem' }}
							aria-label="Go to next page"
						>
							<span className="hidden sm:inline">Next</span>
							<ChevronRight className="h-4 w-4" strokeWidth={2} />
						</button>

						{/* Last Page Button */}
						<button
							onClick={() => onPageChange(totalPages)}
							disabled={currentPage === totalPages || isLoading}
							className="btn btn-ghost btn-sm hidden items-center justify-center transition-all duration-200 hover:bg-base-200 disabled:opacity-50 sm:flex"
							style={{ minHeight: '2.5rem', minWidth: '2.5rem' }}
							aria-label="Go to last page"
						>
							<ChevronsRight className="h-4 w-4" strokeWidth={2} />
						</button>
					</div>
				</nav>
			)}

			{/* Load More Button */}
			{showLoadMore && hasMore && onLoadMore && (
				<div className="flex flex-col items-center gap-3">
					{/* Results Summary */}
					<p className="text-sm text-base-content/70" style={{ fontSize: '0.875rem' }}>
						Showing <span className="font-semibold text-base-content">{displayedItems}</span> of{' '}
						<span className="font-semibold text-base-content">{totalItems}</span> products
					</p>

					{/* Load More Button */}
					<Button
						variant="primary"
						size="lg"
						onClick={onLoadMore}
						disabled={isLoading}
						className="min-w-[200px] shadow-md hover:shadow-lg"
						style={{ fontSize: '1rem', minHeight: '3rem', padding: '0.75rem 2rem' }}
					>
						{isLoading ? (
							<>
								<span className="loading loading-spinner loading-sm mr-2"></span>
								Loading...
							</>
						) : (
							'Load More Products'
						)}
					</Button>
				</div>
			)}
		</div>
	)
}
