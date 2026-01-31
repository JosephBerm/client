'use client'

/**
 * ComboChart
 *
 * Combination chart showing bars and lines together.
 * Perfect for showing revenue (bars) with order count (line) overlay.
 *
 * @module charts/charts/ComboChart
 */

import { useMemo } from 'react'
import { Group } from '@visx/group'
import { Bar, LinePath } from '@visx/shape'
import { scaleTime, scaleLinear, scaleBand } from '@visx/scale'
import { AxisLeft, AxisRight, AxisBottom } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { curveMonotoneX } from '@visx/curve'
import { useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { bisector } from 'd3-array'
import { parseISO } from 'date-fns'

import { ChartContainer } from '../ChartContainer'
import { ChartTooltip } from '../components/ChartTooltip'
import { ChartLegendCompact, type LegendItem } from '../components/ChartLegend'
import { useChartColors } from '../hooks/useChartColors'
import { useChartValueFormatter } from '../hooks/useChartValueFormatter'
import { getResponsiveConfig, getInnerDimensions } from '../hooks/useChartResponsive'
import { formatAxisDate, formatTooltipDate } from '../utils/formatters'
import { DEFAULT_MARGIN, GRID_CONFIG, AXIS_CONFIG } from '../utils/constants'

/**
 * Data point for combo chart.
 */
export interface ComboChartDataPoint {
	/** Date for X-axis */
	date: string | Date
	/** Primary value (bars) */
	primaryValue: number
	/** Secondary value (line) */
	secondaryValue: number
}

export interface ComboChartProps {
	/** Chart data */
	data: ComboChartDataPoint[]
	/** Chart height */
	height?: number
	/** Primary series label */
	primaryLabel?: string
	/** Secondary series label */
	secondaryLabel?: string
	/** Primary value type */
	primaryType?: 'currency' | 'number'
	/** Secondary value type */
	secondaryType?: 'currency' | 'number'
	/** Date granularity */
	granularity?: 'day' | 'week' | 'month' | 'year'
	/** Primary color (bars) */
	primaryColor?: string
	/** Secondary color (line) */
	secondaryColor?: string
	/** Whether to show legend */
	showLegend?: boolean
	/** Loading state */
	isLoading?: boolean
	/** Accessibility label */
	ariaLabel?: string
	/** Additional CSS classes */
	className?: string
}

// Accessors
const getDate = (d: ComboChartDataPoint): Date =>
	typeof d.date === 'string' ? parseISO(d.date) : d.date

const bisectDate = bisector<ComboChartDataPoint, Date>((d) => getDate(d)).left

/**
 * Combination chart with bars and line.
 *
 * @example
 * ```tsx
 * <ComboChart
 *   data={revenueData.map(d => ({
 *     date: d.date,
 *     primaryValue: d.revenue,
 *     secondaryValue: d.orderCount,
 *   }))}
 *   primaryLabel="Revenue"
 *   secondaryLabel="Orders"
 *   primaryType="currency"
 *   secondaryType="number"
 * />
 * ```
 */
export function ComboChart({
	data,
	height = 350,
	primaryLabel = 'Primary',
	secondaryLabel = 'Secondary',
	primaryType = 'currency',
	secondaryType = 'number',
	granularity = 'month',
	primaryColor,
	secondaryColor,
	showLegend = true,
	isLoading = false,
	ariaLabel = 'Combination chart',
	className = '',
}: ComboChartProps) {
	const colors = useChartColors()
	const barColor = primaryColor ?? colors.primary
	const lineColor = secondaryColor ?? colors.secondary
	const safeData = useMemo(
		() =>
			data.filter((d) => {
				const parsed = getDate(d)
				return (
					Number.isFinite(parsed.getTime()) &&
					Number.isFinite(d.primaryValue) &&
					Number.isFinite(d.secondaryValue)
				)
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
	} = useTooltip<ComboChartDataPoint>()

	// Format values
	const formatPrimary = useChartValueFormatter(primaryType)
	const formatSecondary = useChartValueFormatter(secondaryType)

	// Legend items
	const legendItems = useMemo((): LegendItem[] => {
		return [
			{ id: 'primary', label: primaryLabel, color: barColor },
			{ id: 'secondary', label: secondaryLabel, color: lineColor },
		]
	}, [primaryLabel, secondaryLabel, barColor, lineColor])

	return (
		<ChartContainer
			height={height}
			isLoading={isLoading}
			isEmpty={safeData.length === 0}
			emptyMessage="No data available"
			ariaLabel={ariaLabel}
			className={className}
		>
			{({ width, height: containerHeight }) => {
				const responsive = getResponsiveConfig(width)
				const margin = responsive.isMobile
					? { top: 20, right: 50, bottom: 40, left: 50 }
					: { ...DEFAULT_MARGIN, right: 60 }
				const { innerWidth, innerHeight } = getInnerDimensions(width, containerHeight, margin)

				if (innerWidth <= 0 || innerHeight <= 0) return null

				// Scales
				const xScale = scaleBand<string>({
					domain: safeData.map((d) => getDate(d).toISOString()),
					range: [0, innerWidth],
					padding: 0.3,
				})

				const primaryMax = Math.max(...safeData.map((d) => d.primaryValue))
				const primaryScale = scaleLinear({
					domain: [0, primaryMax * 1.1],
					range: [innerHeight, 0],
					nice: true,
				})

				const secondaryMax = Math.max(...safeData.map((d) => d.secondaryValue))
				const secondaryScale = scaleLinear({
					domain: [0, secondaryMax * 1.1],
					range: [innerHeight, 0],
					nice: true,
				})

				// Time scale for line positioning (center of bars)
				const timeScale = scaleTime({
					domain: [
						Math.min(...safeData.map((d) => getDate(d).getTime())),
						Math.max(...safeData.map((d) => getDate(d).getTime())),
					],
					range: [xScale.bandwidth() / 2, innerWidth - xScale.bandwidth() / 2],
				})

				// Tooltip handler
				const handleTooltip = (
					event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
				) => {
					const { x } = localPoint(event) || { x: 0 }
					const x0 = timeScale.invert(x - margin.left)
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
							tooltipLeft: (xScale(getDate(d).toISOString()) ?? 0) + xScale.bandwidth() / 2 + margin.left,
							tooltipTop: Math.min(primaryScale(d.primaryValue), secondaryScale(d.secondaryValue)) + margin.top,
						})
					}
				}

				return (
					<div className="relative">
						{/* Legend */}
						{showLegend && (
							<div className="absolute top-0 right-0">
								<ChartLegendCompact items={legendItems} />
							</div>
						)}

						<svg width={width} height={containerHeight}>
							<Group left={margin.left} top={margin.top}>
								{/* Grid */}
								<GridRows
									scale={primaryScale}
									width={innerWidth}
									stroke={GRID_CONFIG.stroke}
									strokeWidth={GRID_CONFIG.strokeWidth}
									strokeDasharray={GRID_CONFIG.strokeDasharray}
									numTicks={responsive.numYTicks}
								/>

								{/* Bars (primary) */}
								{safeData.map((d, i) => {
									const x = xScale(getDate(d).toISOString()) ?? 0
									const y = primaryScale(d.primaryValue)
									const barHeight = innerHeight - y

									return (
										<Bar
											key={`bar-${i}`}
											x={x}
											y={y}
											width={xScale.bandwidth()}
											height={Math.max(0, barHeight)}
											fill={barColor}
											opacity={0.8}
											rx={4}
										/>
									)
								})}

								{/* Line (secondary) */}
								<LinePath
									data={safeData}
									x={(d) => timeScale(getDate(d))}
									y={(d) => secondaryScale(d.secondaryValue)}
									curve={curveMonotoneX}
									stroke={lineColor}
									strokeWidth={2.5}
								/>

								{/* Line points */}
								{safeData.map((d, i) => (
									<circle
										key={`point-${i}`}
										cx={timeScale(getDate(d))}
										cy={secondaryScale(d.secondaryValue)}
										r={4}
										fill={lineColor}
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

								{/* Tooltip indicator */}
								{tooltipData && (
									<line
										x1={(xScale(getDate(tooltipData).toISOString()) ?? 0) + xScale.bandwidth() / 2}
										x2={(xScale(getDate(tooltipData).toISOString()) ?? 0) + xScale.bandwidth() / 2}
										y1={0}
										y2={innerHeight}
										stroke={colors.textMuted}
										strokeWidth={1}
										strokeDasharray="4,4"
										pointerEvents="none"
									/>
								)}

								{/* Left Y Axis (Primary) */}
								<AxisLeft
									scale={primaryScale}
									numTicks={responsive.numYTicks}
									tickFormat={(v) => formatPrimary(v as number)}
									stroke={barColor}
									tickStroke={barColor}
									tickLabelProps={{
										fill: barColor,
										fontSize: responsive.labelFontSize,
										textAnchor: 'end',
										dy: '0.33em',
										dx: -4,
									}}
									hideAxisLine={AXIS_CONFIG.hideAxisLine}
									hideTicks
								/>

								{/* Right Y Axis (Secondary) */}
								<AxisRight
									scale={secondaryScale}
									left={innerWidth}
									numTicks={responsive.numYTicks}
									tickFormat={(v) => formatSecondary(v as number)}
									stroke={lineColor}
									tickStroke={lineColor}
									tickLabelProps={{
										fill: lineColor,
										fontSize: responsive.labelFontSize,
										textAnchor: 'start',
										dy: '0.33em',
										dx: 4,
									}}
									hideAxisLine={AXIS_CONFIG.hideAxisLine}
									hideTicks
								/>

								{/* X Axis */}
								<AxisBottom
									scale={xScale}
									top={innerHeight}
									tickFormat={(dateStr) => formatAxisDate(dateStr, granularity)}
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
									label: '',
									value: '',
									date: formatTooltipDate(getDate(tooltipData)),
									items: [
										{
											label: primaryLabel,
											value: formatPrimary(tooltipData.primaryValue),
											color: barColor,
										},
										{
											label: secondaryLabel,
											value: formatSecondary(tooltipData.secondaryValue),
											color: lineColor,
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

export default ComboChart
