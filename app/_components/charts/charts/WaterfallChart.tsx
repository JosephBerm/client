'use client'

/**
 * WaterfallChart
 *
 * Waterfall/bridge chart for showing cumulative effect of values.
 * Perfect for "Why This Price?" explainability and financial breakdowns.
 *
 * @module charts/charts/WaterfallChart
 */

import { useMemo, useState } from 'react'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { useTooltip } from '@visx/tooltip'
import { motion } from 'framer-motion'

import { ChartContainer } from '../ChartContainer'
import { ChartTooltip } from '../components/ChartTooltip'
import { useChartColors } from '../hooks/useChartColors'
import { getResponsiveConfig, getInnerDimensions, useReducedMotion } from '../hooks/useChartResponsive'
import { formatCurrency, formatNumber } from '../utils/formatters'
import { DEFAULT_MARGIN, GRID_CONFIG, AXIS_CONFIG } from '../utils/constants'

/**
 * Waterfall step data.
 */
export interface WaterfallStep {
	/** Step identifier */
	id: string
	/** Display label */
	label: string
	/** Value (positive = increase, negative = decrease) */
	value: number
	/** Whether this is a total/subtotal row */
	isTotal?: boolean
	/** Optional color override */
	color?: string
}

export interface WaterfallChartProps {
	/** Waterfall steps */
	data: WaterfallStep[]
	/** Chart height */
	height?: number
	/** Value type for formatting */
	valueType?: 'currency' | 'number'
	/** Color for positive values */
	positiveColor?: string
	/** Color for negative values */
	negativeColor?: string
	/** Color for total bars */
	totalColor?: string
	/** Whether to show connecting lines */
	showConnectors?: boolean
	/** Whether to show value labels on bars */
	showLabels?: boolean
	/** Loading state */
	isLoading?: boolean
	/** Accessibility label */
	ariaLabel?: string
	/** Additional CSS classes */
	className?: string
}

/**
 * Waterfall chart for price/value breakdowns.
 *
 * @example
 * ```tsx
 * // "Why This Price?" visualization
 * <WaterfallChart
 *   data={[
 *     { id: 'base', label: 'Base Price', value: 100, isTotal: true },
 *     { id: 'volume', label: 'Volume Discount', value: -15 },
 *     { id: 'loyalty', label: 'Loyalty Bonus', value: -5 },
 *     { id: 'shipping', label: 'Shipping', value: 12 },
 *     { id: 'tax', label: 'Tax', value: 8 },
 *     { id: 'total', label: 'Final Price', value: 100, isTotal: true },
 *   ]}
 *   valueType="currency"
 *   showConnectors
 *   showLabels
 * />
 * ```
 */
