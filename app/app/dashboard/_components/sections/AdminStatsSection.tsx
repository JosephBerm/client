'use client'

/**
 * Admin Stats Section
 *
 * Displays dashboard statistics for Admin users.
 * Shows active users, total quotes, total orders, and system health.
 *
 * @see prd_dashboard.md - Admin Dashboard section
 * @module dashboard/sections/AdminStatsSection
 */

import { useRouter } from 'next/navigation'

import { Activity, FileText, Package, Users } from 'lucide-react'

import type { DashboardStats } from '@_types/dashboard.types'

import { StatsCard } from '../StatsCard'

// =============================================================================
// TYPES
// =============================================================================

interface AdminStatsSectionProps {
	/** Dashboard statistics data */
	stats: DashboardStats | null | undefined
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AdminStatsSection({ stats }: AdminStatsSectionProps) {
	const router = useRouter()

	return (
		<>
			<StatsCard
				title="Active Users"
				value={stats?.totalActiveUsers ?? 0}
				subtitle="All roles"
				icon={Users}
			/>
			<StatsCard
				title="Total Quotes"
				value={stats?.totalQuotes ?? 0}
				subtitle="All time"
				icon={FileText}
				onClick={() => router.push('/app/quotes')}
			/>
			<StatsCard
				title="Total Orders"
				value={stats?.totalOrders ?? 0}
				subtitle="All time"
				icon={Package}
				onClick={() => router.push('/app/orders')}
			/>
			<StatsCard
				title="System Health"
				value={`${stats?.systemHealth ?? 0}%`}
				subtitle="Uptime"
				icon={Activity}
			/>
		</>
	)
}

export default AdminStatsSection

