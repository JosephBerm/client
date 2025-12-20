'use client'

/**
 * Fulfillment Stats Section
 *
 * Displays dashboard statistics for Fulfillment Coordinator users.
 * Shows ready to ship, in transit, on-time rate, and processing time.
 *
 * @see prd_dashboard.md - Fulfillment Dashboard section
 * @module dashboard/sections/FulfillmentStatsSection
 */

import { useRouter } from 'next/navigation'

import { Activity, Clock, Package, Truck } from 'lucide-react'

import type { DashboardStats } from '@_types/dashboard.types'

import { StatsCard } from '../StatsCard'

// =============================================================================
// TYPES
// =============================================================================

interface FulfillmentStatsSectionProps {
	/** Dashboard statistics data */
	stats: DashboardStats | null | undefined
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FulfillmentStatsSection({ stats }: FulfillmentStatsSectionProps) {
	const router = useRouter()

	return (
		<>
			<StatsCard
				title="Ready to Ship"
				value={stats?.ordersReadyToShip ?? 0}
				subtitle="Awaiting fulfillment"
				icon={Package}
				onClick={() => router.push('/app/orders?status=processing')}
			/>
			<StatsCard
				title="In Transit"
				value={stats?.ordersInTransit ?? 0}
				subtitle="On the way"
				icon={Truck}
				onClick={() => router.push('/app/orders?status=shipped')}
			/>
			<StatsCard
				title="On-Time Rate"
				value={`${stats?.onTimeRate ?? 0}%`}
				subtitle="Delivery performance"
				icon={Activity}
			/>
			<StatsCard
				title="Avg. Processing"
				value={`${stats?.avgProcessingDays ?? 0}d`}
				subtitle="Days to ship"
				icon={Clock}
			/>
		</>
	)
}

export default FulfillmentStatsSection

