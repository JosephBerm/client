'use client'

/**
 * DonutChart
 *
 * Donut/pie chart for distribution and composition visualization.
 * Shows percentage breakdown with interactive segments.
 *
 * @module charts/charts/DonutChart
 */

import { useMemo, useState } from 'react'
import { Group } from '@visx/group'
import { Pie } from '@visx/shape'
import { scaleOrdinal } from '@visx/scale'
import { useTooltip } from '@visx/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import classNames from 'classnames'

import { ChartContainer } from '../ChartContainer'
import { ChartTooltip } from '../components/ChartTooltip'
import { ChartLegend, type LegendItem } from '../components/ChartLegend'
import { useChartColors, getColorByIndex } from '../hooks/useChartColors'
import { useChartValueFormatter } from '../hooks/useChartValueFormatter'
import { useReducedMotion } from '../hooks/useChartResponsive'

/**
 * Segment data for the donut chart.
 */
export interface DonutSegment {
	/** Segment identifier */
	id: string
	/** Display label */
	label: string
	/** Value (will be converted to percentage) */
	value: number
	/** Optional color override */
	color?: string
}

export interface DonutChartProps {
	/** Chart segments */
	data: DonutSegment[]
	/** Chart size (width = height) */
	size?: number
	/** Inner radius ratio (0-1, 0 = pie, 0.5 = donut) */
	innerRadius?: number
	/** Whether to show center label */
	showCenterLabel?: boolean
	/** Center label text (defaults to total) */
	centerLabel?: string
	/** Center sublabel */
	centerSublabel?: string
	/** Whether to show legend */
	showLegend?: boolean
	/** Legend position */
	legendPosition?: 'bottom' | 'right'
	/** Value type for formatting */
	valueType?: 'number' | 'currency' | 'percent'
	/** Loading state */
	isLoading?: boolean
	/** Accessibility label */
	ariaLabel?: string
	/** Called when segment is clicked */
	onSegmentClick?: (segment: DonutSegment, index: number) => void
	/** Additional CSS classes */
	className?: string
}

/**
 * Donut/pie chart for composition visualization.
 *
 * @example
 * ```tsx
 * <DonutChart
 *   data={[
 *     { id: 'pending', label: 'Pending', value: 30 },
 *     { id: 'approved', label: 'Approved', value: 50 },
 *     { id: 'rejected', label: 'Rejected', value: 20 },
 *   ]}
 *   showCenterLabel
 *   centerLabel="100"
 *   centerSublabel="Total"
 * />
 * ```
 */
