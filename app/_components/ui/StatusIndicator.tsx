/**
 * StatusIndicator Component
 *
 * Enhanced status indicator with dot, label, and value display.
 * Designed for security status, feature status, and settings panels.
 *
 * **Features:**
 * - 5 status variants (success, warning, error, pending, neutral)
 * - Label + value layout
 * - Animated pulse for pending state
 * - Theme-aware colors
 * - Accessible
 *
 * **Use Cases:**
 * - Security status panels
 * - Feature availability indicators
 * - Settings status display
 * - Account status summaries
 *
 * @example
 * ```tsx
 * import StatusIndicator from '@_components/ui/StatusIndicator';
 *
 * <StatusIndicator status="success" label="Password" value="Set" />
 * <StatusIndicator status="pending" label="Two-Factor Auth" value="Coming Soon" />
 * <StatusIndicator status="error" label="Email" value="Not Verified" />
 * ```
 *
 * @module StatusIndicator
 */

import classNames from 'classnames'

// ============================================================================
// TYPES
// ============================================================================

export type StatusIndicatorStatus = 'success' | 'warning' | 'error' | 'pending' | 'neutral'

export interface StatusIndicatorProps {
	/** Status variant */
	status: StatusIndicatorStatus
	/** Label text (left side) */
	label: string
	/** Value text (right side) */
	value: string
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Status dot colors using DaisyUI theme tokens
 */
const statusDotClasses: Record<StatusIndicatorStatus, string> = {
	success: 'bg-success',
	warning: 'bg-warning',
	error: 'bg-error',
	pending: 'bg-info animate-pulse',
	neutral: 'bg-base-content/30',
}

/**
 * Value text colors
 */
const statusValueClasses: Record<StatusIndicatorStatus, string> = {
	success: 'text-success',
	warning: 'text-warning',
	error: 'text-error',
	pending: 'text-info',
	neutral: 'text-base-content/60',
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StatusIndicator Component
 *
 * Displays a status with dot indicator, label, and value.
 * Commonly used in security and settings panels.
 */
export default function StatusIndicator({
	status,
	label,
	value,
	className,
}: StatusIndicatorProps) {
	return (
		<div
			className={classNames(
				'flex items-center justify-between gap-3',
				className
			)}
		>
			{/* Label with dot */}
			<div className="flex items-center gap-2">
				<span
					className={classNames(
						'h-2 w-2 shrink-0 rounded-full',
						statusDotClasses[status]
					)}
					role="presentation"
					aria-hidden="true"
				/>
				<span className="text-sm text-base-content/70">
					{label}
				</span>
			</div>

			{/* Value */}
			<span
				className={classNames(
					'text-sm font-medium',
					statusValueClasses[status]
				)}
			>
				{value}
			</span>
		</div>
	)
}
