/**
 * RoleBadge Component
 *
 * Domain-specific badge for displaying user roles.
 * Uses inline configuration for role metadata (simple enough to not need a separate helper).
 *
 * **Architecture (3-Tier Badge System):**
 * ```
 * RoleBadge (this - TIER 3)
 *    ↓ Maps RoleLevels → StatusBadge props
 * StatusBadge (TIER 2)
 *    ↓ Adds icon support, accessibility
 * Badge (TIER 1 - native DaisyUI 5)
 * ```
 *
 * **Features:**
 * - RoleLevels from central @_types/rbac
 * - Automatic color mapping based on role
 * - Human-readable role labels
 * - Full theme support (light/dark/custom themes)
 * - Type-safe role handling
 *
 * **Role Mapping:**
 * - SuperAdmin: Error (red) - Full system control
 * - Admin: Error (red) - System administration
 * - FulfillmentCoordinator: Info (blue) - Order fulfillment
 * - SalesManager: Success (green) - Sales team lead
 * - SalesRep: Warning (yellow) - Sales representative
 * - Customer: Primary (brand) - End customer
 *
 * **Use Cases:**
 * - User list tables
 * - User profile displays
 * - Account management pages
 * - Navigation header (current user role)
 * - Access control indicators
 *
 * @example
 * ```tsx
 * import { RoleBadge } from '@_components/common'
 * import { RoleLevels } from '@_types/rbac'
 *
 * // Basic usage
 * <RoleBadge role={RoleLevels.Customer} />
 * <RoleBadge role={RoleLevels.Admin} />
 *
 * // With numeric value from API
 * <RoleBadge role={user.role} />
 *
 * // With custom className
 * <RoleBadge role={RoleLevels.Admin} className="ml-2" />
 *
 * // In a table cell
 * cell: ({ row }) => <RoleBadge role={row.original.role} />
 * ```
 *
 * @see StatusBadge - Intermediate component
 * @module RoleBadge
 */

import { RoleLevels } from '@_types/rbac'

import StatusBadge, { type BadgeVariant, type BadgeStyle, type BadgeSize } from '@_components/ui/StatusBadge'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Role metadata configuration
 */
interface RoleConfig {
	label: string
	variant: BadgeVariant
	description: string
}

/**
 * RoleBadge component props interface.
 */
interface RoleBadgeProps {
	/**
	 * User role value from RoleLevels or number.
	 * Should match one of the RoleLevels values.
	 */
	role: number

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
	 * Additional CSS classes.
	 */
	className?: string

	/**
	 * HTML data attribute for testing.
	 */
	'data-testid'?: string
}

// ============================================================================
// ROLE CONFIGURATION
// ============================================================================

/**
 * Role configuration with display properties.
 * Maps RoleLevels values to human-readable labels and color variants.
 *
 * **Design Decision:**
 * Admin roles use 'error' variant (red) to make elevated access visually prominent.
 * This helps users and administrators quickly identify high-privilege accounts.
 */
const ROLE_CONFIG: Record<number, RoleConfig> = {
	[RoleLevels.SuperAdmin]: {
		label: 'Super Admin',
		variant: 'error',
		description: 'Full system control with all permissions',
	},
	[RoleLevels.Admin]: {
		label: 'Admin',
		variant: 'error',
		description: 'System administration and user management',
	},
	[RoleLevels.FulfillmentCoordinator]: {
		label: 'Fulfillment',
		variant: 'info',
		description: 'Order fulfillment and shipping coordination',
	},
	[RoleLevels.SalesManager]: {
		label: 'Sales Manager',
		variant: 'success',
		description: 'Sales team leadership and quote approval',
	},
	[RoleLevels.SalesRep]: {
		label: 'Sales Rep',
		variant: 'warning',
		description: 'Sales representative handling customer quotes',
	},
	[RoleLevels.Customer]: {
		label: 'Customer',
		variant: 'primary',
		description: 'End customer with ordering capabilities',
	},
}

/**
 * Default configuration for unknown roles
 */
const DEFAULT_ROLE_CONFIG: RoleConfig = {
	label: 'Unknown',
	variant: 'neutral',
	description: 'Unknown or unrecognized role',
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RoleBadge Component
 *
 * Renders a colored badge with the user role label.
 *
 * **Implementation:**
 * - Uses inline ROLE_CONFIG (simpler than a full helper class)
 * - Falls back to 'Unknown' for unrecognized roles
 * - Red variant for admin roles highlights elevated access
 *
 * @param props - Component props including role and className
 * @returns RoleBadge component
 */
export default function RoleBadge({
	role,
	badgeStyle = 'solid',
	size = 'md',
	className,
	'data-testid': testId,
}: RoleBadgeProps) {
	const config = ROLE_CONFIG[role] ?? DEFAULT_ROLE_CONFIG

	return (
		<StatusBadge
			variant={config.variant}
			label={config.label}
			description={config.description}
			badgeStyle={badgeStyle}
			size={size}
			className={className}
			data-testid={testId}
		/>
	)
}
