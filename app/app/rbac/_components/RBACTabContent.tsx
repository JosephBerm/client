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
import { AuditLogRichDataGrid } from './AuditLogRichDataGrid'
import { UserRolesRichDataGrid } from './UserRolesRichDataGrid'

import type { RBACOverview, PermissionMatrixEntry } from '@_types/rbac-management'

// =========================================================================
// TYPES
// =========================================================================

interface RBACTabContentProps {
	/** Currently active tab */
	activeTab: RBACTabId

	// Data
	overview: RBACOverview | null
	matrix: PermissionMatrixEntry[]

	// Permissions
	canEdit: boolean
	canViewAuditLogs: boolean

	// Callbacks
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
 * - audit: AuditLogRichDataGrid (admin only) - now uses RichDataGrid
 * - users: UserRolesRichDataGrid (admin only) - now uses RichDataGrid
 */
export function RBACTabContent({
	activeTab,
	overview,
	matrix,
	canEdit,
	canViewAuditLogs,
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

			{/* Audit Log Tab (Admin Only) - Now using RichDataGrid with server-side filtering */}
			{activeTab === 'audit' && canViewAuditLogs && (
				<AuditLogRichDataGrid canView={canViewAuditLogs} />
			)}

			{/* User Roles Tab (Admin Only) - Now using RichDataGrid with server-side filtering */}
			{activeTab === 'users' && canEdit && (
				<UserRolesRichDataGrid
					onBulkUpdate={onOpenBulkModal}
					canEdit={canEdit}
				/>
			)}
		</div>
	)
}

export default RBACTabContent

