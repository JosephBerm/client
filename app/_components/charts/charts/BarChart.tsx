'use client'

/**
 * BarChart
 *
 * Bar chart component for categorical data comparison.
 * Built on visx with full interactivity and accessibility.
 *
 * @module charts/charts/BarChart
 */

import { useMemo, useState } from 'react'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { useTooltip } from '@visx/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

import { ChartContainer } from '../ChartContainer'
import { ChartTooltip, type TooltipData } from '../components/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useChartValueFormatter } from '../hooks/useChartValueFormatter'
import { getResponsiveConfig, getInnerDimensions, useReducedMotion } from '../hooks/useChartResponsive'
import { DEFAULT_MARGIN, AXIS_CONFIG, GRID_CONFIG, CHART_SIZES } from '../utils/constants'

/**
 * Data point for the bar chart.
 */
export interface BarChartDataPoint {
	/** Category label for X-axis */
	label: string
	/** Value for bar height */
	value: number
	/** Optional color override for this bar */
	color?: string
	/** Secondary value for tooltip */
	secondaryValue?: number
	/** Secondary label for tooltip */
	secondaryLabel?: string
}

export interface BarChartProps {
	/** Chart data */
	data: BarChartDataPoint[]
	/** Chart height */
	height?: number
	/** Value type for formatting */
	valueType?: 'currency' | 'number' | 'percent'
	/** Whether bars are horizontal */
	horizontal?: boolean
	/** Color override (uses theme primary by default) */
	color?: string
	/** Whether to show value labels on bars */
	showLabels?: boolean
	/** Loading state */
	isLoading?: boolean
	/** Accessibility label */
	ariaLabel?: string
	/** Called when a bar is clicked */
	onBarClick?: (data: BarChartDataPoint, index: number) => void
	/** Additional CSS classes */
	className?: string
}

/**
 * Bar chart for categorical data visualization.
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={[
 *     { label: 'Jan', value: 1200 },
 *     { label: 'Feb', value: 1800 },
 *     { label: 'Mar', value: 1500 },
 *   ]}
 *   valueType="currency"
 *   height={300}
 * />
 * ```
 */
