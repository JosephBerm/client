'use client'

/**
 * AreaChart
 *
 * Area chart component for time series data (revenue trends, etc.)
 * Built on visx with full interactivity and accessibility.
 *
 * @module charts/charts/AreaChart
 */

import { useMemo } from 'react'
import { Group } from '@visx/group'
import { AreaClosed, LinePath, Bar } from '@visx/shape'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { curveMonotoneX } from '@visx/curve'
import { LinearGradient } from '@visx/gradient'
import { useTooltip, useTooltipInPortal } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { bisector } from 'd3-array'
import { parseISO } from 'date-fns'

import { ChartContainer } from '../ChartContainer'
import { ChartTooltip, type TooltipData } from '../components/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { useChartValueFormatter } from '../hooks/useChartValueFormatter'
import { getResponsiveConfig, getInnerDimensions } from '../hooks/useChartResponsive'
import { formatAxisDate, formatTooltipDate } from '../utils/formatters'
import { DEFAULT_MARGIN, AXIS_CONFIG, GRID_CONFIG } from '../utils/constants'

/**
 * Data point for the area chart.
 */
export interface AreaChartDataPoint {
	/** Date for X-axis (ISO string or Date) */
	date: string | Date
	/** Primary value for Y-axis */
	value: number
	/** Secondary value (optional, for tooltips) */
	secondaryValue?: number
	/** Label for secondary value */
	secondaryLabel?: string
}

export interface AreaChartProps {
	/** Chart data */
	data: AreaChartDataPoint[]
	/** Chart height */
	height?: number
	/** Value type for formatting */
	valueType?: 'currency' | 'number' | 'percent'
	/** Date granularity for X-axis labels */
	granularity?: 'day' | 'week' | 'month' | 'year'
	/** Whether to show gradient fill */
	showGradient?: boolean
	/** Whether to show data points */
	showPoints?: boolean
	/** Color override (uses theme primary by default) */
	color?: string
	/** Loading state */
	isLoading?: boolean
	/** Accessibility label */
	ariaLabel?: string
	/** Additional CSS classes */
	className?: string
}

// Accessors
const getDate = (d: AreaChartDataPoint): Date =>
	typeof d.date === 'string' ? parseISO(d.date) : d.date
const getValue = (d: AreaChartDataPoint): number => d.value

// Bisector for tooltip positioning
const bisectDate = bisector<AreaChartDataPoint, Date>((d) => getDate(d)).left

/**
 * Area chart for time series visualization.
 *
 * @example
 * ```tsx
 * <AreaChart
 *   data={revenueData.map(d => ({ date: d.date, value: d.revenue }))}
 *   valueType="currency"
 *   height={300}
 *   ariaLabel="Revenue over time"
 * />
 * ```
 */