export function WaterfallChart({
	data,
	height = 350,
	valueType = 'currency',
	positiveColor,
	negativeColor,
	totalColor,
	showConnectors = true,
	showLabels = true,
	isLoading = false,
	ariaLabel = 'Waterfall chart',
	className = '',
}: WaterfallChartProps) {
	const colors = useChartColors()
	const reducedMotion = useReducedMotion()
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

	const {
		tooltipOpen,
		tooltipLeft,
		tooltipTop,
		tooltipData,
		showTooltip,
		hideTooltip,
	} = useTooltip<WaterfallStep & { runningTotal: number; barStart: number; barEnd: number }>()

	// Use theme colors or overrides
	const barColors = useMemo(
		() => ({
			positive: positiveColor ?? colors.success,
			negative: negativeColor ?? colors.error,
			total: totalColor ?? colors.primary,
		}),
		[positiveColor, negativeColor, totalColor, colors]
	)

	// Calculate running totals and bar positions
	const processedData = useMemo(() => {
		let runningTotal = 0
		return data.map((step, index) => {
			const barStart = step.isTotal ? 0 : runningTotal
			const barEnd = step.isTotal ? step.value : runningTotal + step.value

			if (!step.isTotal) {
				runningTotal += step.value
			} else {
				runningTotal = step.value
			}

			return {
				...step,
				runningTotal,
				barStart: Math.min(barStart, barEnd),
				barEnd: Math.max(barStart, barEnd),
				isPositive: step.value >= 0,
			}
		})
	}, [data])

	// Format value
	const formatValue = (value: number): string => {
		const sign = value >= 0 ? '+' : ''
		switch (valueType) {
			case 'currency':
				return `${sign}${formatCurrency(value)}`
			default:
				return `${sign}${formatNumber(value)}`
		}
	}

	// Format absolute value (for totals)
	const formatAbsoluteValue = (value: number): string => {
		switch (valueType) {
			case 'currency':
				return formatCurrency(value)
			default:
				return formatNumber(value)
		}
	}

	return (
		<ChartContainer
			height={height}
			isLoading={isLoading}
			isEmpty={data.length === 0}
			emptyMessage="No data available"
			ariaLabel={ariaLabel}
			className={className}
		>
			{({ width, height: containerHeight }) => {
				const responsive = getResponsiveConfig(width)
				const margin = responsive.isMobile
					? { top: 20, right: 20, bottom: 60, left: 60 }
					: { ...DEFAULT_MARGIN, bottom: 60, left: 70 }
				const { innerWidth, innerHeight } = getInnerDimensions(width, containerHeight, margin)

				if (innerWidth <= 0 || innerHeight <= 0) return null

				// Scales
				const xScale = scaleBand<string>({
					domain: processedData.map((d) => d.id),
					range: [0, innerWidth],
					padding: 0.3,
				})

				const allValues = processedData.flatMap((d) => [d.barStart, d.barEnd])
				const yMin = Math.min(0, ...allValues)
				const yMax = Math.max(...allValues) * 1.1

				const yScale = scaleLinear({
					domain: [yMin, yMax],
					range: [innerHeight, 0],
					nice: true,
				})

				const barWidth = xScale.bandwidth()

				return (
					<div className="relative">
						<svg width={width} height={containerHeight}>
							<Group left={margin.left} top={margin.top}>
								{/* Grid */}
								<GridRows
									scale={yScale}
									width={innerWidth}
									stroke={GRID_CONFIG.stroke}
									strokeWidth={GRID_CONFIG.strokeWidth}
									strokeDasharray={GRID_CONFIG.strokeDasharray}
									numTicks={responsive.numYTicks}
								/>

								{/* Zero line */}
								<line
									x1={0}
									x2={innerWidth}
									y1={yScale(0)}
									y2={yScale(0)}
									stroke={colors.textMuted}
									strokeWidth={1}
								/>

								{/* Connecting lines */}
								{showConnectors &&
									processedData.slice(0, -1).map((step, index) => {
										const nextStep = processedData[index + 1]
										if (!nextStep) return null

										const x1 = (xScale(step.id) ?? 0) + barWidth
										const x2 = xScale(nextStep.id) ?? 0
										const y = yScale(step.runningTotal)

										return (
											<line
												key={`connector-${step.id}`}
												x1={x1}
												x2={x2}
												y1={y}
												y2={y}
												stroke={colors.textMuted}
												strokeWidth={1}
												strokeDasharray="4,4"
												opacity={0.5}
											/>
										)
									})}

								{/* Bars */}
								{processedData.map((step, index) => {
									const x = xScale(step.id) ?? 0
									const y = yScale(step.barEnd)
									const barHeight = Math.abs(yScale(step.barStart) - yScale(step.barEnd))

									const barColor = step.isTotal
										? barColors.total
										: step.isPositive
											? barColors.positive
											: barColors.negative

									const isHovered = hoveredIndex === index

									return (
										<g key={step.id}>
											<motion.rect
												x={x}
												y={y}
												width={barWidth}
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
													scaleY: { duration: 0.3, delay: index * 0.05 },
													opacity: { duration: 0.15 },
												}}
												style={{ transformOrigin: 'bottom center' }}
												onMouseEnter={(e) => {
													setHoveredIndex(index)
													showTooltip({
														tooltipData: step,
														tooltipLeft: x + barWidth / 2 + margin.left,
														tooltipTop: y + margin.top - 10,
													})
												}}
												onMouseLeave={() => {
													setHoveredIndex(null)
													hideTooltip()
												}}
												role="graphics-symbol"
												aria-label={`${step.label}: ${step.isTotal ? formatAbsoluteValue(step.value) : formatValue(step.value)}`}
											/>

											{/* Value label */}
											{showLabels && (
												<text
													x={x + barWidth / 2}
													y={y - 8}
													textAnchor="middle"
													fontSize={responsive.labelFontSize - 1}
													fontWeight={step.isTotal ? 600 : 400}
													fill={colors.text}
												>
													{step.isTotal
														? formatAbsoluteValue(step.value)
														: formatValue(step.value)}
												</text>
											)}
										</g>
									)
								})}

								{/* Y Axis */}
								<AxisLeft
									scale={yScale}
									numTicks={responsive.numYTicks}
									tickFormat={(v) => formatAbsoluteValue(v as number)}
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
									scale={xScale}
									top={innerHeight}
									tickFormat={(id) => {
										const step = processedData.find((d) => d.id === id)
										return step?.label ?? id
									}}
									stroke={colors.textMuted}
									tickStroke={colors.textMuted}
									tickLabelProps={{
										fill: colors.textMuted,
										fontSize: responsive.labelFontSize - 1,
										textAnchor: 'middle',
										dy: 8,
										angle: responsive.isMobile ? -45 : 0,
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
									value: tooltipData.isTotal
										? formatAbsoluteValue(tooltipData.value)
										: formatValue(tooltipData.value),
									items: !tooltipData.isTotal
										? [
												{
													label: 'Running Total',
													value: formatAbsoluteValue(tooltipData.runningTotal),
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

export default WaterfallChart
