/**
 * RoleBadge Component
 *
 * Specialized badge component for displaying user roles with appropriate colors.
 * Maps user role numeric values to human-readable labels and color variants.
 * Provides consistent visual representation of user roles throughout the app.
 *
 * **Features:**
 * - User role enum with numeric values
 * - Automatic color mapping based on role
 * - Human-readable role labels
 * - DaisyUI Badge integration
 * - Custom className support
 * - Type-safe role handling
 *
 * **Role Mapping:**
 * - Customer (0): Primary (brand color) - Regular users
 * - Admin (9999999): Error (red) - Full system access
 * - Unknown: Neutral (gray) - Fallback for unrecognized roles
 *
 * **Note:**
 * This component uses a local UserRole enum for backward compatibility.
 * Consider migrating to use AccountRole from @_classes/Enums instead.
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
 * import RoleBadge, { UserRole } from '@_components/common/RoleBadge';
 *
 * // Basic usage
 * <RoleBadge role={UserRole.Customer} />
 * <RoleBadge role={UserRole.Admin} />
 *
 * // With numeric value from API
 * <RoleBadge role={user.role} />
 *
 * // With custom className
 * <RoleBadge role={UserRole.Admin} className="ml-2" />
 *
 * // In a table cell
 * {
 *   accessorKey: 'role',
 *   header: 'Role',
 *   cell: ({ getValue }) => (
 *     <RoleBadge role={getValue() as number} />
 *   )
 * }
 *
 * // In navigation header
 * <div className="flex items-center gap-2">
 *   <span>{user.name.toString()}</span>
 *   <RoleBadge role={user.role} />
 * </div>
 *
 * // Conditional rendering based on role
 * {user.role === UserRole.Admin && (
 *   <div className="admin-panel">
 *     <RoleBadge role={user.role} />
 *     <span className="ml-2">You have full system access</span>
 *   </div>
 * )}
 * ```
 *
 * @module RoleBadge
 */

import Badge from '@_components/ui/Badge'

/**
 * User role enumeration.
 * Maps user roles to numeric values for backend compatibility.
 *
 * @deprecated Consider using AccountRole from @_classes/Enums instead.
 */
export enum UserRole {
	/** Regular customer user */
	Customer = 0,
	/** Administrator with full access */
	Admin = 9999999,
}

/**
 * RoleBadge component props interface.
 */
interface RoleBadgeProps {
	/**
	 * User role value (enum or number).
	 * Should match one of the UserRole enum values.
	 */
	role: UserRole | number

	/**
	 * Additional CSS classes to apply to the badge.
	 */
	className?: string
}

/**
 * RoleBadge Component
 *
 * Badge component that displays user role with appropriate color and label.
 * Handles role to color/label mapping internally.
 *
 * **Role Configuration:**
 * Each role maps to:
 * - label: Human-readable text
 * - variant: Badge color variant
 *
 * **Color Meanings:**
 * - Primary (brand): Regular user role
 * - Error (red): Administrative/elevated role (stands out for security awareness)
 * - Neutral (gray): Unknown or unrecognized role
 *
 * **Security Consideration:**
 * Admin role uses error (red) variant to make it visually prominent,
 * helping users and administrators quickly identify elevated access accounts.
 *
 * @param props - Component props including role and className
 * @returns RoleBadge component
 */
export default function RoleBadge({ role, className }: RoleBadgeProps) {
	const getRoleConfig = (role: number) => {
		switch (role) {
			case UserRole.Admin:
				return { label: 'Admin', variant: 'error' as const }
			case UserRole.Customer:
				return { label: 'Customer', variant: 'primary' as const }
			default:
				return { label: 'User', variant: 'neutral' as const }
		}
	}

	const config = getRoleConfig(role)

	return (
		<Badge variant={config.variant} className={className}>
			{config.label}
		</Badge>
	)
}
