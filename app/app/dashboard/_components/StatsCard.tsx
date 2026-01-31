'use client'

/**
 * StatsCard Component
 *
 * Displays a single statistic in a card format with icon and optional trend.
 * Used in the dashboard stats row to show role-specific metrics.
 *
 * Handles edge cases where percentage changes would be misleading:
 * - 0 current value with percentage change → Shows "No data" instead
 * - Undefined/NaN changes → Gracefully hidden
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Components
 * @module dashboard/StatsCard
 */

import { motion } from 'framer-motion'

import type { LucideIcon } from 'lucide-react'

import Card from '@_components/ui/Card'

import { formatPercentageChange } from '../../analytics/_utils/formatters'

interface StatsTrend {
	/** Trend percentage value */
	value: number
	/** Trend description (e.g., "vs last month") */
	label: string
	/** Whether the trend is positive (for coloring direction) */
	isPositive: boolean
}

interface StatsCardProps {
	/** Card title/label */
	title: string
	/** Main value to display */
	value: string | number
	/** Raw numeric value for edge case detection (optional) */
	rawValue?: number
	/** Optional subtitle/description */
	subtitle?: string
	/** Lucide icon component */
	icon: LucideIcon
	/** Optional trend indicator */
	trend?: StatsTrend
	/** Click handler for card navigation */
	onClick?: () => void
	/** Additional CSS classes */
	className?: string
}

/**
 * Stats card for displaying dashboard metrics.
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Pending Quotes"
 *   value={5}
 *   rawValue={5}
 *   subtitle="Awaiting response"
 *   icon={FileText}
 *   onClick={() => router.push('/app/quotes?status=pending')}
 * />
 * ```
 */
export function StatsCard({
	title,
	value,
	rawValue,
	subtitle,
	icon,
	trend,
	onClick,
	className = '',
}: StatsCardProps) {
	const IconComponent = icon

	// Extract numeric value for edge case detection
	const numericValue = rawValue ?? (typeof value === 'number' ? value : undefined)

	// Format the percentage change with intelligent edge case handling
	const changeResult = trend
		? formatPercentageChange(trend.value, numericValue)
		: null

	// Trend-based background gradient for visual indication
	// Positive trends get subtle green tint, negative get subtle red tint
	const trendBackground = trend?.isPositive
		? 'bg-gradient-to-br from-success/5 to-transparent'
		: trend?.isPositive === false
			? 'bg-gradient-to-br from-error/5 to-transparent'
			: ''

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Card
				variant="stat"
				compact
				hover={!!onClick}
				className={`${onClick ? 'cursor-pointer' : ''} ${trendBackground} ${className}`}
				onClick={onClick}
				role={onClick ? 'button' : undefined}
				tabIndex={onClick ? 0 : undefined}
				onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
			>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<p className="text-sm font-medium text-base-content/60 uppercase tracking-wide">
							{title}
						</p>
						<p className="text-metric text-3xl text-base-content mt-1">{value}</p>
						{subtitle && (
							<p className="text-xs text-base-content/50 mt-1">{subtitle}</p>
						)}
						{/* Trend - with intelligent edge case handling */}
						{changeResult?.shouldShow && (
							<p
								className={`text-xs mt-2 flex items-center gap-1 ${
									changeResult.isNeutral
										? 'text-base-content/50'
										: trend?.isPositive
											? 'text-success'
											: 'text-error'
								}`}
								aria-label={changeResult.ariaLabel}
							>
								<span className="font-medium">
									{!changeResult.isNeutral && (changeResult.isPositive ? '↑' : '↓')}{' '}
									{changeResult.displayText}
								</span>
								{!changeResult.isNeutral && trend?.label && (
									<span className="text-base-content/50">{trend.label}</span>
								)}
							</p>
						)}
					</div>
					<div className="p-3 bg-primary/10 rounded-xl">
						<IconComponent className="w-6 h-6 text-primary" aria-hidden="true" />
					</div>
				</div>
			</Card>
		</motion.div>
	)
}

export default StatsCard

