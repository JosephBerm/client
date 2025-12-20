'use client'

/**
 * Manager Stats Section
 *
 * Displays dashboard statistics for Sales Manager users.
 * Shows team active quotes, team conversion, monthly revenue, and unassigned quotes.
 *
 * @see prd_dashboard.md - Sales Manager Dashboard section
 * @module dashboard/sections/ManagerStatsSection
 */

import { useRouter } from 'next/navigation'

import { AlertCircle, DollarSign, FileText, TrendingUp } from 'lucide-react'

import { formatCurrency } from '@_lib/formatters/currency'

import type { DashboardStats } from '@_types/dashboard.types'

import { StatsCard } from '../StatsCard'

// =============================================================================
// TYPES
// =============================================================================

interface ManagerStatsSectionProps {
	/** Dashboard statistics data */
	stats: DashboardStats | null | undefined
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ManagerStatsSection({ stats }: ManagerStatsSectionProps) {
	const router = useRouter()

	return (
		<>
			<StatsCard
				title="Team Active Quotes"
				value={stats?.teamActiveQuotes ?? 0}
				subtitle="All reps"
				icon={FileText}
				onClick={() => router.push('/app/quotes')}
			/>
			<StatsCard
				title="Team Conversion"
				value={`${stats?.teamConversionRate ?? 0}%`}
				subtitle="This month"
				icon={TrendingUp}
			/>
			<StatsCard
				title="Monthly Revenue"
				value={formatCurrency(stats?.monthlyRevenue ?? 0)}
				subtitle="This month"
				icon={DollarSign}
			/>
			<StatsCard
				title="Unassigned"
				value={stats?.unassignedQuotes ?? 0}
				subtitle="Quotes need assignment"
				icon={AlertCircle}
				onClick={() => router.push('/app/quotes?unassigned=true')}
			/>
		</>
	)
}

export default ManagerStatsSection

