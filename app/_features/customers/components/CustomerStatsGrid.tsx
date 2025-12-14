/**
 * CustomerStatsGrid Component
 * 
 * Displays aggregate customer statistics in a responsive grid layout.
 * Uses shared StatCard component for DRY code.
 * 
 * @module customers/components
 */

'use client'

import { Archive, Building2, Clock, UserCheck } from 'lucide-react'

import StatCard from '@_components/ui/StatCard'

import type { AggregateCustomerStats } from '../types'

interface CustomerStatsGridProps {
	stats: AggregateCustomerStats | null
	isLoading: boolean
	showArchived?: boolean
}

/**
 * CustomerStatsGrid Component
 * 
 * Renders a 2x2 (mobile) or 4x1 (desktop) grid of customer statistics.
 * Automatically handles loading states with skeleton animations.
 */
function CustomerStatsGrid({ stats, isLoading, showArchived }: CustomerStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
			<StatCard
				label="Total"
				value={stats?.totalCustomers ?? 0}
				icon={<Building2 size={24} />}
				isLoading={isLoading}
			/>
			<StatCard
				label="Active"
				value={stats?.activeCustomers ?? 0}
				icon={<Building2 size={24} />}
				colorClass="text-success"
				isLoading={isLoading}
			/>
			<StatCard
				label="Pending"
				value={stats?.pendingVerification ?? 0}
				icon={<Clock size={24} />}
				colorClass="text-warning"
				isLoading={isLoading}
			/>
			{showArchived ? (
				<StatCard
					label="Archived"
					value={(stats?.totalCustomers ?? 0) - (stats?.activeCustomers ?? 0)}
					icon={<Archive size={24} />}
					colorClass="text-base-content/50"
					isLoading={isLoading}
				/>
			) : (
				<StatCard
					label="Assigned"
					value={stats?.assignedToSalesRep ?? 0}
					icon={<UserCheck size={24} />}
					colorClass="text-info"
					isLoading={isLoading}
				/>
			)}
		</div>
	)
}

export default CustomerStatsGrid

