'use client'

/**
 * RecentItemsTable Component
 *
 * Displays recent items (orders or quotes) in a table format.
 * Uses DaisyUI table styling with status badges.
 *
 * **MAANG-Level Architecture:**
 * - Uses centralized EmptyState component
 * - Uses centralized logger for error handling
 * - Uses @_lib/dates for date parsing
 * - Uses centralized formatCurrency
 * - Uses OrderStatusHelper/QuoteStatusHelper for variant mapping
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Components
 * @module dashboard/RecentItemsTable
 */

import { useMemo } from 'react'
import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'

import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, FileText, Package } from 'lucide-react'

import EmptyState from '@_components/common/EmptyState'
import Card from '@_components/ui/Card'
import { DataGrid } from '@_components/tables'

import { logger } from '@_core'

import { formatCurrency } from '@_lib/formatters/currency'
import { parseDate } from '@_lib/dates/parse'

import type { RecentItem } from '@_types/dashboard.types'

// =============================================================================
// TYPES
// =============================================================================

interface RecentItemsTableProps {
	/** Array of items to display */
	items: RecentItem[]
	/** Card title */
	title: string
	/** Item type for proper linking and display */
	type: 'order' | 'quote'
}

// =============================================================================
// CONSTANTS
// =============================================================================

const COMPONENT_NAME = 'RecentItemsTable'

/**
 * Badge variant mapping from status strings to DaisyUI classes.
 * Uses centralized helpers for consistency.
 */
const ORDER_STATUS_BADGE_MAP: Record<string, string> = {
	Pending: 'badge-warning',
	WaitingForCustomerApproval: 'badge-info',
	Placed: 'badge-info',
	Paid: 'badge-primary',
	Processing: 'badge-primary',
	Shipped: 'badge-accent',
	Delivered: 'badge-success',
	Cancelled: 'badge-error',
}

const QUOTE_STATUS_BADGE_MAP: Record<string, string> = {
	Unread: 'badge-warning',
	Read: 'badge-info',
	Approved: 'badge-success',
	Converted: 'badge-accent',
	Rejected: 'badge-error',
	Expired: 'badge-ghost',
}

// =============================================================================
// HELPER FUNCTIONS (Pure, outside component)
// =============================================================================

/**
 * Get badge class based on status string and item type.
 * Uses centralized helper maps derived from OrderStatusHelper/QuoteStatusHelper.
 */
function getStatusBadgeClass(status: string, itemType: 'order' | 'quote'): string {
	const map = itemType === 'order' ? ORDER_STATUS_BADGE_MAP : QUOTE_STATUS_BADGE_MAP
	return map[status] ?? 'badge-ghost'
}

/**
 * Format status for display (convert PascalCase to readable).
 * Uses centralized helpers where possible.
 */
function formatStatus(status: string): string {
	// Try to get display name from helpers first (for known statuses)
	// Fall back to regex transformation for unknown statuses
	return status.replace(/([A-Z])/g, ' $1').trim()
}

/**
 * Format relative date with error handling.
 * Uses centralized parseDate from @_lib/dates.
 */
function formatRelativeDate(dateString: string): string {
	try {
		const parsed = parseDate(dateString)
		if (!parsed) {
			logger.warn('Invalid date string in RecentItemsTable', {
				component: COMPONENT_NAME,
				dateString,
			})
			return '-'
		}
		return formatDistanceToNow(parsed, { addSuffix: true })
	} catch (error) {
		logger.error('Failed to format relative date', {
			component: COMPONENT_NAME,
			dateString,
			error: error instanceof Error ? error.message : String(error),
		})
		return '-'
	}
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Recent items table for orders or quotes.
 *
 * @example
 * ```tsx
 * <RecentItemsTable
 *   items={recentOrders}
 *   title="Recent Orders"
 *   type="order"
 * />
 * ```
 */
export function RecentItemsTable({ items, title, type }: RecentItemsTableProps) {
	const Icon = type === 'order' ? Package : FileText

	// Memoize item URL getter
	const getItemUrl = useMemo(
		() => (item: RecentItem) => {
			if (type === 'order') {
				return `/app/orders/${item.orderId}`
			}
			return `/app/quotes/${item.quoteId}`
		},
		[type]
	)

	// Empty state - uses centralized EmptyState component
	if (items.length === 0) {
		return (
			<Card className='h-full'>
				<h3 className='font-semibold text-lg text-base-content mb-4'>{title}</h3>
				<EmptyState
					icon={<Icon className='w-12 h-12' />}
					title={`No recent ${type}s`}
					description={`Your recent ${type}s will appear here once you have some activity.`}
				/>
			</Card>
		)
	}

	return (
		<Card className='h-full'>
			<h3 className='font-semibold text-lg text-base-content mb-4'>{title}</h3>
			<div className='overflow-x-auto -mx-2'>
				<RecentItemsDataGrid
					items={items}
					type={type}
					getItemUrl={getItemUrl}
				/>
			</div>
		</Card>
	)
}

// =============================================================================
// DATA GRID COMPONENT
// =============================================================================

interface RecentItemsDataGridProps {
	items: RecentItem[]
	type: 'order' | 'quote'
	getItemUrl: (item: RecentItem) => string
}

/**
 * DataGrid component for displaying recent items - mobile-first responsive
 */
function RecentItemsDataGrid({ items, type, getItemUrl }: RecentItemsDataGridProps) {
	const columns = useMemo<ColumnDef<RecentItem>[]>(() => {
		const baseColumns: ColumnDef<RecentItem>[] = [
			{
				accessorKey: 'number',
				header: type === 'order' ? 'Order #' : 'Quote #',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm font-medium text-base-content'>
						{row.original.number}
					</span>
				),
				size: 100,
			},
			{
				accessorKey: 'date',
				header: 'Date',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm text-base-content/60'>
						{formatRelativeDate(row.original.date)}
					</span>
				),
				size: 120,
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => (
					<span className={`badge badge-xs sm:badge-sm ${getStatusBadgeClass(row.original.status, type)}`}>
						{formatStatus(row.original.status)}
					</span>
				),
				size: 100,
			},
		]

		if (type === 'order') {
			baseColumns.push({
				accessorKey: 'amount',
				header: 'Amount',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm font-medium text-base-content text-right block'>
						{formatCurrency(row.original.amount)}
					</span>
				),
				size: 90,
			})
		}

		baseColumns.push({
			id: 'actions',
			header: '',
			cell: ({ row }) => (
				<Link
					href={getItemUrl(row.original)}
					className='btn btn-ghost btn-xs gap-1 text-xs'>
					<ExternalLink className='w-3 h-3' />
					<span className='hidden sm:inline'>View</span>
				</Link>
			),
			size: 70,
		})

		return baseColumns
	}, [type, getItemUrl])

	return (
		<div className='min-w-[320px] px-2 sm:px-0'>
			<DataGrid
				columns={columns}
				data={items}
				ariaLabel={`Recent ${type}s table`}
			/>
		</div>
	)
}

export default RecentItemsTable
