/**
 * RichDataGridToolbar - Main Toolbar Component
 *
 * Composes all toolbar elements: search, filters, actions, visibility toggle.
 * Following MAANG patterns for data grid toolbars.
 *
 * @module RichDataGridToolbar
 */

'use client'

import { RefreshCw, Filter } from 'lucide-react'
import { useRichDataGridContext, useRichDataGridFilters } from '../../context/RichDataGridContext'
import { GlobalSearchInput } from './GlobalSearchInput'
import { ColumnVisibilityDropdown } from './ColumnVisibilityDropdown'
import { BulkActionsDropdown } from './BulkActionsDropdown'
import { type BulkAction } from '../../types'
import Button from '@_components/ui/Button'

// ============================================================================
// PROPS
// ============================================================================

export interface RichDataGridToolbarProps<TData> {
	/** Show global search */
	showSearch?: boolean
	/** Search placeholder */
	searchPlaceholder?: string
	/** Show column visibility toggle */
	showColumnVisibility?: boolean
	/** Show refresh button */
	showRefresh?: boolean
	/** Bulk actions */
	bulkActions?: BulkAction<TData>[]
	/** Left slot content */
	leftSlot?: React.ReactNode
	/** Right slot content */
	rightSlot?: React.ReactNode
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Main toolbar for RichDataGrid.
 * Renders search, filters, actions, and column visibility toggle.
 *
 * @example
 * <RichDataGridToolbar
 *   showSearch
 *   showColumnVisibility
 *   bulkActions={[...]}
 * />
 */
export function RichDataGridToolbar<TData>({
	showSearch = true,
	searchPlaceholder = 'Search...',
	showColumnVisibility = true,
	showRefresh = true,
	bulkActions = [],
	leftSlot,
	rightSlot,
	className = '',
}: RichDataGridToolbarProps<TData>) {
	const { isLoading, isRefreshing, refresh, selectedCount } = useRichDataGridContext()
	const { activeFilterCount, clearColumnFilters } = useRichDataGridFilters()

	return (
		<div
			className={`
			flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3
			p-2 sm:p-3
			bg-base-100 dark:bg-base-100
			border-b border-base-300 dark:border-base-content/10
			${className}
		`}>
			{/* Left Section */}
			<div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
				{/* Global Search */}
				{showSearch && (
					<div className='w-full sm:w-auto sm:max-w-xs flex-1 sm:flex-none'>
						<GlobalSearchInput
							placeholder={searchPlaceholder}
							size='sm'
						/>
					</div>
				)}

				{/* Active Filters Badge - hide on mobile */}
				{activeFilterCount > 0 && (
					<div className='hidden sm:flex items-center gap-2'>
						<div className='badge badge-primary gap-1'>
							<Filter className='h-3 w-3' />
							{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
						</div>
						<Button
							type='button'
							onClick={clearColumnFilters}
							variant='ghost'
							size='xs'
							className='text-xs text-base-content/60 dark:text-base-content/50 hover:text-base-content dark:hover:text-base-content/80 underline h-auto p-0'>
							Clear
						</Button>
					</div>
				)}

				{/* Left Slot */}
				{leftSlot}
			</div>

			{/* Right Section */}
			<div className='flex items-center gap-1 sm:gap-2'>
				{/* Bulk Actions (only shown when rows selected) */}
				{bulkActions.length > 0 && selectedCount > 0 && <BulkActionsDropdown actions={bulkActions} />}

				{/* Right Slot */}
				{rightSlot}

				{/* Refresh Button - Touch-friendly */}
				{showRefresh && (
					<Button
						type='button'
						onClick={refresh}
						variant='ghost'
						size='sm'
						loading={isRefreshing}
						className='btn-square min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] touch-manipulation'
						title='Refresh data'
						aria-label='Refresh data'
						disabled={isLoading || isRefreshing}
						leftIcon={!isRefreshing ? <RefreshCw className='h-4 w-4' /> : undefined}
					/>
				)}

				{/* Column Visibility */}
				{showColumnVisibility && <ColumnVisibilityDropdown />}
			</div>
		</div>
	)
}

export default RichDataGridToolbar