export function BarChart({
	data,
	height = 300,
	valueType = 'number',
	horizontal = false,
	color,
	showLabels = false,
	isLoading = false,
	ariaLabel = 'Bar chart',
	onBarClick,
	className = '',
}: BarChartProps) {
	const colors = useChartColors()
	const chartColor = color ?? colors.primary
	const reducedMotion = useReducedMotion()
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const safeData = useMemo(
		() => data.filter((d) => Number.isFinite(d.value)),
		[data]
	)

	const {
		tooltipOpen,
		tooltipLeft,
		tooltipTop,
		tooltipData,
		showTooltip,
		hideTooltip,
	} = useTooltip<BarChartDataPoint>()

	// Format value based on type
	const formatValue = useChartValueFormatter(valueType)

	return (
		<ChartContainer
			height={height}
			isLoading={isLoading}
			isEmpty={!safeData.length}
			emptyMessage="No data available"
			ariaLabel={ariaLabel}
			className={className}
		>
			{({ width, height: containerHeight }) => {
				const responsive = getResponsiveConfig(width)
				const margin = responsive.isMobile
					? { top: 16, right: 16, bottom: 48, left: 56 }
					: DEFAULT_MARGIN
				const { innerWidth, innerHeight } = getInnerDimensions(width, containerHeight, margin)

				if (innerWidth <= 0 || innerHeight <= 0) return null

				// Scales
				const labelScale = scaleBand<string>({
					domain: safeData.map((d) => d.label),
					range: horizontal ? [0, innerHeight] : [0, innerWidth],
					padding: CHART_SIZES.barPadding,
				})

				const maxValue = Math.max(...safeData.map((d) => d.value))
				const valueScale = scaleLinear({
					domain: [0, maxValue * 1.1],
					range: horizontal ? [0, innerWidth] : [innerHeight, 0],
					nice: true,
				})

				const handleBarHover = (
					event: React.MouseEvent<SVGRectElement>,
					d: BarChartDataPoint,
					index: number
				) => {
					const rect = event.currentTarget.getBoundingClientRect()
					setHoveredIndex(index)
					showTooltip({
						tooltipData: d,
						tooltipLeft: horizontal
							? valueScale(d.value) + margin.left
							: (labelScale(d.label) ?? 0) + (labelScale.bandwidth() / 2) + margin.left,
						tooltipTop: horizontal
							? (labelScale(d.label) ?? 0) + (labelScale.bandwidth() / 2) + margin.top
							: valueScale(d.value) + margin.top - 10,
					})
				}

				const handleBarLeave = () => {
					setHoveredIndex(null)
					hideTooltip()
				}

				return (
					<div className="relative">
						<svg width={width} height={containerHeight}>
							<Group left={margin.left} top={margin.top}>
								{/* Grid */}
								<GridRows
									scale={horizontal ? labelScale : valueScale}
									width={innerWidth}
									height={innerHeight}
									stroke={GRID_CONFIG.stroke}
									strokeWidth={GRID_CONFIG.strokeWidth}
									strokeDasharray={GRID_CONFIG.strokeDasharray}
									numTicks={responsive.numYTicks}
								/>

								{/* Bars */}
								{safeData.map((d, i) => {
									const barColor = d.color ?? chartColor
									const barX = horizontal ? 0 : labelScale(d.label) ?? 0
									const barY = horizontal
										? labelScale(d.label) ?? 0
										: valueScale(d.value)
									const barWidth = horizontal
										? valueScale(d.value)
										: labelScale.bandwidth()
									const barHeight = horizontal
										? labelScale.bandwidth()
										: innerHeight - valueScale(d.value)

									const isHovered = hoveredIndex === i
									const isClickable = !!onBarClick

									return (
										<motion.rect
											key={`bar-${i}`}
											x={barX}
											y={barY}
											width={Math.max(0, barWidth)}
											height={Math.max(0, barHeight)}
											fill={barColor}
											opacity={hoveredIndex !== null && !isHovered ? 0.5 : 1}
											rx={4}
											initial={reducedMotion ? false : { scaleY: 0 }}
											animate={{
												scaleY: 1,
												opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
											}}
											transition={{
												scaleY: { duration: 0.3, delay: i * 0.05 },
												opacity: { duration: 0.15 },
											}}
											style={{
												transformOrigin: horizontal ? 'left center' : 'bottom center',
												cursor: isClickable ? 'pointer' : 'default',
											}}
											onMouseEnter={(e) => handleBarHover(e, d, i)}
											onMouseLeave={handleBarLeave}
											onClick={() => onBarClick?.(d, i)}
											role="graphics-symbol"
											aria-label={`${d.label}: ${formatValue(d.value)}`}
											tabIndex={isClickable ? 0 : undefined}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													onBarClick?.(d, i)
												}
											}}
										/>
									)
								})}

								{/* Value labels on bars */}
								{showLabels &&
									data.map((d, i) => {
										const x = horizontal
											? Math.min(valueScale(d.value) + 8, innerWidth - 40)
											: (labelScale(d.label) ?? 0) + labelScale.bandwidth() / 2
										const y = horizontal
											? (labelScale(d.label) ?? 0) + labelScale.bandwidth() / 2
											: valueScale(d.value) - 8

										return (
											<text
												key={`label-${i}`}
												x={x}
												y={y}
												fontSize={responsive.labelFontSize - 1}
												fill={colors.text}
												textAnchor={horizontal ? 'start' : 'middle'}
												dominantBaseline={horizontal ? 'middle' : 'auto'}
											>
												{formatValue(d.value)}
											</text>
										)
									})}

								{/* Y Axis */}
								<AxisLeft
									scale={horizontal ? labelScale : valueScale}
									numTicks={horizontal ? undefined : responsive.numYTicks}
									tickFormat={(v) =>
										horizontal ? String(v) : formatValue(v as number)
									}
									stroke={colors.textMuted}
									tickStroke={colors.textMuted}
									tickLabelProps={{
										fill: colors.textMuted,
										fontSize: responsive.labelFontSize,
										textAnchor: 'end',
										dy: '0.33em',
										dx: -4,
									}}
									hideAxisLine={AXIS_CONFIG.hideAxisLine}
									hideTicks
								/>

								{/* X Axis */}
								<AxisBottom
									scale={horizontal ? valueScale : labelScale}
									top={innerHeight}
									numTicks={horizontal ? responsive.numXTicks : undefined}
									tickFormat={(v) =>
										horizontal ? formatValue(v as number) : String(v)
									}
									stroke={colors.textMuted}
									tickStroke={colors.textMuted}
									tickLabelProps={{
										fill: colors.textMuted,
										fontSize: responsive.labelFontSize,
										textAnchor: 'middle',
										dy: 8,
										angle: responsive.isMobile && !horizontal ? -45 : 0,
									}}
									hideAxisLine={AXIS_CONFIG.hideAxisLine}
									hideTicks
								/>
							</Group>
						</svg>

						{/* Tooltip */}
						{tooltipOpen && tooltipData && (
							<ChartTooltip
								data={{
									label: tooltipData.label,
									value: formatValue(tooltipData.value),
									items: tooltipData.secondaryValue
										? [
												{
													label: tooltipData.secondaryLabel ?? 'Secondary',
													value: tooltipData.secondaryValue.toLocaleString(),
												},
											]
										: undefined,
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

export default BarChart
