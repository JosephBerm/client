'use client'

/**
 * LineChart
 *
 * Line chart component for trend analysis.
 * Supports multiple series and comparison overlays.
 *
 * @module charts/charts/LineChart
 */

import { useMemo } from 'react'
import { Group } from '@visx/group'
import { LinePath } from '@visx/shape'
import { scaleTime, scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { curveMonotoneX, curveLinear } from '@visx/curve'
import { useTooltip } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { Bar } from '@visx/shape'
import { bisector } from 'd3-array'
import { parseISO } from 'date-fns'

import { ChartContainer } from '../ChartContainer'
import { ChartTooltip } from '../components/ChartTooltip'
import { ChartLegendCompact } from '../components/ChartLegend'
import { useChartColors, getColorByIndex } from '../hooks/useChartColors'
import { useChartValueFormatter } from '../hooks/useChartValueFormatter'
import { getResponsiveConfig, getInnerDimensions } from '../hooks/useChartResponsive'
import { formatAxisDate, formatTooltipDate } from '../utils/formatters'
import { DEFAULT_MARGIN, GRID_CONFIG, AXIS_CONFIG } from '../utils/constants'

/**
 * Data point for a single series.
 */
export interface LineChartDataPoint {
	date: string | Date
	value: number
}

/**
 * Series definition for multi-line charts.
 */
export interface LineChartSeries {
	id: string
	name: string
	data: LineChartDataPoint[]
	color?: string
	/** Line style */
	style?: 'solid' | 'dashed' | 'dotted'
}

export interface LineChartProps {
	/** Single series data (use this OR series, not both) */
	data?: LineChartDataPoint[]
	/** Multiple series data */
	series?: LineChartSeries[]
	/** Chart height */
	height?: number
	/** Value type for formatting */
	valueType?: 'currency' | 'number' | 'percent'
	/** Date granularity */
	granularity?: 'day' | 'week' | 'month' | 'year'
	/** Curve type */
	curve?: 'smooth' | 'linear'
	/** Whether to show data points */
	showPoints?: boolean
	/** Color for single series */
	color?: string
	/** Whether to show legend for multi-series */
	showLegend?: boolean
	/** Loading state */
	isLoading?: boolean
	/** Accessibility label */
	ariaLabel?: string
	/** Additional CSS classes */
	className?: string
}

// Accessors
const getDate = (d: LineChartDataPoint): Date =>
	typeof d.date === 'string' ? parseISO(d.date) : d.date
const getValue = (d: LineChartDataPoint): number => d.value

const bisectDate = bisector<LineChartDataPoint, Date>((d) => getDate(d)).left

/**
 * Line chart for trend visualization.
 *
 * @example
 * ```tsx
 * // Single series
 * <LineChart
 *   data={[{ date: '2024-01-01', value: 100 }, ...]}
 *   valueType="currency"
 * />
 *
 * // Multiple series
 * <LineChart
 *   series={[
 *     { id: 'current', name: 'Current', data: [...] },
 *     { id: 'previous', name: 'Previous', data: [...], style: 'dashed' },
 *   ]}
 * />
 * ```
 */
export function LineChart({
	data,
	series,
	height = 300,
	valueType = 'number',
	granularity = 'month',
	curve = 'smooth',
	showPoints = false,
	color,
	showLegend = true,
	isLoading = false,
	ariaLabel = 'Line chart',
	className = '',
}: LineChartProps) {
	const colors = useChartColors()
	const chartColor = color ?? colors.primary

	const {
		tooltipOpen,
		tooltipLeft,
		tooltipTop,
		tooltipData,
		showTooltip,
		hideTooltip,
	} = useTooltip<{
		date: Date
		values: Array<{ seriesId: string; name: string; value: number; color: string }>
	}>()

	// Normalize data to series format
	const normalizedSeries = useMemo((): LineChartSeries[] => {
		if (series) return series
		if (data) return [{ id: 'default', name: 'Value', data, color: chartColor }]
		return []
	}, [data, series, chartColor])

	const safeSeries = useMemo((): LineChartSeries[] => {
		return normalizedSeries.map((s) => ({
			...s,
			data: s.data.filter((d) => {
				const parsed = getDate(d)
				return Number.isFinite(parsed.getTime()) && Number.isFinite(getValue(d))
			}),
		}))
	}, [normalizedSeries])

	// Format value based on type
	const formatValue = useChartValueFormatter(valueType)

	// Get curve function
	const curveFunc = curve === 'smooth' ? curveMonotoneX : curveLinear

	// Get line dash array
	const getStrokeDasharray = (style?: 'solid' | 'dashed' | 'dotted'): string | undefined => {
		switch (style) {
			case 'dashed':
				return '8,4'
			case 'dotted':
				return '2,4'
			default:
				return undefined
		}
	}

	const isEmpty = safeSeries.every((s) => s.data.length === 0)

	return (
		<ChartContainer
			height={height}
			isLoading={isLoading}
			isEmpty={isEmpty}
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

				// Get all dates and values across all series
				const allDates = safeSeries.flatMap((s) => s.data.map((d) => getDate(d).getTime()))
				const allValues = safeSeries.flatMap((s) => s.data.map(getValue))

				// Scales
				const dateScale = scaleTime({
					domain: [Math.min(...allDates), Math.max(...allDates)],
					range: [0, innerWidth],
				})

				const valueScale = scaleLinear({
					domain: [0, Math.max(...allValues) * 1.1],
					range: [innerHeight, 0],
					nice: true,
				})

				// Tooltip handler
				const handleTooltip = (
					event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
				) => {
					const { x } = localPoint(event) || { x: 0 }
					const x0 = dateScale.invert(x - margin.left)

					const tooltipValues = safeSeries.map((s, i) => {
						const index = bisectDate(s.data, x0, 1)
						const d0 = index > 0 ? s.data[index - 1] : undefined
						const d1 = index < s.data.length ? s.data[index] : undefined

						let d = d0
						if (!d0 && d1) {
							d = d1
						} else if (d0 && d1) {
							d =
								x0.getTime() - getDate(d0).getTime() > getDate(d1).getTime() - x0.getTime()
									? d1
									: d0
						}

						return {
							seriesId: s.id,
							name: s.name,
							value: d ? getValue(d) : 0,
							color: s.color ?? getColorByIndex(colors, i),
						}
					})

					const primarySeries = safeSeries[0]
					const index = primarySeries ? bisectDate(primarySeries.data, x0, 1) : 0
					const d =
						primarySeries && primarySeries.data.length > 0
							? primarySeries.data[Math.max(0, index - 1)]
							: undefined

					if (d) {
						showTooltip({
							tooltipData: {
								date: getDate(d),
								values: tooltipValues,
							},
							tooltipLeft: dateScale(getDate(d)) + margin.left,
							tooltipTop: valueScale(getValue(d)) + margin.top,
						})
					}
				}

				// Legend items
				const legendItems = safeSeries.map((s, i) => ({
					id: s.id,
					label: s.name,
					color: s.color ?? getColorByIndex(colors, i),
				}))

				return (
					<div className="relative">
						{/* Legend */}
						{showLegend && safeSeries.length > 1 && (
							<div className="absolute top-0 right-0">
								<ChartLegendCompact items={legendItems} />
							</div>
						)}

						<svg width={width} height={containerHeight}>
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

								{/* Lines */}
								{safeSeries.map((s, i) => {
									const lineColor = s.color ?? getColorByIndex(colors, i)
									return (
										<LinePath
											key={s.id}
											data={s.data}
											x={(d) => dateScale(getDate(d)) ?? 0}
											y={(d) => valueScale(getValue(d)) ?? 0}
											curve={curveFunc}
											stroke={lineColor}
											strokeWidth={2}
											strokeDasharray={getStrokeDasharray(s.style)}
										/>
									)
								})}

								{/* Data points */}
								{showPoints &&
									safeSeries.map((s, si) => {
										const pointColor = s.color ?? getColorByIndex(colors, si)
										return s.data.map((d, di) => (
											<circle
												key={`${s.id}-${di}`}
												cx={dateScale(getDate(d))}
												cy={valueScale(getValue(d))}
												r={4}
												fill={pointColor}
												stroke="white"
												strokeWidth={2}
											/>
										))
									})}

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
									<>
										<line
											x1={dateScale(tooltipData.date)}
											x2={dateScale(tooltipData.date)}
											y1={0}
											y2={innerHeight}
											stroke={colors.textMuted}
											strokeWidth={1}
											strokeDasharray="4,4"
											pointerEvents="none"
										/>
										{tooltipData.values.map((v) => (
											<circle
												key={v.seriesId}
												cx={dateScale(tooltipData.date)}
												cy={valueScale(v.value)}
												r={5}
												fill={v.color}
												stroke="white"
												strokeWidth={2}
												pointerEvents="none"
											/>
										))}
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
									label: '',
									value: '',
									date: formatTooltipDate(tooltipData.date),
									items: tooltipData.values.map((v) => ({
										label: v.name,
										value: formatValue(v.value),
										color: v.color,
									})),
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

export default LineChart
