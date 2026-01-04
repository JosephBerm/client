'use client'

/**
 * AnalyticsKPICard Component
 *
 * KPI metric card for displaying key analytics metrics.
 * Shows value, trend indicator, and optional comparison.
 *
 * Handles edge cases where percentage changes would be misleading:
 * - 0 current value with percentage change → Shows "No data" instead
 * - Undefined/NaN changes → Gracefully hidden or shows "N/A"
 *
 * @see prd_analytics.md - Section 5.2 Frontend Components
 * @module analytics/components/AnalyticsKPICard
 */

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'

import { formatPercentageChange } from '../_utils/formatters'

interface AnalyticsKPICardProps {
	/** Card title */
	title: string
	/** Main value to display */
	value: string | number
	/** Raw numeric value for edge case detection (optional, extracted from value if numeric) */
	rawValue?: number
	/** Optional subtitle */
	subtitle?: string
	/** Change percentage from previous period */
	change?: number
	/** Whether change is considered positive (for coloring direction) */
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
 * Analytics KPI card for dashboard metrics.
 *
 * @example
 * ```tsx
 * <AnalyticsKPICard
 *   title="Total Revenue"
 *   value="$125,432"
 *   rawValue={125432}
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
	rawValue,
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

	// Extract numeric value for edge case detection
	// If rawValue is provided, use it; otherwise try to extract from value if it's a number
	const numericValue = rawValue ?? (typeof value === 'number' ? value : undefined)

	// Format the percentage change with intelligent edge case handling
	const changeResult = formatPercentageChange(change, numericValue)

	// Determine trend direction and colors
	let TrendIcon = Minus
	let trendColor = 'text-base-content/50'

	if (changeResult.shouldShow && !changeResult.isNeutral) {
		if (changeResult.isPositive) {
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

						{/* Trend - with intelligent edge case handling */}
						{changeResult.shouldShow && (
							<p
								className={`text-xs mt-2 flex items-center gap-1 ${trendColor}`}
								aria-label={changeResult.ariaLabel}
							>
								<TrendIcon className="h-3 w-3" aria-hidden="true" />
								<span className="font-medium">{changeResult.displayText}</span>
								{!changeResult.isNeutral && (
									<span className="text-base-content/50">vs prev period</span>
								)}
							</p>
						)}
					</div>

					{/* Icon */}
					{Icon && (
						<div className={`p-3 ${iconBgColor} rounded-xl`}>
							<Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
						</div>
					)}
				</div>
			</div>
		</motion.div>
	)
}

export default AnalyticsKPICard

