'use client'

/**
 * ChartHeader
 *
 * Header component for charts with title, subtitle, and actions.
 * Uses base Button component for consistent styling.
 *
 * @module charts/components/ChartHeader
 */

import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import classNames from 'classnames'

import Button from '@_components/ui/Button'
import { HEADER_CONFIG } from '../utils/constants'

interface ChartHeaderProps {
	/** Chart title */
	title: string
	/** Optional subtitle */
	subtitle?: string
	/** Optional icon */
	icon?: LucideIcon
	/** Icon color class */
	iconColorClass?: string
	/** Action buttons/controls */
	actions?: ReactNode
	/** Additional CSS classes */
	className?: string
}

/**
 * Chart header with title, icon, and actions.
 *
 * @example
 * ```tsx
 * <ChartHeader
 *   title="Revenue Trends"
 *   subtitle="Last 30 days"
 *   icon={DollarSign}
 *   actions={<TimeRangePicker />}
 * />
 * ```
 */
export function ChartHeader({
	title,
	subtitle,
	icon: Icon,
	iconColorClass = 'text-primary',
	actions,
	className = '',
}: ChartHeaderProps) {
	return (
		<div
			className={classNames(
				'flex flex-col sm:flex-row',
				'items-start sm:items-center',
				'justify-between',
				'gap-3 sm:gap-4',
				'mb-3 sm:mb-4',
				className
			)}
		>
			<div className="flex items-center gap-2">
				{Icon && (
					<div className={classNames('p-2 rounded-lg', HEADER_CONFIG.iconBgClass)}>
						<Icon className={classNames(HEADER_CONFIG.iconSize, iconColorClass)} />
					</div>
				)}
				<div>
					<h3 className="font-semibold text-base-content">{title}</h3>
					{subtitle && (
						<p className="text-sm text-base-content/60">{subtitle}</p>
					)}
				</div>
			</div>

			{actions && (
				<div className="flex items-center gap-2">
					{actions}
				</div>
			)}
		</div>
	)
}

/**
 * Time range selector for chart headers.
 */
export interface TimeRangeOption {
	value: string
	label: string
}

interface TimeRangeSelectorProps {
	options: TimeRangeOption[]
	value: string
	onChange: (value: string) => void
	disabled?: boolean
}

/**
 * Time range selector using base Button component.
 * Provides consistent styling with the rest of the app.
 */
export function TimeRangeSelector({
	options,
	value,
	onChange,
	disabled = false,
}: TimeRangeSelectorProps) {
	return (
		<div className="flex items-center rounded-lg bg-base-200 p-1" role="group" aria-label="Time range">
			{options.map((option) => (
				<Button
					key={option.value}
					variant={value === option.value ? 'primary' : 'ghost'}
					size="xs"
					onClick={() => onChange(option.value)}
					disabled={disabled}
					aria-pressed={value === option.value}
					className={value === option.value ? '' : 'bg-transparent hover:bg-base-300'}
				>
					{option.label}
				</Button>
			))}
		</div>
	)
}

/**
 * Standard time range options.
 */
export const DEFAULT_TIME_RANGES: TimeRangeOption[] = [
	{ value: '7d', label: '7D' },
	{ value: '30d', label: '30D' },
	{ value: '90d', label: '90D' },
	{ value: '1y', label: '1Y' },
]

export default ChartHeader
