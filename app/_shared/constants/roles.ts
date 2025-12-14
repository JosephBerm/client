/**
 * Centralized Role Options - Single Source of Truth
 * 
 * MAANG Best Practice: DRY principle - role definitions in ONE place.
 * All components should import from here.
 * 
 * @module shared/constants/roles
 */

import { AccountRole } from '@_classes/Enums'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Role option for selection UI components.
 */
export interface RoleOption {
	/** Numeric value from AccountRole enum */
	value: AccountRole
	/** Display label */
	label: string
	/** Short description */
	description: string
	/** Detailed description for tooltips/previews */
	detailedDescription: string
	/** Emoji icon for visual identification */
	icon: string
	/** Lucide icon name for professional contexts */
	lucideIcon: 'User' | 'Briefcase' | 'ChartBar' | 'Package' | 'Shield'
	/** Role level for sorting (higher = more privileges) */
	level: number
	/** Whether this role requires confirmation before assignment */
	requiresConfirmation: boolean
	/** Key permissions this role grants (for preview) */
	keyPermissions: string[]
	/** Color theme for badges and cards */
	color: 'default' | 'info' | 'success' | 'warning' | 'error'
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Complete role definitions with all metadata.
 * SINGLE SOURCE OF TRUTH for all role-related UI.
 * 
 * Ordered from LOWEST to HIGHEST privilege for intuitive selection.
 */
export const ROLE_OPTIONS: RoleOption[] = [
	{
		value: AccountRole.Customer,
		label: 'Customer',
		description: 'External customer with order access',
		detailedDescription: 'Standard customer account for placing orders, requesting quotes, and managing their own profile. Cannot access internal tools.',
		icon: '👤',
		lucideIcon: 'User',
		level: 0,
		requiresConfirmation: false,
		keyPermissions: [
			'View own orders',
			'Request quotes',
			'Manage own profile',
			'View product catalog',
		],
		color: 'default',
	},
	{
		value: AccountRole.SalesRep,
		label: 'Sales Representative',
		description: 'Sales team member, handles customer orders',
		detailedDescription: 'Sales team member who manages customer relationships, processes quotes, and handles orders for assigned accounts.',
		icon: '💼',
		lucideIcon: 'Briefcase',
		level: 1,
		requiresConfirmation: false,
		keyPermissions: [
			'Manage assigned customers',
			'Create and edit quotes',
			'Process orders',
			'View customer history',
			'Access internal dashboard',
		],
		color: 'info',
	},
	{
		value: AccountRole.SalesManager,
		label: 'Sales Manager',
		description: 'Manages sales team and approves quotes',
		detailedDescription: 'Senior sales role with team oversight. Can approve quotes, manage sales reps, view team performance, and access sales analytics.',
		icon: '📊',
		lucideIcon: 'ChartBar',
		level: 2,
		requiresConfirmation: false,
		keyPermissions: [
			'All Sales Rep permissions',
			'Approve/reject quotes',
			'Manage sales team',
			'View team analytics',
			'Set pricing rules',
		],
		color: 'success',
	},
	{
		value: AccountRole.FulfillmentCoordinator,
		label: 'Fulfillment Coordinator',
		description: 'Manages order fulfillment and shipping',
		detailedDescription: 'Operations role focused on order fulfillment, inventory management, and shipping coordination. Works with vendors and logistics partners.',
		icon: '📦',
		lucideIcon: 'Package',
		level: 3,
		requiresConfirmation: false,
		keyPermissions: [
			'Process order fulfillment',
			'Manage shipping',
			'Update inventory',
			'Coordinate with vendors',
			'Track deliveries',
		],
		color: 'warning',
	},
	{
		value: AccountRole.Admin,
		label: 'Administrator',
		description: 'Full system access, manages all users',
		detailedDescription: 'Complete system administrator with unrestricted access. Can manage all users, roles, settings, and has override capabilities for all operations.',
		icon: '🔐',
		lucideIcon: 'Shield',
		level: 9999999,
		requiresConfirmation: true, // High-risk action
		keyPermissions: [
			'Full system access',
			'Manage all users',
			'Change user roles',
			'Access all data',
			'System configuration',
			'Delete any entity',
		],
		color: 'error',
	},
]

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get role option by AccountRole enum value.
 */
export function getRoleOption(role: AccountRole): RoleOption | undefined {
	return ROLE_OPTIONS.find((r) => r.value === role)
}

/**
 * Get role label by AccountRole enum value.
 */
export function getRoleLabel(role: AccountRole): string {
	return getRoleOption(role)?.label ?? 'Unknown'
}

/**
 * Get role color by AccountRole enum value.
 */
export function getRoleColor(role: AccountRole): RoleOption['color'] {
	return getRoleOption(role)?.color ?? 'default'
}

/**
 * Check if a role requires confirmation before assignment.
 */
export function roleRequiresConfirmation(role: AccountRole): boolean {
	return getRoleOption(role)?.requiresConfirmation ?? false
}

/**
 * Get roles sorted by level (highest first for admin views).
 */
export function getRolesByLevelDescending(): RoleOption[] {
	return [...ROLE_OPTIONS].sort((a, b) => b.level - a.level)
}

/**
 * Get roles sorted by level (lowest first for create forms).
 */
export function getRolesByLevelAscending(): RoleOption[] {
	return [...ROLE_OPTIONS].sort((a, b) => a.level - b.level)
}

/**
 * Staff roles only (excludes Customer).
 */
export function getStaffRoles(): RoleOption[] {
	return ROLE_OPTIONS.filter((r) => r.value !== AccountRole.Customer)
}

/**
 * Check if role is a staff role (not Customer).
 */
export function isStaffRole(role: AccountRole): boolean {
	return role !== AccountRole.Customer
}

/**
 * Convert role options to SelectOption format for dropdown components.
 * 
 * @example
 * ```tsx
 * import { getRoleSelectOptions } from '@_shared'
 * <Select options={getRoleSelectOptions()} />
 * ```
 */
export function getRoleSelectOptions(): { value: AccountRole; label: string }[] {
	return ROLE_OPTIONS.map((role) => ({
		value: role.value,
		label: role.label,
	}))
}

