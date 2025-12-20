'use client'

/**
 * Recent Activity Section
 *
 * Displays recent orders and quotes in a grid layout.
 * Composes RecentItemsTable components for each activity type.
 *
 * @see prd_dashboard.md - Recent Activity section
 * @module dashboard/sections/RecentActivitySection
 */

import type { RecentItem } from '@_types/dashboard.types'

import { RecentItemsTable } from '../RecentItemsTable'

// =============================================================================
// TYPES
// =============================================================================

interface RecentActivitySectionProps {
	/** Recent orders list */
	orders: RecentItem[]
	/** Recent quotes list */
	quotes: RecentItem[]
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RecentActivitySection({ orders, quotes }: RecentActivitySectionProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<RecentItemsTable
				items={orders}
				title="Recent Orders"
				type="order"
			/>
			<RecentItemsTable
				items={quotes}
				title="Recent Quotes"
				type="quote"
			/>
		</div>
	)
}

export default RecentActivitySection

