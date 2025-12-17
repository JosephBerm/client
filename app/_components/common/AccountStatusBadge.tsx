/**
 * AccountStatusBadge Component
 *
 * Specialized badge component for displaying account status with appropriate colors.
 * Maps account status enum values to human-readable labels and color variants.
 * Provides consistent visual representation of account status throughout the app.
 *
 * **Features:**
 * - Account status enum support (matches backend Phase 1 implementation)
 * - Automatic color mapping based on status severity
 * - Human-readable status labels
 * - DaisyUI Badge integration
 * - Custom className support
 * - Type-safe status handling
 * - Icon support for visual clarity
 *
 * **Status Mapping (Phase 1 - Backend Aligned):**
 * - PendingVerification (0): Info (blue) - Awaiting email verification
 * - Active (100): Success (green) - Account operational
 * - ForcePasswordChange (150): Warning (yellow) - Must change password
 * - Suspended (200): Error (red) - Admin suspended
 * - Locked (300): Error (red) - Auto-locked (5 failed attempts)
 * - Archived (400): Neutral (gray) - Soft deleted
 *
 * **Use Cases:**
 * - User list tables
 * - Account detail pages
 * - Admin management dashboards
 * - Security audit displays
 * - Account status indicators
 *
 * @example
 * ```tsx
 * import AccountStatusBadge from '@_components/common/AccountStatusBadge';
 * import { AccountStatus } from '@_classes/Enums';
 *
 * // Basic usage
 * <AccountStatusBadge status={AccountStatus.Active} />
 * <AccountStatusBadge status={AccountStatus.Locked} />
 *
 * // With numeric value from API
 * <AccountStatusBadge status={user.status} />
 *
 * // With custom className
 * <AccountStatusBadge status={AccountStatus.Active} className="ml-2" />
 *
 * // With icon
 * <AccountStatusBadge status={AccountStatus.Active} showIcon />
 *
 * // In a table cell
 * {
 *   accessorKey: 'status',
 *   header: 'Status',
 *   cell: ({ getValue }) => (
 *     <AccountStatusBadge status={getValue() as number} />
 *   )
 * }
 * ```
 *
 * @module AccountStatusBadge
 */

import { CheckCircle2, AlertTriangle, XCircle, Clock, Lock, Archive, Key } from 'lucide-react'

import { AccountStatus } from '@_classes/Enums'

import Badge from '@_components/ui/Badge'

/**
 * AccountStatusBadge component props interface.
 */
interface AccountStatusBadgeProps {
	/**
	 * Account status value from AccountStatus enum or number.
	 * Should match one of the AccountStatus enum values.
	 * Defaults to Active if not provided.
	 * 
	 * @example
	 * ```tsx
	 * <AccountStatusBadge status={AccountStatus.Active} />
	 * <AccountStatusBadge status={user.status} />
	 * ```
	 */
	status?: AccountStatus | number | null

	/**
	 * Additional CSS classes to apply to the badge.
	 */
	className?: string

	/**
	 * Whether to show the status icon.
	 * @default false
	 */
	showIcon?: boolean

	/**
	 * Size of the badge.
	 * @default 'sm'
	 */
	size?: 'xs' | 'sm' | 'md' | 'lg'
}

/**
 * Status configuration type
 */
interface StatusConfig {
	label: string
	variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'
	icon: typeof CheckCircle2
}

/**
 * Get status configuration based on status value.
 * Updated to match backend Phase 1 AccountStatus enum.
 */
function getStatusConfig(status: number | null | undefined): StatusConfig {
	switch (status) {
		case AccountStatus.Active:
			return { label: 'Active', variant: 'success', icon: CheckCircle2 }
		case AccountStatus.PendingVerification:
			return { label: 'Pending Verification', variant: 'info', icon: Clock }
		case AccountStatus.ForcePasswordChange:
			return { label: 'Password Required', variant: 'warning', icon: Key }
		case AccountStatus.Suspended:
			return { label: 'Suspended', variant: 'error', icon: AlertTriangle }
		case AccountStatus.Locked:
			return { label: 'Locked', variant: 'error', icon: Lock }
		case AccountStatus.Archived:
			return { label: 'Archived', variant: 'neutral', icon: Archive }
		default:
			// Default to Active for undefined/null (backward compatibility)
			return { label: 'Active', variant: 'success', icon: CheckCircle2 }
	}
}

/**
 * AccountStatusBadge Component
 *
 * Badge component that displays account status with appropriate color and label.
 * Handles status to color/label/icon mapping internally.
 *
 * **Status Colors:**
 * - Success (green): Active - normal operation
 * - Warning (yellow): Suspended - temporary restriction
 * - Error (red): Deactivated - permanent restriction
 * - Info (blue): Pending - awaiting action
 *
 * **Security Consideration:**
 * Non-active statuses use warning/error colors to make them visually prominent,
 * helping administrators quickly identify accounts that need attention.
 *
 * @param props - Component props including status, className, showIcon, size
 * @returns AccountStatusBadge component
 */
export default function AccountStatusBadge({
	status,
	className,
	showIcon = false,
	size = 'sm',
}: AccountStatusBadgeProps) {
	const config = getStatusConfig(status)
	const IconComponent = config.icon

	return (
		<Badge 
			variant={config.variant} 
			tone="subtle"
			size={size}
			className={className}
		>
			{showIcon && (
				<IconComponent className="mr-1 h-3 w-3" />
			)}
			{config.label}
		</Badge>
	)
}
