'use client'

/**
 * AnalyticsKPICard Component
 *
 * KPI metric card for displaying key analytics metrics.
 * Shows value, trend indicator, and optional comparison.
 *
 * @see prd_analytics.md - Section 5.2 Frontend Components
 * @module analytics/components/AnalyticsKPICard
 */

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'

interface AnalyticsKPICardProps {
	/** Card title */
	title: string
	/** Main value to display */
	value: string | number
	/** Optional subtitle */
	subtitle?: string
	/** Change percentage from previous period */
	change?: number
	/** Whether change is considered positive */
	changeIsPositive?: boolean
	/** Icon component */
	icon?: LucideIcon
	/** Icon background color class */
	iconBgColor?: string
	/** Icon color class */
	iconColor?: string
	/** Whether data is loading */
	isLoading?: boolean
	/** Click handler */
	onClick?: () => void
}

/**
 * Format change percentage for display
 */
function formatChange(change: number): string {
	const abs = Math.abs(change)
	if (abs >= 1000) {
		return `${(abs / 1000).toFixed(1)}K`
	}
	return abs.toFixed(1)
}

/**
 * Analytics KPI card for dashboard metrics.
 *
 * @example
 * ```tsx
 * <AnalyticsKPICard
 *   title="Total Revenue"
 *   value="$125,432"
 *   subtitle="Last 12 months"
 *   change={15.3}
 *   changeIsPositive={true}
 *   icon={DollarSign}
 * />
 * ```
 */
export function AnalyticsKPICard({
	title,
	value,
	subtitle,
	change,
	changeIsPositive = true,
	icon: Icon,
	iconBgColor = 'bg-primary/10',
	iconColor = 'text-primary',
	isLoading = false,
	onClick,
}: AnalyticsKPICardProps) {
	if (isLoading) {
		return (
			<div className="card bg-base-100 border border-base-300 shadow-lg">
				<div className="card-body p-5">
					<div className="flex items-start justify-between">
						<div className="flex-1 space-y-2">
							<div className="skeleton h-4 w-24"></div>
							<div className="skeleton h-8 w-32"></div>
							<div className="skeleton h-3 w-16"></div>
						</div>
						<div className="skeleton h-12 w-12 rounded-xl"></div>
					</div>
				</div>
			</div>
		)
	}

	// Determine trend direction and colors
	let TrendIcon = Minus
	let trendColor = 'text-base-content/50'

	if (change !== undefined && change !== 0) {
		if (change > 0) {
			TrendIcon = TrendingUp
			trendColor = changeIsPositive ? 'text-success' : 'text-error'
		} else {
			TrendIcon = TrendingDown
			trendColor = changeIsPositive ? 'text-error' : 'text-success'
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={`card bg-base-100 border border-base-300 shadow-lg hover:shadow-xl transition-all duration-200 ${
				onClick ? 'cursor-pointer hover:-translate-y-1' : ''
			}`}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
		>
			<div className="card-body p-5">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						{/* Title */}
						<p className="text-sm font-medium text-base-content/60 uppercase tracking-wide">
							{title}
						</p>

						{/* Value */}
						<p className="text-3xl font-bold text-base-content mt-1">{value}</p>

						{/* Subtitle */}
						{subtitle && (
							<p className="text-xs text-base-content/50 mt-1">{subtitle}</p>
						)}

						{/* Trend */}
						{change !== undefined && (
							<p className={`text-xs mt-2 flex items-center gap-1 ${trendColor}`}>
								<TrendIcon className="h-3 w-3" />
								<span className="font-medium">
									{change >= 0 ? '+' : '-'}
									{formatChange(change)}%
								</span>
								<span className="text-base-content/50">vs prev period</span>
							</p>
						)}
					</div>

					{/* Icon */}
					{Icon && (
						<div className={`p-3 ${iconBgColor} rounded-xl`}>
							<Icon className={`w-6 h-6 ${iconColor}`} />
						</div>
					)}
				</div>
			</div>
		</motion.div>
	)
}

export default AnalyticsKPICard

