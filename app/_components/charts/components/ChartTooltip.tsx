'use client'

/**
 * ChartTooltip
 *
 * Reusable tooltip component for chart data points.
 * Integrates with @visx/tooltip for positioning.
 *
 * @module charts/components/ChartTooltip
 */

import { type ReactNode } from 'react'
import { TooltipWithBounds, defaultStyles } from '@visx/tooltip'

import { TOOLTIP_CONFIG } from '../utils/constants'

export interface TooltipData {
	/** Primary label */
	label: string
	/** Primary value (formatted) */
	value: string
	/** Secondary items */
	items?: Array<{
		label: string
		value: string
		color?: string
	}>
	/** Optional date/time */
	date?: string
}

interface ChartTooltipProps {
	/** Tooltip data to display */
	data: TooltipData
	/** X position */
	top: number
	/** Y position */
	left: number
	/** Whether tooltip is visible */
	visible?: boolean
	/** Custom content renderer */
	children?: ReactNode
}

/**
 * Chart tooltip with consistent styling.
 *
 * @example
 * ```tsx
 * {tooltipOpen && tooltipData && (
 *   <ChartTooltip
 *     data={tooltipData}
 *     top={tooltipTop}
 *     left={tooltipLeft}
 *   />
 * )}
 * ```
 */
export function ChartTooltip({
	data,
	top,
	left,
	visible = true,
	children,
}: ChartTooltipProps) {
	if (!visible) return null

	return (
		<TooltipWithBounds
			top={top}
			left={left}
			style={{
				...defaultStyles,
				backgroundColor: 'oklch(var(--b3))',
				color: 'oklch(var(--bc))',
				borderRadius: '0.5rem',
				padding: '0.75rem',
				boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				border: '1px solid oklch(var(--bc) / 0.1)',
				zIndex: TOOLTIP_CONFIG.zIndex,
				minWidth: '120px',
			}}
		>
			{children ?? (
				<div className="text-sm">
					{/* Date if present */}
					{data.date && (
						<p className="text-xs text-base-content/60 mb-1">{data.date}</p>
					)}

					{/* Primary value */}
					<p className="font-semibold text-base-content">{data.value}</p>
					<p className="text-xs text-base-content/60">{data.label}</p>

					{/* Additional items */}
					{data.items && data.items.length > 0 && (
						<div className="mt-2 pt-2 border-t border-base-content/10 space-y-1">
							{data.items.map((item, idx) => (
								<div key={idx} className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-1.5">
										{item.color && (
											<span
												className="w-2 h-2 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
										)}
										<span className="text-xs text-base-content/60">{item.label}</span>
									</span>
									<span className="text-xs font-medium text-base-content">{item.value}</span>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</TooltipWithBounds>
	)
}

/**
 * Simple tooltip wrapper for custom content.
 */
export function ChartTooltipContainer({
	top,
	left,
	children,
}: {
	top: number
	left: number
	children: ReactNode
}) {
	return (
		<TooltipWithBounds
			top={top}
			left={left}
			style={{
				...defaultStyles,
				backgroundColor: 'oklch(var(--b3))',
				color: 'oklch(var(--bc))',
				borderRadius: '0.5rem',
				padding: '0.75rem',
				boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				border: '1px solid oklch(var(--bc) / 0.1)',
				zIndex: TOOLTIP_CONFIG.zIndex,
			}}
		>
			{children}
		</TooltipWithBounds>
	)
}

export default ChartTooltip
