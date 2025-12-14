/**
 * CustomerStatsCard Component
 * 
 * Displays key customer statistics in a compact card format.
 * Mobile-first responsive design with grid layout.
 * 
 * @module customers/components
 */

'use client'

import { DollarSign, FileText, Package, Users } from 'lucide-react'

import { formatDate } from '@_lib/dates'

import type { CustomerStats } from '../types'

interface CustomerStatsCardProps {
	/** Customer statistics data */
	stats: CustomerStats
	/** Loading state */
	isLoading?: boolean
	/** Additional CSS classes */
	className?: string
}

/**
 * Stat item component for individual metrics.
 */
function StatItem({
	icon: Icon,
	label,
	value,
	isLoading,
}: {
	icon: typeof Package
	label: string
	value: string | number
	isLoading?: boolean
}) {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-2 text-base-content/60">
				<Icon size={14} aria-hidden="true" />
				<span className="text-xs font-medium uppercase tracking-wide">{label}</span>
			</div>
			{isLoading ? (
				<div className="skeleton h-6 w-16" />
			) : (
				<span className="text-lg font-semibold text-base-content">{value}</span>
			)}
		</div>
	)
}

/**
 * CustomerStatsCard Component
 * 
 * Renders customer statistics in a grid layout.
 * Shows orders, quotes, accounts, and revenue metrics.
 */
function CustomerStatsCard({
	stats,
	isLoading = false,
	className = '',
}: CustomerStatsCardProps) {
	const formattedRevenue = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(stats.totalRevenue)

	const lastActivity = stats.lastOrderDate
		? formatDate(stats.lastOrderDate, 'short')
		: 'No orders yet'

	return (
		<div className={`card bg-base-100 border border-base-300 ${className}`}>
			<div className="card-body p-4 sm:p-6">
				<h3 className="card-title text-base mb-4">Customer Overview</h3>
				
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<StatItem
						icon={Package}
						label="Orders"
						value={stats.totalOrders}
						isLoading={isLoading}
					/>
					<StatItem
						icon={FileText}
						label="Quotes"
						value={stats.totalQuotes}
						isLoading={isLoading}
					/>
					<StatItem
						icon={Users}
						label="Accounts"
						value={stats.totalAccounts}
						isLoading={isLoading}
					/>
					<StatItem
						icon={DollarSign}
						label="Revenue"
						value={formattedRevenue}
						isLoading={isLoading}
					/>
				</div>

				<div className="divider my-2" />

				<div className="flex flex-col gap-1 sm:flex-row sm:justify-between text-sm text-base-content/70">
					<span>
						<strong>Customer since:</strong> {formatDate(stats.createdAt, 'short')}
					</span>
					<span>
						<strong>Last activity:</strong> {lastActivity}
					</span>
				</div>
			</div>
		</div>
	)
}

export default CustomerStatsCard

