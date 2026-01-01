/**
 * RBAC Types - Fully Dynamic Version
 *
 * ARCHITECTURE: Role levels are NOT hardcoded here.
 * They are fetched from the API at runtime.
 *
 * This enables white-label deployments to have completely
 * different roles without any code changes.
 *
 * @see server/Classes/RBAC/RBACConstants.cs - Backend constants
 * @see server/Services/RBAC/RoleService.cs - Role queries
 * @module rbac
 */

// =========================================================================
// REMOVED: RoleLevels, RoleNames, RoleDisplayNames
// These are now fetched from API. Use useRoles() or usePermissions() hooks.
// =========================================================================

/**
 * Role entity from database.
 * Fetched via GET /api/rbac/roles
 */
export interface Role {
    id: number
    name: string
    displayName: string
    level: number
    description: string
    isSystemRole: boolean
    createdAt: string
    updatedAt: string
}

/**
 * Role thresholds for level-based checks.
 * Fetched via GET /api/rbac/roles/thresholds
 * 
 * WHITE-LABEL: All values are configurable via backend appsettings.json.
 * No code changes needed for custom role structures.
 */
export interface RoleThresholds {
    /** Level for basic customer role (default: 1000) */
    customerLevel: number
    /** Minimum level for Fulfillment Coordinator (default: 2000) */
    fulfillmentCoordinatorThreshold: number
    /** Minimum level for Sales Rep (default: 3000) */
    salesRepThreshold: number
    /** Minimum level for Sales Manager (default: 4000) */
    salesManagerThreshold: number
    /** Minimum level for Admin (default: 5000) */
    adminThreshold: number
    /** Minimum level for Super Admin (default: 9999) */
    superAdminThreshold: number
}

/**
 * Resource names for permission checks.
 * These remain as constants because they map to code entities.
 * 
 * MUST match server/Classes/RBAC/RBACConstants.Resources
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
    Rbac: 'rbac',
} as const

export type Resource = (typeof Resources)[keyof typeof Resources]

/**
 * Action names for permission checks.
 * MUST match server/Classes/RBAC/RBACConstants.Actions
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
} as const

export type Action = (typeof Actions)[keyof typeof Actions]

/**
 * Context scopes for permission checks.
 * MUST match server/Classes/RBAC/RBACConstants.Contexts
 */
export const Contexts = {
    Own: 'own',
    Assigned: 'assigned',
    Team: 'team',
    All: 'all',
} as const

export type Context = (typeof Contexts)[keyof typeof Contexts]

/**
 * Permission string format: "resource:action" or "resource:action:context"
 */
export type Permission = `${Resource}:${Action}` | `${Resource}:${Action}:${Context}`

/**
 * Build a permission string.
 */
export function buildPermission(resource: Resource, action: Action, context?: Context): Permission {
    if (context) {
        return `${resource}:${action}:${context}` as Permission
    }
    return `${resource}:${action}` as Permission
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS (Deprecated)
// ============================================================================

/**
 * @deprecated Use numeric role levels directly or usePermissions() hook.
 * Role levels are now fetched from API. This is a type alias for backward compatibility.
 */
export type RoleLevel = number

/**
 * @deprecated Use DEFAULT_ROLE_THRESHOLDS from @_shared/constants or fetch from API.
 * Re-exported from @_shared/constants for backward compatibility.
 */
export { LEGACY_ROLE_LEVELS as RoleLevels } from '@_shared/constants'

/**
 * @deprecated Use DEFAULT_ROLE_METADATA from @_shared/constants or fetch roles from API.
 * Re-exported from @_shared/constants for backward compatibility.
 */
export { DEFAULT_ROLE_METADATA } from '@_shared/constants'

/**
 * @deprecated Use getRoleDisplayName from @_shared/constants.
 * Re-exported for backward compatibility.
 */
export { getRoleDisplayName } from '@_shared/constants'

/**
 * @deprecated Role names are now fetched from API. Use useRoles() hook.
 * This is a backward compatibility export that maps to DEFAULT_ROLE_METADATA.
 */
export const RoleNames = {
    Customer: 'customer',
    FulfillmentCoordinator: 'fulfillment_coordinator',
    SalesRep: 'sales_rep',
    SalesManager: 'sales_manager',
    Admin: 'admin',
    SuperAdmin: 'super_admin',
} as const

/**
 * @deprecated Role display names are now fetched from API. Use useRoles() hook.
 * This is a backward compatibility export that maps to DEFAULT_ROLE_METADATA.
 */
import { getRoleDisplayName } from '@_shared/constants'
import { LEGACY_ROLE_LEVELS } from '@_shared/constants'

const RoleDisplayNamesBase = {
    Customer: 'Customer',
    FulfillmentCoordinator: 'Fulfillment Coordinator',
    SalesRep: 'Sales Representative',
    SalesManager: 'Sales Manager',
    Admin: 'Administrator',
    SuperAdmin: 'Super Administrator',
} as const

// Create a Proxy that supports both string keys (RoleDisplayNames.Customer) and numeric keys (RoleDisplayNames[1000])
export const RoleDisplayNames = new Proxy(RoleDisplayNamesBase, {
	get(target, prop) {
		// If prop is a number (as string), use getRoleDisplayName helper
		if (typeof prop === 'string' && /^\d+$/.test(prop)) {
			const level = Number(prop)
			return getRoleDisplayName(level)
		}
		// Otherwise, use normal property access
		return Reflect.get(target, prop)
	},
}) as typeof RoleDisplayNamesBase & { [key: number]: string }

/**
 * @deprecated Role names are now fetched from API. Use useRoles() hook.
 */
export type RoleName = string

// ============================================================================
// BACKWARD COMPATIBILITY HELPER FUNCTIONS (Deprecated)
// ============================================================================

import { DEFAULT_ROLE_THRESHOLDS } from '@_shared/constants'

/**
 * @deprecated Use usePermissions() hook instead.
 * Check if a role level meets the minimum required level.
 */
export function hasMinimumRole(userLevel: number | undefined, minimumLevel: number): boolean {
	if (userLevel === undefined) return false
	return userLevel >= minimumLevel
}

/**
 * @deprecated Use usePermissions() hook instead.
 * Check if a role level is Admin or higher.
 */
export function isAdmin(roleLevel: number | undefined): boolean {
	if (roleLevel === undefined) return false
	return roleLevel >= DEFAULT_ROLE_THRESHOLDS.adminThreshold
}

/**
 * @deprecated Use usePermissions() hook instead.
 * Check if a role level is SalesManager or higher.
 */
export function isSalesManagerOrAbove(roleLevel: number | undefined): boolean {
	if (roleLevel === undefined) return false
	return roleLevel >= DEFAULT_ROLE_THRESHOLDS.salesManagerThreshold
}

/**
 * @deprecated Use usePermissions() hook instead.
 * Check if a role level is SalesRep or higher.
 */
export function isSalesRepOrAbove(roleLevel: number | undefined): boolean {
	if (roleLevel === undefined) return false
	return roleLevel >= DEFAULT_ROLE_THRESHOLDS.salesRepThreshold
}

/**
 * @deprecated Use usePermissions() hook instead.
 * Check if a role level is exactly Customer level.
 */
export function isCustomer(roleLevel: number | undefined): boolean {
	if (roleLevel === undefined) return false
	return roleLevel === DEFAULT_ROLE_THRESHOLDS.customerLevel
}
