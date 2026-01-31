'use client'

/**
 * FunnelChart
 *
 * Funnel/pipeline visualization for conversion tracking.
 * Shows progressive stages with percentage distribution.
 *
 * @module charts/charts/FunnelChart
 */

import { useMemo } from 'react'
import { Group } from '@visx/group'
import { scaleLinear, scaleBand } from '@visx/scale'
import { motion } from 'framer-motion'
import classNames from 'classnames'

import { ChartContainer } from '../ChartContainer'
import { useChartColors, getColorByIndex } from '../hooks/useChartColors'
import { useReducedMotion } from '../hooks/useChartResponsive'
import { formatNumber, formatPercent } from '../utils/formatters'

/**
 * Funnel stage data point.
 */
export interface FunnelStage {
	/** Stage identifier */
	id: string
	/** Stage display name */
	name: string
	/** Value at this stage */
	value: number
	/** Optional color override */
	color?: string
	/** Optional description */
	description?: string
}

export interface FunnelChartProps {
	/** Funnel stages (top to bottom) */
	data: FunnelStage[]
	/** Chart height */
	height?: number
	/** Whether to show percentages */
	showPercentages?: boolean
	/** Whether to show values */
	showValues?: boolean
	/** Calculate percentages relative to first stage or previous stage */
	percentageMode?: 'absolute' | 'relative'
	/** Loading state */
	isLoading?: boolean
	/** Accessibility label */
	ariaLabel?: string
	/** Click handler for stages */
	onStageClick?: (stage: FunnelStage, index: number) => void
	/** Additional CSS classes */
	className?: string
}

/**
 * Funnel chart for conversion pipeline visualization.
 *
 * @example
 * ```tsx
 * <FunnelChart
 *   data={[
 *     { id: 'views', name: 'Views', value: 1000 },
 *     { id: 'clicks', name: 'Clicks', value: 400 },
 *     { id: 'signups', name: 'Sign-ups', value: 100 },
 *     { id: 'purchases', name: 'Purchases', value: 25 },
 *   ]}
 *   showPercentages
 *   height={300}
 * />
 * ```
 */
