'use client'

/**
 * ChartLegend
 *
 * Legend component for multi-series charts.
 * Supports interactive toggle and accessibility.
 *
 * @module charts/components/ChartLegend
 */

import { type ReactNode, type KeyboardEvent } from 'react'
import classNames from 'classnames'

export interface LegendItem {
	/** Unique identifier */
	id: string
	/** Display label */
	label: string
	/** Color for the legend marker */
	color: string
	/** Whether this series is currently visible */
	visible?: boolean
	/** Value to display (optional) */
	value?: string
}

interface ChartLegendProps {
	/** Legend items to display */
	items: LegendItem[]
	/** Called when an item is toggled */
	onToggle?: (id: string) => void
	/** Layout direction */
	direction?: 'horizontal' | 'vertical'
	/** Position hint for styling */
	position?: 'top' | 'bottom' | 'left' | 'right'
	/** Additional CSS classes */
	className?: string
	/** Custom item renderer */
	renderItem?: (item: LegendItem, index: number) => ReactNode
}

/**
 * Chart legend with interactive items.
 *
 * @example
 * ```tsx
 * <ChartLegend
 *   items={[
 *     { id: 'revenue', label: 'Revenue', color: '#6366f1' },
 *     { id: 'orders', label: 'Orders', color: '#8b5cf6' },
 *   ]}
 *   onToggle={(id) => toggleSeries(id)}
 * />
 * ```
 */
export function ChartLegend({
	items,
	onToggle,
	direction = 'horizontal',
	position = 'bottom',
	className = '',
	renderItem,
}: ChartLegendProps) {
	const handleKeyDown = (e: KeyboardEvent, id: string) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onToggle?.(id)
		}
	}

	const isInteractive = !!onToggle

	const containerClasses = classNames(
		'flex gap-4',
		direction === 'vertical' ? 'flex-col' : 'flex-wrap',
		position === 'top' ? 'mb-4' : null,
		position === 'bottom' ? 'mt-4' : null,
		position === 'left' ? 'mr-4' : null,
		position === 'right' ? 'ml-4' : null,
		className
	)

	return (
		<div
			className={containerClasses}
			role="list"
			aria-label="Chart legend"
		>
			{items.map((item, index) => {
				if (renderItem) {
					return renderItem(item, index)
				}

				const isVisible = item.visible !== false
				const itemClasses = classNames(
					'flex items-center gap-2 text-sm',
					isInteractive && 'cursor-pointer select-none',
					!isVisible && 'opacity-50',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded'
				)

				return (
					<div
						key={item.id}
						role="listitem"
						className={itemClasses}
						onClick={() => onToggle?.(item.id)}
						onKeyDown={(e) => handleKeyDown(e, item.id)}
						tabIndex={isInteractive ? 0 : undefined}
						aria-pressed={isInteractive ? isVisible : undefined}
					>
						{/* Color indicator */}
						<span
							className="w-3 h-3 rounded-sm shrink-0"
							style={{
								backgroundColor: isVisible ? item.color : 'transparent',
								border: isVisible ? 'none' : `2px solid ${item.color}`,
							}}
							aria-hidden="true"
						/>

						{/* Label */}
						<span className="text-base-content/80">{item.label}</span>

						{/* Value if present */}
						{item.value && (
							<span className="text-base-content font-medium">{item.value}</span>
						)}
					</div>
				)
			})}
		</div>
	)
}

/**
 * Compact legend for limited space.
 */
export function ChartLegendCompact({
	items,
	className = '',
}: {
	items: LegendItem[]
	className?: string
}) {
	return (
		<div className={classNames('flex items-center gap-3 text-xs', className)}>
			{items.map((item) => (
				<div key={item.id} className="flex items-center gap-1">
					<span
						className="w-2 h-2 rounded-full"
						style={{ backgroundColor: item.color }}
					/>
					<span className="text-base-content/60">{item.label}</span>
				</div>
			))}
		</div>
	)
}

export default ChartLegend
