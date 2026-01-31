'use client'

/**
 * ChartContainer
 *
 * Responsive container wrapper for all charts.
 * Handles:
 * - Responsive sizing via @visx/responsive
 * - Loading states
 * - Empty states
 * - Accessibility attributes
 * - Reduced motion preferences
 *
 * @module charts/ChartContainer
 */

import { useId, type ReactNode, type CSSProperties } from 'react'
import { ParentSize } from '@visx/responsive'
import classNames from 'classnames'

import { ChartErrorBoundary } from './components/ChartErrorBoundary'
import { ChartLoadingState } from './components/ChartLoadingState'
import { ChartEmptyState } from './components/ChartEmptyState'

export interface ChartContainerProps {
	/** Chart content render function receiving width/height */
	children: (dimensions: { width: number; height: number }) => ReactNode
	/** Minimum height for the chart */
	minHeight?: number
	/** Maximum height for the chart */
	maxHeight?: number
	/** Fixed height (overrides min/max) */
	height?: number
	/** Whether data is loading */
	isLoading?: boolean
	/** Whether there is no data to display */
	isEmpty?: boolean
	/** Message to show when empty */
	emptyMessage?: string
	/** Chart title for accessibility */
	ariaLabel?: string
	/** Additional description for screen readers */
	ariaDescription?: string
	/** Additional CSS classes */
	className?: string
	/** Inline styles */
	style?: CSSProperties
	/** Debounce resize events (ms) */
	debounceTime?: number
}

/**
 * Responsive chart container with loading/empty states.
 *
 * @example
 * ```tsx
 * <ChartContainer
 *   height={300}
 *   isLoading={isLoading}
 *   isEmpty={!data.length}
 *   ariaLabel="Revenue over time"
 * >
 *   {({ width, height }) => (
 *     <svg width={width} height={height}>
 *       ...chart content
 *     </svg>
 *   )}
 * </ChartContainer>
 * ```
 */
export function ChartContainer({
	children,
	minHeight = 200,
	maxHeight,
	height: fixedHeight,
	isLoading = false,
	isEmpty = false,
	emptyMessage = 'No data available',
	ariaLabel,
	ariaDescription,
	className = '',
	style,
	debounceTime = 100,
}: ChartContainerProps) {
	const chartId = useId()
	const descriptionId = ariaDescription ? `${chartId}-desc` : undefined

	// Calculate container height
	const containerHeight = fixedHeight ?? minHeight
	const containerStyle: CSSProperties = {
		minHeight: fixedHeight ?? minHeight,
		maxHeight: maxHeight,
		height: fixedHeight,
		...style,
	}

	const content = isLoading ? (
		<div
			className={classNames('relative', className)}
			style={containerStyle}
			role="img"
			aria-label={ariaLabel ? `${ariaLabel} - Loading` : 'Chart loading'}
			aria-busy="true"
		>
			<ChartLoadingState height={containerHeight} />
		</div>
	) : isEmpty ? (
		<div
			className={classNames('relative', className)}
			style={containerStyle}
			role="img"
			aria-label={ariaLabel ? `${ariaLabel} - No data` : 'Chart with no data'}
		>
			<ChartEmptyState message={emptyMessage} height={containerHeight} />
		</div>
	) : (
		<div
			className={classNames('relative', className)}
			style={containerStyle}
			role="img"
			aria-label={ariaLabel}
			aria-describedby={descriptionId}
		>
			{ariaDescription && (
				<span id={descriptionId} className="sr-only">
					{ariaDescription}
				</span>
			)}
			<ParentSize debounceTime={debounceTime}>
				{({ width, height }) => {
					// Don't render if dimensions are too small
					if (!Number.isFinite(width) || !Number.isFinite(height) || width < 50 || height < 50) {
						return null
					}
					return <>{children({ width, height })}</>
				}}
			</ParentSize>
		</div>
	)

	return <ChartErrorBoundary>{content}</ChartErrorBoundary>
}

export default ChartContainer