export function FunnelChart({
	data,
	height = 300,
	showPercentages = true,
	showValues = true,
	percentageMode = 'absolute',
	isLoading = false,
	ariaLabel = 'Funnel chart',
	onStageClick,
	className = '',
}: FunnelChartProps) {
	const colors = useChartColors()
	const reducedMotion = useReducedMotion()

	// Calculate percentages
	const stagesWithPercentage = useMemo(() => {
		if (data.length === 0) return []

		const maxValue = data[0]?.value ?? 1

		return data.map((stage, index) => {
			const absolutePercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0
			const relativePercent =
				index > 0 && data[index - 1]?.value > 0
					? (stage.value / data[index - 1].value) * 100
					: 100

			return {
				...stage,
				absolutePercent,
				relativePercent,
				displayPercent: percentageMode === 'absolute' ? absolutePercent : relativePercent,
			}
		})
	}, [data, percentageMode])

	return (
		<ChartContainer
			height={height}
			isLoading={isLoading}
			isEmpty={data.length === 0}
			emptyMessage="No funnel data available"
			ariaLabel={ariaLabel}
			className={className}
		>
			{({ width, height: containerHeight }) => {
				const margin = { top: 8, right: 80, bottom: 8, left: 16 }
				const innerWidth = width - margin.left - margin.right
				const innerHeight = containerHeight - margin.top - margin.bottom

				// Scales
				const yScale = scaleBand<string>({
					domain: stagesWithPercentage.map((d) => d.id),
					range: [0, innerHeight],
					padding: 0.2,
				})

				const maxValue = Math.max(...stagesWithPercentage.map((d) => d.value), 1)
				const xScale = scaleLinear({
					domain: [0, maxValue],
					range: [0, innerWidth],
				})

				const barHeight = yScale.bandwidth()

				return (
					<div className="relative">
						<svg width={width} height={containerHeight}>
							<Group left={margin.left} top={margin.top}>
								{stagesWithPercentage.map((stage, index) => {
									const y = yScale(stage.id) ?? 0
									const barWidth = xScale(stage.value)
									const stageColor = stage.color ?? getColorByIndex(colors, index)

									// Calculate funnel shape (narrowing from top to bottom)
									const funnelWidth = innerWidth * (1 - index * 0.1)
									const actualBarWidth = Math.min(barWidth, funnelWidth)
									const x = (innerWidth - funnelWidth) / 2

									const isClickable = !!onStageClick

									return (
										<Group key={stage.id}>
											{/* Background track */}
											<rect
												x={x}
												y={y}
												width={funnelWidth}
												height={barHeight}
												fill={colors.grid}
												rx={6}
											/>

											{/* Filled bar */}
											<motion.rect
												x={x}
												y={y}
												width={actualBarWidth}
												height={barHeight}
												fill={stageColor}
												rx={6}
												initial={reducedMotion ? false : { width: 0 }}
												animate={{ width: actualBarWidth }}
												transition={{
													duration: 0.5,
													delay: index * 0.1,
													ease: 'easeOut',
												}}
												style={{ cursor: isClickable ? 'pointer' : 'default' }}
												onClick={() => onStageClick?.(stage, index)}
												role="graphics-symbol"
												aria-label={`${stage.name}: ${stage.value}`}
											/>

											{/* Stage label */}
											<text
												x={x + 12}
												y={y + barHeight / 2}
												fontSize={13}
												fontWeight={500}
												fill={colors.background}
												dominantBaseline="middle"
												style={{ pointerEvents: 'none' }}
											>
												{stage.name}
											</text>

											{/* Description (if fits) */}
											{stage.description && barHeight > 30 && (
												<text
													x={x + 12}
													y={y + barHeight / 2 + 14}
													fontSize={10}
													fill={`${colors.background}99`}
													dominantBaseline="middle"
													style={{ pointerEvents: 'none' }}
												>
													{stage.description}
												</text>
											)}
										</Group>
									)
								})}
							</Group>

							{/* Right side labels */}
							<Group left={width - margin.right + 8} top={margin.top}>
								{stagesWithPercentage.map((stage) => {
									const y = yScale(stage.id) ?? 0

									return (
										<Group key={`label-${stage.id}`}>
											{showValues && (
												<text
													x={0}
													y={y + barHeight / 2 - 8}
													fontSize={14}
													fontWeight={600}
													fill={colors.text}
													dominantBaseline="middle"
												>
													{formatNumber(stage.value)}
												</text>
											)}
											{showPercentages && (
												<text
													x={0}
													y={y + barHeight / 2 + 8}
													fontSize={11}
													fill={colors.textMuted}
													dominantBaseline="middle"
												>
													{formatPercent(stage.displayPercent, { decimals: 0 })}
												</text>
											)}
										</Group>
									)
								})}
							</Group>
						</svg>
					</div>
				)
			}}
		</ChartContainer>
	)
}

/**
 * Horizontal funnel variant with connecting arrows.
 */
export function FunnelChartHorizontal({
	data,
	height = 120,
	showPercentages = true,
	isLoading = false,
	ariaLabel = 'Horizontal funnel chart',
	className = '',
}: Omit<FunnelChartProps, 'onStageClick'>) {
	const colors = useChartColors()

	const stagesWithPercentage = useMemo(() => {
		if (data.length === 0) return []
		const maxValue = data[0]?.value ?? 1

		return data.map((stage, index) => ({
			...stage,
			percent: maxValue > 0 ? (stage.value / maxValue) * 100 : 0,
		}))
	}, [data])

	return (
		<ChartContainer
			height={height}
			isLoading={isLoading}
			isEmpty={data.length === 0}
			emptyMessage="No data available"
			ariaLabel={ariaLabel}
			className={className}
		>
			{({ height: containerHeight }) => (
				<div className={classNames('flex items-center gap-1')} style={{ height: containerHeight }}>
					{stagesWithPercentage.map((stage, index) => {
						const stageColor = stage.color ?? getColorByIndex(colors, index)
						const widthPercent = 100 / data.length

						return (
							<div
								key={stage.id}
								className="flex flex-col items-center"
								style={{ width: `${widthPercent}%` }}
							>
								{/* Stage bar */}
								<div
									className="w-full rounded-lg flex items-center justify-center text-white font-medium text-sm"
									style={{
										backgroundColor: stageColor,
										height: `${Math.max(40, stage.percent * 0.8)}px`,
										minHeight: 40,
									}}
								>
									{formatNumber(stage.value)}
								</div>

								{/* Label */}
								<span className="text-xs text-base-content/70 mt-1 text-center truncate w-full">
									{stage.name}
								</span>

								{/* Percentage */}
								{showPercentages && (
									<span className="text-xs text-base-content/50">
										{formatPercent(stage.percent, { decimals: 0 })}
									</span>
								)}
							</div>
						)
					})}
				</div>
			)}
		</ChartContainer>
	)
}

export default FunnelChart
