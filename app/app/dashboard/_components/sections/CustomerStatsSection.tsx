'use client'

/**
 * Customer Stats Section
 *
 * Displays dashboard statistics for Customer users.
 * Shows pending quotes, active orders, approved quotes, and total spent.
 *
 * @see prd_dashboard.md - Customer Dashboard section
 * @module dashboard/sections/CustomerStatsSection
 */

import { useRouter } from 'next/navigation'

import { DollarSign, FileText, Package, ShoppingCart } from 'lucide-react'

import { formatCurrency } from '@_lib/formatters/currency'

import type { DashboardStats } from '@_types/dashboard.types'

import { StatsCard } from '../StatsCard'

// =============================================================================
// TYPES
// =============================================================================

interface CustomerStatsSectionProps {
	/** Dashboard statistics data */
	stats: DashboardStats | null | undefined
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CustomerStatsSection({ stats }: CustomerStatsSectionProps) {
	const router = useRouter()

	return (
		<>
			<StatsCard
				title="Pending Quotes"
				value={stats?.pendingQuotes ?? 0}
				subtitle="Awaiting response"
				icon={FileText}
				onClick={() => router.push('/app/quotes?status=pending')}
			/>
			<StatsCard
				title="Active Orders"
				value={stats?.activeOrders ?? 0}
				subtitle="In progress"
				icon={Package}
				onClick={() => router.push('/app/orders')}
			/>
			<StatsCard
				title="Approved Quotes"
				value={stats?.approvedQuotes ?? 0}
				subtitle="Ready to order"
				icon={ShoppingCart}
				onClick={() => router.push('/app/quotes?status=approved')}
			/>
			<StatsCard
				title="Total Spent"
				value={formatCurrency(stats?.totalSpent ?? 0)}
				subtitle="All time"
				icon={DollarSign}
			/>
		</>
	)
}

export default CustomerStatsSection

