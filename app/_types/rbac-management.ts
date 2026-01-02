/**
 * RBAC Management Types
 *
 * TypeScript types for the RBAC Management UI feature.
 * Mirrors backend DTOs in RBACManagementDTOs.cs
 *
 * @see prd_rbac_management.md
 * @module RBAC Management
 */

import type { AccountRoleType } from '@_classes/Enums'

// =========================================================================
// ROLE DEFINITION (Enhanced for UI)
// =========================================================================

/**
 * Role definition with additional UI-friendly fields.
 * Used by RoleHierarchyDiagram component.
 */
export interface RoleDefinitionDto {
	id: number
	role: AccountRoleType
	name: string
	displayName: string
	description: string
	level: number
	isSystemRole: boolean
	userCount: number
	permissions: string[]
}

// =========================================================================
// PERMISSION DEFINITION (Enhanced for UI)
// =========================================================================

/**
 * Permission definition for UI display.
 * Used by PermissionMatrix component.
 */
export interface PermissionDefinitionDto {
	id: number
	resource: string
	action: string
	context: string | null
	description: string
	permissionString: string
}

// =========================================================================
// PERMISSION MATRIX
// =========================================================================

/**
 * Single row in the permission matrix (feature x roles).
 * Used by PermissionMatrix component.
 */
export interface PermissionMatrixEntry {
	resource: string
	action: string
	context: string | null
	description: string
	/** Role access dictionary: { roleLevel: hasAccess } */
	roleAccess: Record<number, boolean>
}

// =========================================================================
// ROLE DISTRIBUTION STATS
// =========================================================================

/**
 * User distribution across roles.
 */
export interface RoleDistributionStats {
	totalUsers: number
	countByRole: Record<number, number>
}

// =========================================================================
// RBAC OVERVIEW (Combined view)
// =========================================================================

/**
 * Complete RBAC overview for management UI.
 * Combines roles, permissions, and matrix in one response.
 */
export interface RBACOverview {
	roles: RoleDefinitionDto[]
	permissions: PermissionDefinitionDto[]
	matrix: PermissionMatrixEntry[]
	userStats: RoleDistributionStats
}

// =========================================================================
// PERMISSION AUDIT LOG (Enhanced for UI)
// =========================================================================

/**
 * Permission audit log entry for UI display.
 * Shows who changed what permission when.
 */
export interface PermissionAuditEntryDto {
	id: number
	timestamp: string
	userId: number | null
	userName: string
	userEmail: string
	resource: string
	action: string
	resourceId: number | null
	allowed: boolean
	reason: string | null
	ipAddress: string | null
}

// =========================================================================
// BULK ROLE UPDATE
// =========================================================================

/**
 * Request to bulk update user roles.
 */
export interface BulkRoleUpdateRequest {
	/** List of user IDs to update */
	userIds: number[]
	/** New role to assign (AccountRole value) */
	newRole: AccountRoleType
	/** Optional reason for the change (for audit) */
	reason?: string
}

/**
 * Result of bulk role update operation.
 */
export interface BulkRoleUpdateResult {
	updatedCount: number
	failedCount: number
	failures: BulkRoleUpdateFailure[]
}

/**
 * Details of a failed role update in bulk operation.
 */
export interface BulkRoleUpdateFailure {
	userId: number
	reason: string
}

// =========================================================================
// USER WITH ROLE (For user list in RBAC UI)
// =========================================================================

/**
 * Simplified user model for RBAC management UI.
 */
export interface UserWithRole {
	id: number
	username: string
	email: string
	fullName: string
	role: AccountRoleType
	roleDisplayName: string
	lastLoginAt: string | null
	isActive: boolean
}

// =========================================================================
// FILTER TYPES
// =========================================================================

/**
 * Filters for audit log query.
 */
export interface AuditLogFilters {
	page?: number
	pageSize?: number
	startDate?: string
	endDate?: string
	userId?: number
	resource?: string
}

/**
 * Filters for users with roles query.
 */
export interface UsersWithRolesFilters {
	page?: number
	pageSize?: number
	roleFilter?: AccountRoleType
	search?: string
}

