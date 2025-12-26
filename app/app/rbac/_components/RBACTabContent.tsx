/**
 * RBACTabContent Component
 *
 * Renders the appropriate content based on the active tab.
 * Handles lazy loading of admin-only tab data.
 *
 * Architecture: Container component that coordinates tab content rendering.
 *
 * @see prd_rbac_management.md
 * @module app/rbac/_components/RBACTabContent
 */

'use client'

import type { RBACTabId } from './RBACTabNav'
import { RoleHierarchyDiagram } from './RoleHierarchyDiagram'
import { PermissionMatrix } from './PermissionMatrix'
import { AuditLogDataGrid } from './AuditLogDataGrid'
import { UserRolesTable } from './UserRolesTable'

import type { RBACOverview, PermissionMatrixEntry, PermissionAuditEntryDto, UserWithRole, AuditLogFilters } from '@_types/rbac-management'
import type { PagedResult } from '@_classes/Base/PagedResult'

// =========================================================================
// TYPES
// =========================================================================

interface RBACTabContentProps {
	/** Currently active tab */
	activeTab: RBACTabId

	// Data
	overview: RBACOverview | null
	matrix: PermissionMatrixEntry[]
	auditLog: PagedResult<PermissionAuditEntryDto> | null
	users: PagedResult<UserWithRole> | null

	// Loading states
	isLoadingAuditLog: boolean
	isLoadingUsers: boolean

	// Errors
	auditLogError: string | null
	usersError: string | null

	// Permissions
	canEdit: boolean
	canViewAuditLogs: boolean

	// Filters
	auditLogFilters: AuditLogFilters

	// Callbacks
	onAuditLogFiltersChange: (filters: AuditLogFilters) => void
	onRefreshAuditLog: () => void
	onOpenBulkModal: () => void
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * RBAC Tab Content Renderer
 *
 * Renders the appropriate component based on active tab:
 * - hierarchy: RoleHierarchyDiagram
 * - matrix: PermissionMatrix
 * - audit: AuditLogDataGrid (admin only)
 * - users: UserRolesTable (admin only)
 */
export function RBACTabContent({
	activeTab,
	overview,
	matrix,
	auditLog,
	users,
	isLoadingAuditLog,
	isLoadingUsers,
	auditLogError,
	usersError,
	canEdit,
	canViewAuditLogs,
	auditLogFilters,
	onAuditLogFiltersChange,
	onRefreshAuditLog,
	onOpenBulkModal,
}: RBACTabContentProps) {
	return (
		<div className="space-y-6">
			{/* Role Hierarchy Tab */}
			{activeTab === 'hierarchy' && overview && (
				<RoleHierarchyDiagram roles={overview.roles} />
			)}

			{/* Permission Matrix Tab */}
			{activeTab === 'matrix' && overview && (
				<PermissionMatrix
					matrix={matrix}
					roles={overview.roles}
					canEdit={canEdit}
				/>
			)}

			{/* Audit Log Tab (Admin Only) */}
			{activeTab === 'audit' && canViewAuditLogs && (
				<AuditLogDataGrid
					data={auditLog}
					isLoading={isLoadingAuditLog}
					error={auditLogError}
					filters={auditLogFilters}
					onFiltersChange={onAuditLogFiltersChange}
					onRefresh={onRefreshAuditLog}
				/>
			)}

			{/* User Roles Tab (Admin Only) */}
			{activeTab === 'users' && canEdit && (
				<UserRolesTable
					users={users}
					isLoading={isLoadingUsers}
					error={usersError}
					onBulkUpdate={onOpenBulkModal}
				/>
			)}
		</div>
	)
}

export default RBACTabContent

