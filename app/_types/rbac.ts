/**
 * RBAC Types and Constants for Frontend
 * 
 * This file provides type-safe constants and types for the RBAC system.
 * Mirrors the backend RBACConstants.cs for consistency.
 * 
 * Architecture: Designed for portability - copy this file to any TypeScript project.
 * 
 * @module RBAC
 */

// =========================================================================
// ROLE LEVELS
// =========================================================================

/**
 * Role level constants. Higher values = more authority.
 * Matches backend Account.AccountRole enum.
 */
export const RoleLevels = {
	Customer: 0,
	SalesRep: 100,
	SalesManager: 200,
	FulfillmentCoordinator: 300,
	Admin: 9999999,
} as const

export type RoleLevel = (typeof RoleLevels)[keyof typeof RoleLevels]

// =========================================================================
// ROLE NAMES
// =========================================================================

/**
 * Role name strings for display and API calls.
 */
export const RoleNames = {
	Customer: 'customer',
	SalesRep: 'sales_rep',
	SalesManager: 'sales_manager',
	FulfillmentCoordinator: 'fulfillment_coordinator',
	Admin: 'admin',
} as const

export type RoleName = (typeof RoleNames)[keyof typeof RoleNames]

/**
 * Role display names for UI.
 */
export const RoleDisplayNames: Record<RoleLevel, string> = {
	[RoleLevels.Customer]: 'Customer',
	[RoleLevels.SalesRep]: 'Sales Representative',
	[RoleLevels.SalesManager]: 'Sales Manager',
	[RoleLevels.FulfillmentCoordinator]: 'Fulfillment Coordinator',
	[RoleLevels.Admin]: 'Administrator',
}

// =========================================================================
// RESOURCES
// =========================================================================

/**
 * Resource types for permission checks.
 */
export const Resources = {
	Quotes: 'quotes',
	Orders: 'orders',
	Products: 'products',
	Customers: 'customers',
	Vendors: 'vendors',
	Analytics: 'analytics',
	Users: 'users',
	Settings: 'settings',
	Providers: 'providers',
} as const

export type Resource = (typeof Resources)[keyof typeof Resources]

// =========================================================================
// ACTIONS
// =========================================================================

/**
 * Action types for permission checks.
 */
export const Actions = {
	Read: 'read',
	Create: 'create',
	Update: 'update',
	Delete: 'delete',
	Approve: 'approve',
	Assign: 'assign',
	Export: 'export',
	Manage: 'manage',
	ConfirmPayment: 'confirm_payment',
	UpdateTracking: 'update_tracking',
	Archive: 'archive',
} as const

export type Action = (typeof Actions)[keyof typeof Actions]

// =========================================================================
// CONTEXTS
// =========================================================================

/**
 * Context scopes for permission checks.
 */
export const Contexts = {
	Own: 'own',
	Assigned: 'assigned',
	Team: 'team',
	All: 'all',
} as const

export type Context = (typeof Contexts)[keyof typeof Contexts]

// =========================================================================
// PERMISSION TYPE
// =========================================================================

/**
 * Permission string format: resource:action or resource:action:context
 */
export type Permission = `${Resource}:${Action}` | `${Resource}:${Action}:${Context}`

// =========================================================================
// USER PERMISSIONS INTERFACE
// =========================================================================

/**
 * User permissions data structure.
 */
export interface UserPermissions {
	userId: number
	roles: RoleName[]
	permissions: Permission[]
	roleLevel: RoleLevel
	metadata: {
		customerId?: number
		territory?: string
		primarySalesRepId?: number
	}
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Check if a role level has at least the specified minimum role.
 */
export function hasMinimumRole(userRoleLevel: number | undefined, minimumRole: RoleLevel): boolean {
	if (userRoleLevel === undefined) return false
	return userRoleLevel >= minimumRole
}

/**
 * Check if user is an Admin.
 */
export function isAdmin(roleLevel: number | undefined): boolean {
	return hasMinimumRole(roleLevel, RoleLevels.Admin)
}

/**
 * Check if user is at least a SalesManager.
 */
export function isSalesManagerOrAbove(roleLevel: number | undefined): boolean {
	return hasMinimumRole(roleLevel, RoleLevels.SalesManager)
}

/**
 * Check if user is at least a SalesRep.
 */
export function isSalesRepOrAbove(roleLevel: number | undefined): boolean {
	return hasMinimumRole(roleLevel, RoleLevels.SalesRep)
}

/**
 * Check if user is a Customer (lowest role).
 */
export function isCustomer(roleLevel: number | undefined): boolean {
	return roleLevel === RoleLevels.Customer
}

/**
 * Get role display name from role level.
 */
export function getRoleDisplayName(roleLevel: number | undefined): string {
	if (roleLevel === undefined) return 'Unknown'
	return RoleDisplayNames[roleLevel as RoleLevel] || 'Unknown'
}

/**
 * Build a permission string.
 */
export function buildPermission(resource: Resource, action: Action, context?: Context): Permission {
	if (context) {
		return `${resource}:${action}:${context}` as Permission
	}
	return `${resource}:${action}` as Permission
}

