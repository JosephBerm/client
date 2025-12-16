/**
 * RBAC Type Definitions
 * 
 * TypeScript types for Role-Based Access Control system.
 * Matches backend entities in server/Entities/RBAC/
 */

/**
 * Role entity matching backend Role.cs
 */
export interface Role {
  id: number
  name: string
  displayName: string
  level: number
  description?: string | null
  isSystemRole: boolean
  createdAt: string
  updatedAt: string
  rolePermissions?: RolePermission[]
}

/**
 * Permission entity matching backend Permission.cs
 */
export interface Permission {
  id: number
  resource: string
  action: string
  context?: string | null
  description?: string | null
  permissionString?: string
}

/**
 * Role-Permission assignment entity
 */
export interface RolePermission {
  roleId: number
  permissionId: number
  role?: Role
  permission?: Permission
}

/**
 * Request DTOs matching backend RBACRequests.cs
 */
export interface CreateRoleRequest {
  name: string
  displayName: string
  level: number
  description?: string | null
  isSystemRole?: boolean
}

export interface UpdateRoleRequest {
  name: string
  displayName: string
  level: number
  description?: string | null
  isSystemRole?: boolean
}

export interface CreatePermissionRequest {
  resource: string
  action: string
  context?: string | null
  description?: string | null
}

export interface UpdatePermissionRequest {
  resource: string
  action: string
  context?: string | null
  description?: string | null
}

export interface BulkAssignPermissionsRequest {
  permissionIds: number[]
}

/**
 * Common resource types
 */
export type ResourceType = 
  | 'quotes'
  | 'orders'
  | 'products'
  | 'customers'
  | 'vendors'
  | 'analytics'
  | 'users'
  | 'settings'
  | 'rbac'

/**
 * Common action types
 */
export type ActionType = 
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'assign'
  | 'export'
  | 'manage'

/**
 * Context scope types
 */
export type ContextType = 
  | 'own'
  | 'assigned'
  | 'team'
  | 'all'
  | null
