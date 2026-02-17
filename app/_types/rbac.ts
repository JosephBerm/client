/**
 * RBAC Types - Fully Dynamic Version
 *
 * ARCHITECTURE: Role levels are NOT hardcoded here.
 * They are fetched from the API at runtime via usePermissions() hook.
 *
 * This enables white-label deployments to have completely
 * different roles without any code changes.
 *
 * For role level constants and display helpers, use:
 * @see @_shared/constants - RoleLevels, getRoleDisplayName, etc.
 * @see @_shared/hooks/usePermissions - Role checking hook
 *
 * @see server/Classes/RBAC/RBACConstants.cs - Backend constants
 * @see server/Services/RBAC/RoleService.cs - Role queries
 * @module rbac
 */

// =========================================================================
// RE-EXPORTS FROM CANONICAL SOURCE (@_shared)
// These are re-exported for backward compatibility.
// New code should import directly from '@_shared'.
// =========================================================================

export {
	RoleLevels,
	type RoleLevelKey,
	type RoleLevelValue,
	getRoleDisplayName,
	DEFAULT_ROLE_METADATA,
} from '../_shared/constants/rbac-defaults'

// =========================================================================
// API RESPONSE TYPES
// =========================================================================

// =========================================================================
// ROLE & PERMISSION ENTITIES
// These are the canonical types for database entities.
// Matches backend DTOs in RBACManagementDTOs.cs
// =========================================================================

/**
 * Role entity from database.
 * Fetched via GET /rbac/roles
 *
 * @remarks
 * This is the canonical Role type. All RBAC components should import from here.
 * The API module re-exports this type for convenience.
 */
export interface Role {
	id: number
	name: string
	displayName: string
	level: number
	description?: string
	isSystemRole: boolean
	createdAt: string
	updatedAt: string
	/** Optional: Populated when fetching role with permissions */
	rolePermissions?: RolePermission[]
}

/**
 * Permission entity from database.
 * Fetched via GET /rbac/permissions
 *
 * @remarks
 * Named `PermissionEntity` to avoid collision with `Permission` string type below.
 * The `Permission` type is for permission strings like "orders:read:own".
 */
export interface PermissionEntity {
	id: number
	resource: string
	action: string
	context?: string
	description?: string
	/** Computed field: "resource:action" or "resource:action:context" */
	permissionString?: string
	/** Optional: Populated when fetching permission with roles */
	rolePermissions?: RolePermission[]
}

/**
 * Join table entity for Role-Permission relationship.
 * Used when fetching roles with their permissions or vice versa.
 */
export interface RolePermission {
	roleId: number
	permissionId: number
	role?: Role
	permission?: PermissionEntity
}

/**
 * Role thresholds for level-based checks.
 * Fetched via GET /rbac/roles/thresholds
 *
 * WHITE-LABEL: All values are configurable via backend appsettings.json.
 * No code changes needed for custom role structures.
 *
 * @remarks
 * This is the canonical type for role thresholds API response.
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

// =========================================================================
// ROLE CRUD REQUEST TYPES
// =========================================================================

/**
 * Request body for creating a new role.
 * POST /rbac/roles
 */
export interface CreateRoleRequest {
	name: string
	displayName: string
	level: number
	description?: string
	isSystemRole?: boolean
}

/**
 * Request body for updating an existing role.
 * PUT /rbac/roles/:id
 */
export interface UpdateRoleRequest {
	name: string
	displayName: string
	level: number
	description?: string
	isSystemRole?: boolean
}

/**
 * Result of attempting to delete a role.
 * DELETE /rbac/roles/:id
 */
export interface RoleDeleteResult {
	deleted: boolean
	blockedByUsers: boolean
	assignedUserCount: number
	message?: string
}

// =========================================================================
// PERMISSION CRUD REQUEST TYPES
// =========================================================================

/**
 * Request body for creating a new permission.
 * POST /rbac/permissions
 */
export interface CreatePermissionRequest {
	resource: string
	action: string
	context?: string
	description?: string
}

/**
 * Request body for updating an existing permission.
 * PUT /rbac/permissions/:id
 */
export interface UpdatePermissionRequest {
	resource: string
	action: string
	context?: string
	description?: string
}

/**
 * User permissions response from GET /rbac/my-permissions
 */
export interface UserPermissionsResponse {
	userId: number
	roleLevel: number
	roleName: string
	permissions: string[]
}

// =========================================================================
// PERMISSION CONSTANTS
// These map directly to backend enum values and must stay in sync.
// =========================================================================

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
	Integrations: 'integrations',
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
 *
 * @param resource - Resource name (e.g., 'orders')
 * @param action - Action name (e.g., 'read')
 * @param context - Optional context scope (e.g., 'own')
 * @returns Formatted permission string
 *
 * @example
 * ```typescript
 * buildPermission(Resources.Orders, Actions.Read, Contexts.Own)
 * // Returns: 'orders:read:own'
 * ```
 */
export function buildPermission(resource: Resource, action: Action, context?: Context): Permission {
	if (context) {
		return `${resource}:${action}:${context}` as Permission
	}
	return `${resource}:${action}` as Permission
}
