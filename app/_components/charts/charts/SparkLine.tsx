'use client'

/**
 * SparkLine
 *
 * Compact inline chart for KPI cards and data tables.
 * Minimal, no axes, designed for embedding in other components.
 *
 * @module charts/charts/SparkLine
 */

import { useMemo } from 'react'
import { Group } from '@visx/group'
import { LinePath, AreaClosed } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { curveMonotoneX } from '@visx/curve'
import { LinearGradient } from '@visx/gradient'
import { motion } from 'framer-motion'
import classNames from 'classnames'

import { useChartColors } from '../hooks/useChartColors'
import { useReducedMotion } from '../hooks/useChartResponsive'
import { COMPACT_MARGIN } from '../utils/constants'

export interface SparkLineDataPoint {
	value: number
}

export interface SparkLineProps {
	/** Array of values (simplified data format) */
	data: number[] | SparkLineDataPoint[]
	/** Width of the sparkline */
	width?: number
	/** Height of the sparkline */
	height?: number
	/** Whether to show area fill */
	showArea?: boolean
	/** Color override */
	color?: string
	/** Whether the trend is positive (for color selection) */
	isPositive?: boolean
	/** Stroke width */
	strokeWidth?: number
	/** Whether to animate on mount */
	animate?: boolean
	/** Additional CSS classes */
	className?: string
}

/**
 * Compact sparkline for inline visualization.
 *
 * @example
 * ```tsx
 * // In a KPI card
 * <div className="flex items-center gap-2">
 *   <span className="text-2xl font-bold">$1,234</span>
 *   <SparkLine data={[100, 120, 115, 140, 135, 160]} width={80} height={24} />
 * </div>
 * ```
 */
export function SparkLine({
	data,
	width = 100,
	height = 32,
	showArea = true,
	color,
	isPositive,
	strokeWidth = 1.5,
	animate = true,
	className = '',
}: SparkLineProps) {
	const colors = useChartColors()
	const reducedMotion = useReducedMotion()

	// Normalize data to array of values
	const values = useMemo(() => {
		if (data.length === 0) return []
		if (typeof data[0] === 'number') {
			return data as number[]
		}
		return (data as SparkLineDataPoint[]).map((d) => d.value)
	}, [data])

	// Determine color based on trend
	const chartColor = useMemo(() => {
		if (color) return color
		if (isPositive !== undefined) {
			return isPositive ? colors.success : colors.error
		}
		// Auto-detect trend from first and last value
		if (values.length >= 2) {
			const trend = values[values.length - 1] - values[0]
			return trend >= 0 ? colors.success : colors.error
		}
		return colors.primary
	}, [color, isPositive, values, colors])

	if (values.length < 2) {
		return (
			<div
				className={`bg-base-200 rounded ${className}`}
				style={{ width, height }}
				role="img"
				aria-label="No data"
			/>
		)
	}

	const margin = COMPACT_MARGIN
	const innerWidth = width - margin.left - margin.right
	const innerHeight = height - margin.top - margin.bottom

	// Scales
	const xScale = scaleLinear({
		domain: [0, values.length - 1],
		range: [0, innerWidth],
	})

	const yMin = Math.min(...values)
	const yMax = Math.max(...values)
	const yPadding = yMax === yMin ? 1 : (yMax - yMin) * 0.1

	const yScale = scaleLinear({
		domain: [yMin - yPadding, yMax + yPadding],
		range: [innerHeight, 0],
	})

	// Convert to data points for visx
	const points = values.map((value, index) => ({ index, value }))

	const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`

	const shouldAnimate = animate && !reducedMotion

	return (
		<svg
			width={width}
			height={height}
			className={className}
			role="img"
			aria-label={`Sparkline showing trend from ${values[0]} to ${values[values.length - 1]}`}
		>
			{showArea && (
				<LinearGradient
					id={gradientId}
					from={chartColor}
					to={chartColor}
					fromOpacity={0.3}
					toOpacity={0}
				/>
			)}

			<Group left={margin.left} top={margin.top}>
				{/* Area */}
				{showArea && (
					<AreaClosed
						data={points}
						x={(d) => xScale(d.index)}
						y={(d) => yScale(d.value)}
						yScale={yScale}
						curve={curveMonotoneX}
						fill={`url(#${gradientId})`}
					/>
				)}

				{/* Line */}
				{shouldAnimate ? (
					<motion.g
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
					>
						<LinePath
							data={points}
							x={(d) => xScale(d.index)}
							y={(d) => yScale(d.value)}
							curve={curveMonotoneX}
							stroke={chartColor}
							strokeWidth={strokeWidth}
							strokeLinecap="round"
						/>
					</motion.g>
				) : (
					<LinePath
						data={points}
						x={(d) => xScale(d.index)}
						y={(d) => yScale(d.value)}
						curve={curveMonotoneX}
						stroke={chartColor}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
					/>
				)}

				{/* End point indicator */}
				<circle
					cx={xScale(values.length - 1)}
					cy={yScale(values[values.length - 1])}
					r={3}
					fill={chartColor}
				/>
			</Group>
		</svg>
	)
}

/**
 * SparkLine with percentage change indicator.
 */
export function SparkLineWithChange({
	data,
	change,
	changeLabel,
	width = 100,
	height = 32,
	className = '',
}: SparkLineProps & {
	/** Percentage change */
	change?: number
	/** Label for change (e.g., "vs last month") */
	changeLabel?: string
}) {
	const isPositive = change !== undefined ? change >= 0 : undefined

	return (
		<div className={classNames('flex items-center gap-2', className)}>
			<SparkLine
				data={data}
				width={width}
				height={height}
				isPositive={isPositive}
			/>
			{change !== undefined && (
				<span
					className={`text-xs font-medium ${
						isPositive ? 'text-success' : 'text-error'
					}`}
				>
					{isPositive ? '+' : ''}
					{change.toFixed(1)}%
					{changeLabel && (
						<span className="text-base-content/50 ml-1">{changeLabel}</span>
					)}
				</span>
			)}
		</div>
	)
}

export default SparkLine