export function DonutChart({
	data,
	size = 200,
	innerRadius = 0.6,
	showCenterLabel = true,
	centerLabel,
	centerSublabel,
	showLegend = true,
	legendPosition = 'bottom',
	valueType = 'number',
	isLoading = false,
	ariaLabel = 'Donut chart',
	onSegmentClick,
	className = '',
}: DonutChartProps) {
	const colors = useChartColors()
	const reducedMotion = useReducedMotion()
	const [activeIndex, setActiveIndex] = useState<number | null>(null)

	const {
		tooltipOpen,
		tooltipLeft,
		tooltipTop,
		tooltipData,
		showTooltip,
		hideTooltip,
	} = useTooltip<DonutSegment & { percent: number }>()

	// Calculate total and percentages
	const { total, segmentsWithPercent } = useMemo(() => {
		const total = data.reduce((sum, d) => sum + d.value, 0)
		const segmentsWithPercent = data.map((d) => ({
			...d,
			percent: total > 0 ? (d.value / total) * 100 : 0,
		}))
		return { total, segmentsWithPercent }
	}, [data])

	// Color scale
	const colorScale = useMemo(() => {
		return scaleOrdinal({
			domain: data.map((d) => d.id),
			range: data.map((d, i) => d.color ?? getColorByIndex(colors, i)),
		})
	}, [data, colors])

	// Format value
	const formatValue = useChartValueFormatter(valueType)

	// Legend items
	const legendItems = useMemo((): LegendItem[] => {
		return segmentsWithPercent.map((d) => ({
			id: d.id,
			label: d.label,
			color: colorScale(d.id),
			value: `${d.percent.toFixed(0)}%`,
		}))
	}, [segmentsWithPercent, colorScale])

	// Dimensions
	const radius = size / 2
	const innerRadiusPx = radius * innerRadius

	// Default center label
	const displayCenterLabel = centerLabel ?? formatValue(total)
	const displayCenterSublabel = centerSublabel ?? 'Total'

	const containerHeight = legendPosition === 'bottom' && showLegend ? size + 60 : size

	return (
		<ChartContainer
			height={containerHeight}
			isLoading={isLoading}
			isEmpty={data.length === 0}
			emptyMessage="No data available"
			ariaLabel={ariaLabel}
			className={className}
		>
			{({ width }) => {
				const containerWidth = legendPosition === 'right' && showLegend ? width : size

				return (
					<div
						className={classNames(
							'flex',
							legendPosition === 'right' ? 'flex-row gap-4' : 'flex-col'
						)}
					>
						{/* Chart */}
						<svg width={size} height={size}>
							<Group top={radius} left={radius}>
								<Pie
									data={segmentsWithPercent}
									pieValue={(d) => d.value}
									outerRadius={radius - 4}
									innerRadius={innerRadiusPx}
									padAngle={0.02}
								>
									{(pie) =>
										pie.arcs.map((arc, index) => {
											const segment = arc.data
											const [centroidX, centroidY] = pie.path.centroid(arc)
											const isActive = activeIndex === index
											const segmentColor = colorScale(segment.id)

											return (
												<g key={segment.id}>
													<motion.path
														d={pie.path(arc) || ''}
														fill={segmentColor}
														opacity={activeIndex !== null && !isActive ? 0.5 : 1}
														initial={reducedMotion ? false : { scale: 0 }}
														animate={{
															scale: isActive ? 1.05 : 1,
															opacity: activeIndex !== null && !isActive ? 0.5 : 1,
														}}
														transition={{
															scale: { duration: 0.3, delay: index * 0.05 },
															opacity: { duration: 0.15 },
														}}
														style={{
															transformOrigin: 'center',
															cursor: onSegmentClick ? 'pointer' : 'default',
														}}
														onMouseEnter={(e) => {
															setActiveIndex(index)
															const rect = e.currentTarget.getBoundingClientRect()
															showTooltip({
																tooltipData: segment,
																tooltipLeft: rect.left + rect.width / 2,
																tooltipTop: rect.top,
															})
														}}
														onMouseLeave={() => {
															setActiveIndex(null)
															hideTooltip()
														}}
														onClick={() => onSegmentClick?.(segment, index)}
														role="graphics-symbol"
														aria-label={`${segment.label}: ${segment.percent.toFixed(1)}%`}
													/>
												</g>
											)
										})
									}
								</Pie>

								{/* Center label */}
								{showCenterLabel && innerRadiusPx > 30 && (
									<>
										<text
											textAnchor="middle"
											dy="-0.2em"
											fontSize={Math.min(24, innerRadiusPx / 2)}
											fontWeight="bold"
											fill={colors.text}
										>
											{displayCenterLabel}
										</text>
										{displayCenterSublabel && (
											<text
												textAnchor="middle"
												dy="1.2em"
												fontSize={Math.min(12, innerRadiusPx / 4)}
												fill={colors.textMuted}
											>
												{displayCenterSublabel}
											</text>
										)}
									</>
								)}
							</Group>
						</svg>

						{/* Legend */}
						{showLegend && (
							<ChartLegend
								items={legendItems}
								direction={legendPosition === 'right' ? 'vertical' : 'horizontal'}
								position={legendPosition}
							/>
						)}

						{/* Tooltip */}
						{tooltipOpen && tooltipData && (
							<ChartTooltip
								data={{
									label: tooltipData.label,
									value: formatValue(tooltipData.value),
									items: [
										{
											label: 'Percentage',
											value: `${tooltipData.percent.toFixed(1)}%`,
										},
									],
								}}
								top={tooltipTop ?? 0}
								left={tooltipLeft ?? 0}
							/>
						)}
					</div>
				)
			}}
		</ChartContainer>
	)
}

export default DonutChart
