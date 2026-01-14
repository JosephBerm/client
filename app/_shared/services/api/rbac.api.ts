/**
 * RBAC API Module
 *
 * Role-Based Access Control management endpoints.
 * Part of the domain-specific API split for better code organization.
 *
 * **Architecture:**
 * - Types imported from canonical source `@_types/rbac` (DRY compliance)
 * - Re-exports types for convenience via barrel import
 * - API methods use HttpService for consistent auth/error handling
 *
 * @module api/rbac
 */

import type { PagedResult } from '@_classes/Base/PagedResult'
import type {
	RBACOverview,
	PermissionMatrixEntry,
	PermissionAuditEntryDto,
	BulkRoleUpdateRequest,
	BulkRoleUpdateResult,
	UserWithRole,
	AuditLogFilters,
	UsersWithRolesFilters,
} from '@_types/rbac-management'
import type {
	Role,
	PermissionEntity,
	RolePermission,
	RoleThresholds,
	CreateRoleRequest,
	UpdateRoleRequest,
	RoleDeleteResult,
	CreatePermissionRequest,
	UpdatePermissionRequest,
	UserPermissionsResponse,
} from '@_types/rbac'

import { HttpService } from '../httpService'

// =========================================================================
// RE-EXPORTS FROM CANONICAL SOURCE (@_types/rbac)
// These are re-exported for convenience. Import from here or @_types/rbac.
// =========================================================================

export type {
	Role,
	PermissionEntity,
	RolePermission,
	RoleThresholds,
	CreateRoleRequest,
	UpdateRoleRequest,
	RoleDeleteResult,
	CreatePermissionRequest,
	UpdatePermissionRequest,
	UserPermissionsResponse,
} from '@_types/rbac'

/**
 * @deprecated Use `PermissionEntity` instead. This alias exists for backward compatibility.
 * The name `Permission` conflicts with the permission string type in @_types/rbac.
 */
export type Permission = PermissionEntity

// =========================================================================
// ROLES API
// =========================================================================

/**
 * Roles Management API
 */
export const RolesApi = {
	/**
	 * Gets all roles.
	 */
	getAll: async () => HttpService.get<Role[]>('/rbac/roles'),

	/**
	 * Gets a single role by ID.
	 */
	get: async (id: number) => HttpService.get<Role>(`/rbac/roles/${id}`),

	/**
	 * Creates a new role.
	 */
	create: async (role: CreateRoleRequest) => HttpService.post<Role>('/rbac/roles', role),

	/**
	 * Updates an existing role.
	 */
	update: async (id: number, role: UpdateRoleRequest) => HttpService.put<Role>(`/rbac/roles/${id}`, role),

	/**
	 * Deletes a role if no users are assigned.
	 */
	delete: async (id: number) => HttpService.delete<RoleDeleteResult>(`/rbac/roles/${id}`),

	/**
	 * Gets all permissions assigned to a role.
	 */
	getPermissions: async (roleId: number) => HttpService.get<PermissionEntity[]>(`/rbac/roles/${roleId}/permissions`),

	/**
	 * Assigns a permission to a role.
	 */
	assignPermission: async (roleId: number, permissionId: number) =>
		HttpService.post<boolean>(`/rbac/roles/${roleId}/permissions/${permissionId}`, null),

	/**
	 * Removes a permission from a role.
	 */
	removePermission: async (roleId: number, permissionId: number) =>
		HttpService.delete<boolean>(`/rbac/roles/${roleId}/permissions/${permissionId}`),

	/**
	 * Bulk assigns multiple permissions to a role (replaces existing).
	 */
	bulkAssignPermissions: async (roleId: number, permissionIds: number[]) =>
		HttpService.put<boolean>(`/rbac/roles/${roleId}/permissions`, { permissionIds }),
}

// =========================================================================
// PERMISSIONS API
// =========================================================================

/**
 * Permissions Management API
 */
export const PermissionsApi = {
	/**
	 * Gets all permissions.
	 */
	getAll: async () => HttpService.get<PermissionEntity[]>('/rbac/permissions'),

	/**
	 * Gets a single permission by ID.
	 */
	get: async (id: number) => HttpService.get<PermissionEntity>(`/rbac/permissions/${id}`),

	/**
	 * Creates a new permission.
	 */
	create: async (permission: CreatePermissionRequest) =>
		HttpService.post<PermissionEntity>('/rbac/permissions', permission),

	/**
	 * Updates an existing permission.
	 */
	update: async (id: number, permission: UpdatePermissionRequest) =>
		HttpService.put<PermissionEntity>(`/rbac/permissions/${id}`, permission),

	/**
	 * Deletes a permission.
	 */
	delete: async (id: number) => HttpService.delete<boolean>(`/rbac/permissions/${id}`),
}

// =========================================================================
// RBAC API
// =========================================================================

/**
 * RBAC Management API
 * Role-Based Access Control management endpoints.
 *
 * @see prd_rbac_management.md
 */
export const RBACApi = {
	/**
	 * Gets RBAC overview including roles, permissions, and matrix.
	 */
	getOverview: async () => HttpService.get<RBACOverview>('/rbac/overview'),

	/**
	 * Gets permission matrix (feature x role).
	 */
	getMatrix: async () => HttpService.get<PermissionMatrixEntry[]>('/rbac/matrix'),

	/**
	 * Gets permission audit log with pagination and filtering.
	 */
	getAuditLog: async (filters: AuditLogFilters = {}) => {
		const params = new URLSearchParams()
		if (filters.page) params.append('page', String(filters.page))
		if (filters.pageSize) params.append('pageSize', String(filters.pageSize))
		if (filters.startDate) params.append('startDate', filters.startDate)
		if (filters.endDate) params.append('endDate', filters.endDate)
		if (filters.userId) params.append('userId', String(filters.userId))
		if (filters.resource) params.append('resource', filters.resource)
		const query = params.toString()
		return HttpService.get<PagedResult<PermissionAuditEntryDto>>(`/rbac/audit${query ? `?${query}` : ''}`)
	},

	/**
	 * Bulk updates user roles.
	 */
	bulkUpdateRoles: async (request: BulkRoleUpdateRequest) =>
		HttpService.post<BulkRoleUpdateResult>('/rbac/bulk-role', request),

	/**
	 * Gets users with their roles for RBAC management.
	 */
	getUsersWithRoles: async (filters: UsersWithRolesFilters = {}) => {
		const params = new URLSearchParams()
		if (filters.page) params.append('page', String(filters.page))
		if (filters.pageSize) params.append('pageSize', String(filters.pageSize))
		if (filters.roleFilter !== undefined) params.append('roleFilter', String(filters.roleFilter))
		if (filters.search) params.append('search', filters.search)
		const query = params.toString()
		return HttpService.get<PagedResult<UserWithRole>>(`/rbac/users${query ? `?${query}` : ''}`)
	},

	/**
	 * Gets role level thresholds from configuration.
	 */
	getThresholds: async () => HttpService.get<RoleThresholds>('/rbac/roles/thresholds'),

	/**
	 * Gets the current user's permissions from database.
	 */
	getMyPermissions: async () => HttpService.get<UserPermissionsResponse>('/rbac/my-permissions'),

	/**
	 * Roles Management
	 */
	Roles: RolesApi,

	/**
	 * Permissions Management
	 */
	Permissions: PermissionsApi,
}
