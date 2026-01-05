/**
 * CustomerStatsGrid Component
 *
 * Displays aggregate customer statistics in a responsive grid layout.
 * Supports click-to-filter functionality on stat cards.
 *
 * **Features:**
 * - Clickable stat cards that filter the customer table
 * - Visual selection indicator (ring) on active filter
 * - Mobile-first responsive grid (2 cols mobile, 4 cols desktop)
 * - DaisyUI theme integration
 *
 * @module customers/components
 */

'use client'

import { Archive, Building2, CheckCircle, Clock } from 'lucide-react'

import FilterableStatCard from '@_components/ui/FilterableStatCard'

import type { AggregateCustomerStats, CustomerStatusKey } from '../types'

interface CustomerStatsGridProps {
	/** Customer statistics data */
	stats: AggregateCustomerStats | null
	/** Whether stats are loading */
	isLoading: boolean
	/** Currently selected status filter */
	selectedFilter?: CustomerStatusKey | 'all'
	/** Callback when a stat card is clicked */
	onFilterClick?: (filter: CustomerStatusKey | 'all') => void
}

/**
 * CustomerStatsGrid Component
 *
 * Renders a responsive grid of customer statistics cards.
 * Cards are clickable to filter the customer list by status.
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useState<CustomerStatusKey | 'all'>('all')
 *
 * <CustomerStatsGrid
 *   stats={stats}
 *   isLoading={isLoading}
 *   selectedFilter={filter}
 *   onFilterClick={setFilter}
 * />
 * ```
 */
function CustomerStatsGrid({
	stats,
	isLoading,
	selectedFilter,
	onFilterClick,
}: CustomerStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
			<FilterableStatCard
				icon={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Total"
				value={stats?.totalCustomers ?? null}
				isLoading={isLoading}
				color="text-primary"
				bgColor="bg-primary/10"
				isSelected={selectedFilter === 'all'}
				onClick={onFilterClick ? () => onFilterClick('all') : undefined}
			/>
			<FilterableStatCard
				icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Active"
				value={stats?.activeCustomers ?? null}
				isLoading={isLoading}
				color="text-success"
				bgColor="bg-success/10"
				isSelected={selectedFilter === 'Active'}
				onClick={onFilterClick ? () => onFilterClick('Active') : undefined}
			/>
			<FilterableStatCard
				icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Pending"
				value={stats?.pendingVerification ?? null}
				isLoading={isLoading}
				color="text-warning"
				bgColor="bg-warning/10"
				isSelected={selectedFilter === 'PendingVerification'}
				onClick={onFilterClick ? () => onFilterClick('PendingVerification') : undefined}
			/>
			<FilterableStatCard
				icon={<Archive className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Inactive"
				value={stats?.inactiveCustomers ?? null}
				isLoading={isLoading}
				color="text-error"
				bgColor="bg-error/10"
				isSelected={selectedFilter === 'Inactive'}
				onClick={onFilterClick ? () => onFilterClick('Inactive') : undefined}
			/>
		</div>
	)
}

export default CustomerStatsGrid