export function AreaChart({
	data,
	height = 300,
	valueType = 'number',
	granularity = 'month',
	showGradient = true,
	showPoints = false,
	color,
	isLoading = false,
	ariaLabel = 'Area chart',
	className = '',
}: AreaChartProps) {
	const colors = useChartColors()
	const chartColor = color ?? colors.primary
	const safeData = useMemo(
		() =>
			data.filter((d) => {
				const parsed = getDate(d)
				return Number.isFinite(parsed.getTime()) && Number.isFinite(getValue(d))
			}),
		[data]
	)

	const {
		tooltipOpen,
		tooltipLeft,
		tooltipTop,
		tooltipData,
		showTooltip,
		hideTooltip,
	} = useTooltip<AreaChartDataPoint>()

	const { containerRef } = useTooltipInPortal({
		scroll: true,
	})

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
					? { top: 16, right: 16, bottom: 32, left: 48 }
					: DEFAULT_MARGIN
				const { innerWidth, innerHeight } = getInnerDimensions(width, containerHeight, margin)

				if (innerWidth <= 0 || innerHeight <= 0) return null

				// Scales
				const dateScale = scaleTime({
					domain: [
						Math.min(...safeData.map((d) => getDate(d).getTime())),
						Math.max(...safeData.map((d) => getDate(d).getTime())),
					],
					range: [0, innerWidth],
				})

				const maxValue = Math.max(...safeData.map(getValue))
				const valueScale = scaleLinear({
					domain: [0, maxValue * 1.1], // 10% padding at top
					range: [innerHeight, 0],
					nice: true,
				})

				// Tooltip handler
				const handleTooltip = (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
					const { x } = localPoint(event) || { x: 0 }
					const x0 = dateScale.invert(x - margin.left)
					const index = bisectDate(safeData, x0, 1)
					const d0 = index > 0 ? safeData[index - 1] : undefined
					const d1 = index < safeData.length ? safeData[index] : undefined

					let d = d0
					if (!d0 && d1) {
						d = d1
					} else if (d0 && d1) {
						d =
							x0.getTime() - getDate(d0).getTime() > getDate(d1).getTime() - x0.getTime()
								? d1
								: d0
					}

					if (d) {
						showTooltip({
							tooltipData: d,
							tooltipLeft: dateScale(getDate(d)) + margin.left,
							tooltipTop: valueScale(getValue(d)) + margin.top,
						})
					}
				}

				const gradientId = `area-gradient-${chartColor.replace(/[^a-zA-Z0-9]/g, '')}`

				return (
					<div ref={containerRef} className="relative">
						<svg width={width} height={containerHeight}>
							{/* Gradient definition */}
							{showGradient && (
								<LinearGradient
									id={gradientId}
									from={chartColor}
									to={chartColor}
									fromOpacity={0.4}
									toOpacity={0.05}
								/>
							)}

							<Group left={margin.left} top={margin.top}>
								{/* Grid */}
								<GridRows
									scale={valueScale}
									width={innerWidth}
									stroke={GRID_CONFIG.stroke}
									strokeWidth={GRID_CONFIG.strokeWidth}
									strokeDasharray={GRID_CONFIG.strokeDasharray}
									numTicks={responsive.numYTicks}
								/>

								{/* Area */}
								<AreaClosed
									data={safeData}
									x={(d) => dateScale(getDate(d)) ?? 0}
									y={(d) => valueScale(getValue(d)) ?? 0}
									yScale={valueScale}
									curve={curveMonotoneX}
									fill={showGradient ? `url(#${gradientId})` : chartColor}
									fillOpacity={showGradient ? 1 : 0.2}
								/>

								{/* Line */}
								<LinePath
									data={safeData}
									x={(d) => dateScale(getDate(d)) ?? 0}
									y={(d) => valueScale(getValue(d)) ?? 0}
									curve={curveMonotoneX}
									stroke={chartColor}
									strokeWidth={2}
								/>

								{/* Data points */}
								{showPoints &&
									safeData.map((d, i) => (
										<circle
											key={i}
											cx={dateScale(getDate(d))}
											cy={valueScale(getValue(d))}
											r={4}
											fill={chartColor}
											stroke="white"
											strokeWidth={2}
										/>
									))}

								{/* Tooltip hover target */}
								<Bar
									x={0}
									y={0}
									width={innerWidth}
									height={innerHeight}
									fill="transparent"
									onTouchStart={handleTooltip}
									onTouchMove={handleTooltip}
									onMouseMove={handleTooltip}
									onMouseLeave={hideTooltip}
								/>

								{/* Tooltip indicator line */}
								{tooltipData && (
									<>
										<line
											x1={dateScale(getDate(tooltipData))}
											x2={dateScale(getDate(tooltipData))}
											y1={0}
											y2={innerHeight}
											stroke={chartColor}
											strokeWidth={1}
											strokeDasharray="4,4"
											pointerEvents="none"
										/>
										<circle
											cx={dateScale(getDate(tooltipData))}
											cy={valueScale(getValue(tooltipData))}
											r={6}
											fill={chartColor}
											stroke="white"
											strokeWidth={2}
											pointerEvents="none"
										/>
									</>
								)}

								{/* Y Axis */}
								<AxisLeft
									scale={valueScale}
									numTicks={responsive.numYTicks}
									tickFormat={(v) => formatValue(v as number)}
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
									scale={dateScale}
									top={innerHeight}
									numTicks={responsive.numXTicks}
									tickFormat={(d) => formatAxisDate(d as Date, granularity)}
									stroke={colors.textMuted}
									tickStroke={colors.textMuted}
									tickLabelProps={{
										fill: colors.textMuted,
										fontSize: responsive.labelFontSize,
										textAnchor: 'middle',
										dy: 8,
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
									label: 'Value',
									value: formatValue(getValue(tooltipData)),
									date: formatTooltipDate(getDate(tooltipData)),
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

export default AreaChart
