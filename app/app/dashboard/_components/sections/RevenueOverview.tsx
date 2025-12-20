'use client'

/**
 * Revenue Overview Component
 *
 * Displays revenue breakdown for Admin users.
 * Shows today, this week, and this month revenue with order counts.
 *
 * @see prd_dashboard.md - Admin Revenue Overview section
 * @module dashboard/sections/RevenueOverview
 */

import { motion } from 'framer-motion'

import { formatCurrency } from '@_lib/formatters/currency'

import type { RevenueOverview as RevenueOverviewData } from '@_types/dashboard.types'

// =============================================================================
// TYPES
// =============================================================================

interface RevenueOverviewProps {
	/** Revenue overview data */
	data: RevenueOverviewData
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface RevenueCardProps {
	label: string
	revenue: number
	orders: number
}

function RevenueCard({ label, revenue, orders }: RevenueCardProps) {
	return (
		<div className="bg-base-200/50 rounded-xl p-4">
			<p className="text-sm text-base-content/60">{label}</p>
			<p className="text-2xl font-bold text-base-content">
				{formatCurrency(revenue)}
			</p>
			<p className="text-xs text-base-content/50">
				{orders} order{orders !== 1 ? 's' : ''}
			</p>
		</div>
	)
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RevenueOverview({ data }: RevenueOverviewProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			className="card bg-base-100 border border-base-300 shadow-lg"
		>
			<div className="card-body">
				<h3 className="font-semibold text-lg text-base-content mb-4">
					Revenue Overview
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<RevenueCard
						label="Today"
						revenue={data.todayRevenue}
						orders={data.todayOrders}
					/>
					<RevenueCard
						label="This Week"
						revenue={data.weekRevenue}
						orders={data.weekOrders}
					/>
					<RevenueCard
						label="This Month"
						revenue={data.monthRevenue}
						orders={data.monthOrders}
					/>
				</div>
			</div>
		</motion.div>
	)
}

export default RevenueOverview

