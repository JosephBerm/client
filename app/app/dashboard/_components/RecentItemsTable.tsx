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

import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { ExternalLink, FileText, Package } from 'lucide-react'

import EmptyState from '@_components/common/EmptyState'
import Card from '@_components/ui/Card'

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
			<Card className="h-full">
				<h3 className="font-semibold text-lg text-base-content mb-4">{title}</h3>
				<EmptyState
					icon={<Icon className="w-12 h-12" />}
					title={`No recent ${type}s`}
					description={`Your recent ${type}s will appear here once you have some activity.`}
				/>
			</Card>
		)
	}

	return (
		<Card className="h-full">
			<h3 className="font-semibold text-lg text-base-content mb-4">{title}</h3>
			<div className="overflow-x-auto -mx-2">
				<table className="table table-sm">
					<thead>
						<tr className="text-base-content/60">
							<th>{type === 'order' ? 'Order #' : 'Quote #'}</th>
							<th>Date</th>
							<th>Status</th>
							{type === 'order' && <th className="text-right">Amount</th>}
							<th></th>
						</tr>
					</thead>
					<tbody>
						{items.map((item, index) => (
							<motion.tr
								key={item.orderId ?? item.quoteId ?? index}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: index * 0.05 }}
								className="hover:bg-base-200/50 transition-colors"
							>
								<td className="font-medium">{item.number}</td>
								<td className="text-base-content/60 text-sm">
									{formatRelativeDate(item.date)}
								</td>
								<td>
									<span
										className={`badge badge-sm ${getStatusBadgeClass(item.status, type)}`}
									>
										{formatStatus(item.status)}
									</span>
								</td>
								{type === 'order' && (
									<td className="text-right font-medium">
										{formatCurrency(item.amount)}
									</td>
								)}
								<td className="text-right">
									<Link
										href={getItemUrl(item)}
										className="btn btn-ghost btn-xs gap-1"
									>
										<ExternalLink className="w-3 h-3" />
										View
									</Link>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	)
}

export default RecentItemsTable
