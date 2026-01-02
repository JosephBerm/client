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
// BACKWARD COMPATIBILITY EXPORTS
// These are deprecated but maintained to prevent breaking changes.
// New code should use usePermissions() hook or DEFAULT_ROLE_THRESHOLDS.
//
// ⚠️  DRY EXCEPTION: Values duplicated here intentionally.
// This file must remain import-free to avoid circular dependencies.
// SYNC REQUIRED: If values change, also update:
//   - @_shared/constants/rbac-defaults.ts (DEFAULT_ROLE_THRESHOLDS)
//   - @_classes/Enums.ts (AccountRole)
//   - server/appsettings.json (RBAC:Thresholds)
// =========================================================================

/**
 * @deprecated Use `number` type directly. Role levels are dynamic integers.
 * Migration: Replace `RoleLevel` with `number`
 */
export type RoleLevel = number

/**
 * @deprecated Use DEFAULT_ROLE_THRESHOLDS from '@_shared/constants' instead.
 * Migration: import { DEFAULT_ROLE_THRESHOLDS } from '@_shared/constants'
 *
 * These are FALLBACK values - actual values come from API.
 */
export const RoleLevels = {
	Customer: 1000,
	FulfillmentCoordinator: 2000,
	SalesRep: 3000,
	SalesManager: 4000,
	Admin: 5000,
	SuperAdmin: 9999,
} as const

/**
 * @deprecated Use getRoleDisplayName() from '@_shared/constants' instead.
 * Migration: import { getRoleDisplayName } from '@_shared/constants'
 */
export const RoleDisplayNames: Record<number, string> = {
	[RoleLevels.Customer]: 'Customer',
	[RoleLevels.FulfillmentCoordinator]: 'Fulfillment Coordinator',
	[RoleLevels.SalesRep]: 'Sales Representative',
	[RoleLevels.SalesManager]: 'Sales Manager',
	[RoleLevels.Admin]: 'Administrator',
	[RoleLevels.SuperAdmin]: 'Super Administrator',
}

/**
 * @deprecated Use DEFAULT_ROLE_METADATA[level].name from '@_shared/constants' instead.
 */
export const RoleNames: Record<number, string> = {
	[RoleLevels.Customer]: 'customer',
	[RoleLevels.FulfillmentCoordinator]: 'fulfillment_coordinator',
	[RoleLevels.SalesRep]: 'sales_rep',
	[RoleLevels.SalesManager]: 'sales_manager',
	[RoleLevels.Admin]: 'admin',
	[RoleLevels.SuperAdmin]: 'super_admin',
}

/**
 * @deprecated For test backward compatibility only.
 * Reverse lookup: gets role name key from role level value.
 * Example: getRoleLevelName(1000) returns 'Customer'
 */
export const RoleLevelNames: Record<number, string> = {
	[RoleLevels.Customer]: 'Customer',
	[RoleLevels.FulfillmentCoordinator]: 'FulfillmentCoordinator',
	[RoleLevels.SalesRep]: 'SalesRep',
	[RoleLevels.SalesManager]: 'SalesManager',
	[RoleLevels.Admin]: 'Admin',
	[RoleLevels.SuperAdmin]: 'SuperAdmin',
}

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

// =========================================================================
// DEPRECATED HELPER FUNCTIONS
// Maintained for backward compatibility. Use usePermissions() hook instead.
// =========================================================================

/**
 * @deprecated Use `string` type directly. Role names are dynamic strings.
 */
export type RoleName = string

/**
 * @deprecated Use getRoleDisplayName() from '@_shared/constants' instead.
 *
 * ⚠️  DRY EXCEPTION: Duplicated to keep @_types import-free.
 * Implementation MUST match @_shared/constants/rbac-defaults.ts
 */
export function getRoleDisplayName(roleLevel: number | undefined): string {
    if (roleLevel === undefined) return 'Unknown'
    return RoleDisplayNames[roleLevel] ?? `Role ${roleLevel}`
}

/**
 * @deprecated Use usePermissions().hasMinimumRole() instead.
 */
export function hasMinimumRole(userRoleLevel: number | undefined, minimumLevel: number): boolean {
    if (userRoleLevel === undefined) return false
    return userRoleLevel >= minimumLevel
}

/**
 * @deprecated Use usePermissions().isAdmin instead.
 */
export function isAdmin(roleLevel: number | undefined): boolean {
    if (roleLevel === undefined) return false
    return roleLevel >= RoleLevels.Admin
}

/**
 * @deprecated Use usePermissions().isSalesManagerOrAbove instead.
 */
export function isSalesManagerOrAbove(roleLevel: number | undefined): boolean {
    if (roleLevel === undefined) return false
    return roleLevel >= RoleLevels.SalesManager
}

/**
 * @deprecated Use usePermissions().isSalesRepOrAbove instead.
 */
export function isSalesRepOrAbove(roleLevel: number | undefined): boolean {
    if (roleLevel === undefined) return false
    return roleLevel >= RoleLevels.SalesRep
}

/**
 * @deprecated Use usePermissions().isCustomer instead.
 */
export function isCustomer(roleLevel: number | undefined): boolean {
    if (roleLevel === undefined) return false
    return roleLevel === RoleLevels.Customer
}
