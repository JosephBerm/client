/**
 * AccountStatusBadge Component
 *
 * Domain-specific badge for displaying account status.
 * Uses centralized AccountStatusHelper for display names and variants (FAANG pattern).
 *
 * **Architecture (3-Tier Badge System):**
 * ```
 * AccountStatusBadge (this - TIER 3)
 *    ↓ Maps AccountStatus → StatusBadge props via AccountStatusHelper
 * StatusBadge (TIER 2)
 *    ↓ Adds icon support, accessibility
 * Badge (TIER 1 - native DaisyUI 5)
 * ```
 *
 * **Features:**
 * - Account status enum from central @_classes/Enums
 * - Automatic color mapping via AccountStatusHelper.getVariant()
 * - Human-readable labels via AccountStatusHelper.getDisplay()
 * - Tooltip descriptions via AccountStatusHelper.getDescription()
 * - Optional icon display
 * - Full theme support (light/dark/custom themes)
 * - Zero hardcoded strings or magic values
 *
 * **Status Mapping (via AccountStatusHelper):**
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
 * import { AccountStatusBadge } from '@_components/common'
 * import { AccountStatus } from '@_classes/Enums'
 *
 * // Basic usage
 * <AccountStatusBadge status={AccountStatus.Active} />
 * <AccountStatusBadge status={AccountStatus.Locked} />
 *
 * // With numeric value from API
 * <AccountStatusBadge status={user.status} />
 *
 * // With icon
 * <AccountStatusBadge status={AccountStatus.Active} showIcon />
 *
 * // With custom className
 * <AccountStatusBadge status={AccountStatus.Active} className="ml-2" />
 *
 * // In a table cell
 * cell: ({ row }) => <AccountStatusBadge status={row.original.status} />
 * ```
 *
 * @see AccountStatusHelper - Status metadata
 * @see StatusBadge - Intermediate component
 * @module AccountStatusBadge
 */

import { CheckCircle2, AlertTriangle, Clock, Lock, Archive, Key } from 'lucide-react'

import { AccountStatus } from '@_classes/Enums'
import AccountStatusHelper from '@_classes/Helpers/AccountStatusHelper'

import StatusBadge, { type BadgeStyle, type BadgeSize } from '@_components/ui/StatusBadge'

// ============================================================================
// TYPES
// ============================================================================

/**
 * AccountStatusBadge component props interface.
 */
interface AccountStatusBadgeProps {
	/**
	 * Account status value from AccountStatus enum or number.
	 * Should match one of the AccountStatus enum values.
	 * Defaults to Active if not provided.
	 */
	status?: AccountStatus | number | null

	/**
	 * Badge visual style.
	 * @default 'solid'
	 */
	badgeStyle?: BadgeStyle

	/**
	 * Badge size.
	 * @default 'md'
	 */
	size?: BadgeSize

	/**
	 * Whether to show the status icon.
	 * @default false
	 */
	showIcon?: boolean

	/**
	 * Additional CSS classes.
	 */
	className?: string

	/**
	 * HTML data attribute for testing.
	 */
	'data-testid'?: string
}

// ============================================================================
// ICON MAPPING
// ============================================================================

/**
 * Maps icon names to Lucide React components
 */
const ICON_MAP = {
	CheckCircle2,
	AlertTriangle,
	Clock,
	Lock,
	Archive,
	Key,
} as const

/**
 * Get icon component for a status
 */
function getIconComponent(iconName: string) {
	return ICON_MAP[iconName as keyof typeof ICON_MAP] ?? CheckCircle2
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AccountStatusBadge Component
 *
 * Renders a colored badge with the account status label.
 * Uses AccountStatusHelper for FAANG-level type-safety and DRY compliance.
 *
 * **Implementation:**
 * - Display name: AccountStatusHelper.getDisplay(status)
 * - Badge variant: AccountStatusHelper.getVariant(status)
 * - Description: AccountStatusHelper.getDescription(status)
 * - Zero hardcoded strings or magic values
 *
 * @param props - Component props including status and className
 * @returns AccountStatusBadge component
 */
export default function AccountStatusBadge({
	status,
	badgeStyle = 'solid',
	size = 'md',
	showIcon = false,
	className,
	'data-testid': testId,
}: AccountStatusBadgeProps) {
	// Normalize status (handle null/undefined → default to Active)
	const normalizedStatus: AccountStatus =
		status != null && AccountStatusHelper.isValid(status) ? status : AccountStatus.Active

	// Get all metadata from AccountStatusHelper (zero magic strings!)
	const label = AccountStatusHelper.getDisplay(normalizedStatus)
	const variant = AccountStatusHelper.getVariant(normalizedStatus)
	const description = AccountStatusHelper.getDescription(normalizedStatus)

	// Get icon if requested
	let icon = undefined
	if (showIcon) {
		const iconName = AccountStatusHelper.getIconName(normalizedStatus)
		const IconComponent = getIconComponent(iconName)
		icon = <IconComponent className="size-[1em]" />
	}

	return (
		<StatusBadge
			variant={variant}
			label={label}
			description={description}
			icon={icon}
			badgeStyle={badgeStyle}
			size={size}
			className={className}
			data-testid={testId}
		/>
	)
}
