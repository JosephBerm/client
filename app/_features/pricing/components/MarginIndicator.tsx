'use client'

/**
 * MarginIndicator Component
 *
 * Visual indicator for margin health with color-coded status.
 * Shows green/yellow/red based on margin thresholds.
 *
 * **Use Cases:**
 * - Quote line items showing margin status
 * - Admin pricing dashboard
 * - Sales rep quote review
 *
 * **PRD Reference:** prd_pricing_engine.md - US-PRICE-002
 *
 * @module pricing/components
 */

import { memo, useMemo } from 'react'

// =========================================================================
// TYPES
// =========================================================================

export interface MarginIndicatorProps {
	/** Effective margin percentage (can be null for customers) */
	marginPercent: number | null
	/** Whether margin protection was applied */
	marginProtected?: boolean
	/** Size variant */
	size?: 'sm' | 'md' | 'lg'
	/** Whether to show the percentage label */
	showLabel?: boolean
	/** Whether to show the status text (Healthy/Warning/Critical) */
	showStatus?: boolean
	/** Threshold for warning status (default: 10) */
	warningThreshold?: number
	/** Threshold for healthy status (default: 20) */
	healthyThreshold?: number
	/** Custom CSS classes */
	className?: string
}

type MarginStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

// =========================================================================
// CONSTANTS
// =========================================================================

const STATUS_CONFIG: Record<MarginStatus, { color: string; bg: string; text: string; icon: string }> = {
	healthy: {
		color: 'text-success',
		bg: 'bg-success/10',
		text: 'Healthy',
		icon: '✓',
	},
	warning: {
		color: 'text-warning',
		bg: 'bg-warning/10',
		text: 'Warning',
		icon: '⚠',
	},
	critical: {
		color: 'text-error',
		bg: 'bg-error/10',
		text: 'Critical',
		icon: '✗',
	},
	unknown: {
		color: 'text-base-content/50',
		bg: 'bg-base-200',
		text: 'Unknown',
		icon: '?',
	},
}

const SIZE_CONFIG = {
	sm: {
		container: 'h-4 px-2 text-xs gap-1',
		dot: 'w-2 h-2',
		badge: 'badge-xs',
	},
	md: {
		container: 'h-6 px-3 text-sm gap-1.5',
		dot: 'w-2.5 h-2.5',
		badge: 'badge-sm',
	},
	lg: {
		container: 'h-8 px-4 text-base gap-2',
		dot: 'w-3 h-3',
		badge: 'badge-md',
	},
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

function getMarginStatus(
	marginPercent: number | null,
	warningThreshold: number,
	healthyThreshold: number
): MarginStatus {
	if (marginPercent == null) return 'unknown'
	if (marginPercent >= healthyThreshold) return 'healthy'
	if (marginPercent >= warningThreshold) return 'warning'
	return 'critical'
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

/**
 * MarginIndicator displays margin health with color-coded status.
 *
 * @example
 * ```tsx
 * // Basic indicator
 * <MarginIndicator marginPercent={25.5} />
 *
 * // With all options
 * <MarginIndicator
 *   marginPercent={8.5}
 *   marginProtected
 *   size="md"
 *   showLabel
 *   showStatus
 * />
 *
 * // Customer view (margin hidden)
 * <MarginIndicator marginPercent={null} />
 * ```
 */
export const MarginIndicator = memo(function MarginIndicator({
	marginPercent,
	marginProtected = false,
	size = 'md',
	showLabel = true,
	showStatus = false,
	warningThreshold = 10,
	healthyThreshold = 20,
	className = '',
}: MarginIndicatorProps) {
	const status = useMemo(
		() => getMarginStatus(marginPercent, warningThreshold, healthyThreshold),
		[marginPercent, warningThreshold, healthyThreshold]
	)

	const statusConfig = STATUS_CONFIG[status]
	const sizeConfig = SIZE_CONFIG[size]

	// If margin is null (customer view), show nothing or a placeholder
	if (marginPercent == null) {
		return null
	}

	return (
		<div className={`inline-flex items-center ${className}`}>
			{/* Main indicator pill */}
			<div
				className={`
					inline-flex items-center rounded-full font-medium
					${statusConfig.bg} ${statusConfig.color}
					${sizeConfig.container}
				`}
			>
				{/* Status dot */}
				<span
					className={`
						rounded-full shrink-0
						${sizeConfig.dot}
						${status === 'healthy' ? 'bg-success' : status === 'warning' ? 'bg-warning' : 'bg-error'}
					`}
				/>

				{/* Percentage label */}
				{showLabel && (
					<span className="font-semibold">
						{marginPercent.toFixed(1)}%
					</span>
				)}

				{/* Status text */}
				{showStatus && (
					<span className="opacity-80">
						{statusConfig.text}
					</span>
				)}
			</div>

			{/* Margin protection badge */}
			{marginProtected && (
				<span className={`badge badge-warning ml-1.5 ${sizeConfig.badge}`}>
					🛡️ Protected
				</span>
			)}
		</div>
	)
})

// =========================================================================
// EXPORT VARIANTS
// =========================================================================

/**
 * Compact margin dot indicator (no label, just colored dot).
 */
export const MarginDot = memo(function MarginDot({
	marginPercent,
	warningThreshold = 10,
	healthyThreshold = 20,
	className = '',
}: Pick<MarginIndicatorProps, 'marginPercent' | 'warningThreshold' | 'healthyThreshold' | 'className'>) {
	const status = getMarginStatus(marginPercent, warningThreshold, healthyThreshold)

	if (marginPercent == null) return null

	const colorClass =
		status === 'healthy'
			? 'bg-success'
			: status === 'warning'
			? 'bg-warning'
			: 'bg-error'

	return (
		<span
			className={`inline-block w-2.5 h-2.5 rounded-full ${colorClass} ${className}`}
			title={`Margin: ${marginPercent.toFixed(1)}%`}
		/>
	)
})

/**
 * Margin badge for inline use in tables.
 */
export const MarginBadge = memo(function MarginBadge({
	marginPercent,
	marginProtected = false,
	warningThreshold = 10,
	healthyThreshold = 20,
	className = '',
}: Pick<MarginIndicatorProps, 'marginPercent' | 'marginProtected' | 'warningThreshold' | 'healthyThreshold' | 'className'>) {
	const status = getMarginStatus(marginPercent, warningThreshold, healthyThreshold)

	if (marginPercent == null) return null

	const badgeClass =
		status === 'healthy'
			? 'badge-success'
			: status === 'warning'
			? 'badge-warning'
			: 'badge-error'

	return (
		<div className={`inline-flex items-center gap-1 ${className}`}>
			<span className={`badge ${badgeClass} badge-sm`}>
				{marginPercent.toFixed(1)}%
			</span>
			{marginProtected && (
				<span className="badge badge-warning badge-sm" title="Margin protection applied">
					🛡️
				</span>
			)}
		</div>
	)
})

export default MarginIndicator
