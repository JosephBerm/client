/**
 * StatCard Component
 * 
 * Reusable stat display card following DaisyUI stat pattern.
 * Mobile-first design with configurable styling.
 * 
 * **Use Cases:**
 * - Dashboard summary stats
 * - Entity aggregate counts
 * - KPI displays
 * 
 * **Design Pattern:**
 * Based on DaisyUI stat component with enhanced styling.
 * Supports icons, colors, and loading states.
 * 
 * @example
 * ```tsx
 * <StatCard
 *   label="Total"
 *   value={100}
 *   icon={<Building2 size={24} />}
 *   colorClass="text-success"
 *   isLoading={false}
 * />
 * ```
 * 
 * @module ui/StatCard
 */

'use client'

import type { ReactNode } from 'react'

/**
 * Props for StatCard component.
 */
export interface StatCardProps {
	/** Label text displayed above the value */
	label: string
	/** Numeric or string value to display */
	value: number | string
	/** Icon element to display */
	icon?: ReactNode
	/** Tailwind color class for icon and value (e.g., 'text-success') */
	colorClass?: string
	/** Whether the stat is loading */
	isLoading?: boolean
	/** Size variant */
	size?: 'sm' | 'md' | 'lg'
	/** Additional className for the container */
	className?: string
}

/**
 * Size configurations for the stat card.
 */
const sizeConfig = {
	sm: {
		padding: 'p-2 sm:p-3',
		title: 'text-[10px] sm:text-xs',
		value: 'text-base sm:text-lg',
		iconSize: 20,
	},
	md: {
		padding: 'p-3 sm:p-4',
		title: 'text-xs sm:text-sm',
		value: 'text-lg sm:text-2xl',
		iconSize: 24,
	},
	lg: {
		padding: 'p-4 sm:p-5',
		title: 'text-sm sm:text-base',
		value: 'text-2xl sm:text-3xl',
		iconSize: 28,
	},
}

/**
 * StatCard Component
 * 
 * Displays a single statistic in a card format.
 * Follows DaisyUI stat pattern with enhanced customization.
 */
function StatCard({
	label,
	value,
	icon,
	colorClass = '',
	isLoading = false,
	size = 'md',
	className = '',
}: StatCardProps) {
	const config = sizeConfig[size]

	return (
		<div className={`stat bg-base-100 rounded-lg shadow-sm ${config.padding} ${className}`}>
			{icon && (
				<div className={`stat-figure ${colorClass || 'text-primary'}`}>
					{icon}
				</div>
			)}
			<div className={`stat-title ${config.title}`}>{label}</div>
			<div className={`stat-value ${config.value} ${colorClass}`}>
				{isLoading ? (
					<span className="loading loading-dots loading-sm" />
				) : (
					value
				)}
			</div>
		</div>
	)
}

export default StatCard

