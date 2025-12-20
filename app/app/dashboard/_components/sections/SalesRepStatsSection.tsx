'use client'

/**
 * Sales Rep Stats Section
 *
 * Displays dashboard statistics for Sales Representative users.
 * Shows unread quotes, pending payments, conversion rate, and turnaround time.
 *
 * @see prd_dashboard.md - Sales Rep Dashboard section
 * @module dashboard/sections/SalesRepStatsSection
 */

import { useRouter } from 'next/navigation'

import { BarChart3, Clock, FileText, TrendingUp } from 'lucide-react'

import type { DashboardStats } from '@_types/dashboard.types'

import { StatsCard } from '../StatsCard'

// =============================================================================
// TYPES
// =============================================================================

interface SalesRepStatsSectionProps {
	/** Dashboard statistics data */
	stats: DashboardStats | null | undefined
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SalesRepStatsSection({ stats }: SalesRepStatsSectionProps) {
	const router = useRouter()

	return (
		<>
			<StatsCard
				title="Unread Quotes"
				value={stats?.unreadQuotes ?? 0}
				subtitle="Need attention"
				icon={FileText}
				onClick={() => router.push('/app/quotes?status=unread')}
			/>
			<StatsCard
				title="Pending Payment"
				value={stats?.ordersPendingPayment ?? 0}
				subtitle="Orders awaiting"
				icon={Clock}
				onClick={() => router.push('/app/orders?status=placed')}
			/>
			<StatsCard
				title="Conversion Rate"
				value={`${stats?.conversionRate ?? 0}%`}
				subtitle="This month"
				icon={TrendingUp}
			/>
			<StatsCard
				title="Avg. Turnaround"
				value={`${stats?.avgTurnaroundHours ?? 0}h`}
				subtitle="Quote to approval"
				icon={BarChart3}
			/>
		</>
	)
}

export default SalesRepStatsSection

