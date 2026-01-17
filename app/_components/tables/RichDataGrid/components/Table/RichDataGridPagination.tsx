/**
 * RichDataGridPagination - Pagination Controls Component
 *
 * Provides pagination with page size selector.
 * Following AG Grid/MUI DataGrid patterns.
 *
 * @module RichDataGridPagination
 */

'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useRichDataGridPagination } from '../../context/RichDataGridContext'
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../types'
import Button from '@_components/ui/Button'

// ============================================================================
// PROPS
// ============================================================================

export interface RichDataGridPaginationProps {
	/** Available page sizes */
	pageSizeOptions?: readonly number[]
	/** Show page size selector */
	showPageSizeSelector?: boolean
	/** Show item count */
	showItemCount?: boolean
	/** Show page numbers */
	showPageNumbers?: boolean
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Pagination controls for RichDataGrid.
 *
 * @example
 * <RichDataGridPagination
 *   showPageSizeSelector
 *   showItemCount
 * />
 */
export function RichDataGridPagination({
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
	showPageSizeSelector = true,
	showItemCount = true,
	showPageNumbers = true,
	className = '',
}: RichDataGridPaginationProps) {
	const { pagination, setPagination, pageCount, canPreviousPage, canNextPage, totalItems } =
		useRichDataGridPagination()

	const { pageIndex, pageSize } = pagination

	// Calculate display range
	const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1
	const endItem = Math.min((pageIndex + 1) * pageSize, totalItems)

	// Navigation handlers
	const goToFirstPage = () => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }))
	}

	const goToPreviousPage = () => {
		setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))
	}

	const goToNextPage = () => {
		setPagination((prev) => ({ ...prev, pageIndex: Math.min(pageCount - 1, prev.pageIndex + 1) }))
	}

	const goToLastPage = () => {
		setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }))
	}

	const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newPageSize = Number(e.target.value)
		setPagination({ pageIndex: 0, pageSize: newPageSize })
	}

	return (
		<div
			className={`
				flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2 sm:gap-4
				px-3 sm:px-4 py-2.5 sm:py-3
				bg-base-100 dark:bg-base-100
				border-t border-base-300 dark:border-base-content/10
				${className}
			`}>
			{/* Left: Page size selector & item count */}
			<div className='flex items-center gap-2 sm:gap-4 text-xs sm:text-sm order-2 sm:order-1'>
				{showPageSizeSelector && (
					<div className='hidden sm:flex items-center gap-2'>
						<span className='text-base-content/60 dark:text-base-content/50'>Rows per page:</span>
						<select
							value={pageSize}
							onChange={handlePageSizeChange}
							className='select select-bordered select-sm w-20 dark:bg-base-200 dark:border-base-content/20'
							aria-label='Rows per page'>
							{pageSizeOptions.map((size) => (
								<option
									key={size}
									value={size}>
									{size}
								</option>
							))}
						</select>
					</div>
				)}

				{showItemCount && (
					<span className='text-base-content/60 dark:text-base-content/50'>
						{totalItems === 0 ? (
							'No items'
						) : (
							<>
								<span className='font-medium text-base-content dark:text-base-content/90'>
									{startItem}
								</span>
								{' - '}
								<span className='font-medium text-base-content dark:text-base-content/90'>
									{endItem}
								</span>
								{' of '}
								<span className='font-medium text-base-content dark:text-base-content/90'>
									{totalItems}
								</span>
							</>
						)}
					</span>
				)}
			</div>

			{/* Right: Navigation buttons - Mobile touch-friendly */}
			<div className='flex items-center gap-0.5 sm:gap-1 order-1 sm:order-2'>
				{/* First Page */}
				<Button
					type='button'
					onClick={goToFirstPage}
					variant='ghost'
					size='sm'
					className='btn-square min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] touch-manipulation'
					aria-label='Go to first page'
					disabled={!canPreviousPage}
					leftIcon={<ChevronsLeft className='h-4 w-4' />}
				/>

				{/* Previous Page */}
				<Button
					type='button'
					onClick={goToPreviousPage}
					variant='ghost'
					size='sm'
					className='btn-square min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] touch-manipulation'
					aria-label='Go to previous page'
					disabled={!canPreviousPage}
					leftIcon={<ChevronLeft className='h-4 w-4' />}
				/>

				{/* Page Numbers */}
				{showPageNumbers && pageCount > 0 && (
					<div className='flex items-center gap-1 mx-1 sm:mx-2'>
						<span className='text-xs sm:text-sm text-base-content/60 dark:text-base-content/50 hidden sm:inline'>
							Page
						</span>
						<span className='badge badge-ghost dark:bg-base-content/10 min-w-[40px] sm:min-w-[50px] justify-center text-xs sm:text-sm'>
							{pageIndex + 1} / {pageCount}
						</span>
					</div>
				)}

				{/* Next Page */}
				<Button
					type='button'
					onClick={goToNextPage}
					variant='ghost'
					size='sm'
					className='btn-square min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] touch-manipulation'
					aria-label='Go to next page'
					disabled={!canNextPage}
					leftIcon={<ChevronRight className='h-4 w-4' />}
				/>

				{/* Last Page */}
				<Button
					type='button'
					onClick={goToLastPage}
					variant='ghost'
					size='sm'
					className='btn-square min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] touch-manipulation'
					aria-label='Go to last page'
					disabled={!canNextPage}
					leftIcon={<ChevronsRight className='h-4 w-4' />}
				/>
			</div>
		</div>
	)
}

export default RichDataGridPagination
