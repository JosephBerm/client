/**
 * FilterableStatCard Component
 *
 * An enhanced stat card that supports click-to-filter functionality.
 * Built for dashboard stat grids where clicking a stat filters associated data.
 *
 * **Features:**
 * - Click interaction with visual feedback
 * - Selected state with ring indicator
 * - Keyboard accessibility (Enter key support)
 * - Hover effects for clickable cards
 * - Mobile-first responsive design
 * - DaisyUI theme integration
 *
 * **Use Cases:**
 * - Status filter cards (Total, Active, Pending, Archived)
 * - Dashboard KPI cards with drill-down filtering
 * - Any stat that should filter a data table when clicked
 *
 * @module ui/FilterableStatCard
 */

'use client'

import type { ReactNode, KeyboardEvent } from 'react'

/**
 * Props for FilterableStatCard component.
 */
export interface FilterableStatCardProps {
	/** Icon element to display */
	icon: ReactNode
	/** Label text displayed above the value */
	label: string
	/** Numeric value to display (null shows dash) */
	value: number | null
	/** Whether the stat is loading */
	isLoading: boolean
	/** Tailwind text color class (e.g., 'text-success') */
	color: string
	/** Tailwind background color class (e.g., 'bg-success/10') */
	bgColor: string
	/** Whether this card is currently selected/active */
	isSelected?: boolean
	/** Click handler - if provided, card becomes interactive */
	onClick?: () => void
	/** Additional className for the container */
	className?: string
}

/**
 * FilterableStatCard Component
 *
 * Displays a single statistic with optional click-to-filter capability.
 * When onClick is provided, the card becomes interactive with hover effects
 * and keyboard accessibility.
 *
 * @example
 * ```tsx
 * // Non-clickable stat card
 * <FilterableStatCard
 *   icon={<Calendar className="w-4 h-4" />}
 *   label="New This Month"
 *   value={5}
 *   isLoading={false}
 *   color="text-info"
 *   bgColor="bg-info/10"
 * />
 *
 * // Clickable/filterable stat card
 * <FilterableStatCard
 *   icon={<CheckCircle className="w-4 h-4" />}
 *   label="Active"
 *   value={stats.activeCount}
 *   isLoading={false}
 *   color="text-success"
 *   bgColor="bg-success/10"
 *   isSelected={filter === 'active'}
 *   onClick={() => setFilter('active')}
 * />
 * ```
 */
function FilterableStatCard({
	icon,
	label,
	value,
	isLoading,
	color,
	bgColor,
	isSelected = false,
	onClick,
	className = '',
}: FilterableStatCardProps) {
	const isClickable = !!onClick

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (isClickable && e.key === 'Enter') {
			onClick?.()
		}
	}

	return (
		<div
			className={`
				card bg-base-100 shadow-sm transition-all duration-200
				${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
				${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100' : ''}
				${className}
			`}
			onClick={onClick}
			role={isClickable ? 'button' : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onKeyDown={isClickable ? handleKeyDown : undefined}
			aria-pressed={isClickable ? isSelected : undefined}
		>
			<div className="card-body p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${bgColor} flex items-center justify-center shrink-0`}>
						<span className={color}>{icon}</span>
					</div>
					<div className="min-w-0">
						<p className="text-xs text-base-content/60 truncate">{label}</p>
						<p className="text-lg sm:text-xl font-bold">
							{isLoading ? (
								<span className="loading loading-dots loading-sm" />
							) : (
								value ?? '—'
							)}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default FilterableStatCard
