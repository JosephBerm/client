/**
 * RBAC Management Components Barrel Export
 *
 * Organizes exports into logical groups:
 * 1. Page-level components (main page composition)
 * 2. Feature components (role hierarchy, matrix, etc.)
 * 3. CRUD components (forms, modals)
 * 4. Utility components (loading, error, empty states)
 * 5. Hooks
 *
 * @see prd_rbac_management.md
 * @module app/rbac/_components
 */

// =========================================================================
// PAGE-LEVEL COMPONENTS
// Components used to compose the main RBAC management page
// =========================================================================

export { RBACStatsCards } from './RBACStatsCards'
export { RBACPageActions } from './RBACPageActions'
export { RBACErrorAlert } from './RBACErrorAlert'

// DEPRECATED: Use generic Tabs component from @_components/ui/Tabs instead
// These exports are kept for backward compatibility only
/** @deprecated Use generic Tabs component from @_components/ui/Tabs */
export { RBACTabNav, RBAC_TABS } from './RBACTabNav'
/** @deprecated Use TabPanel from @_components/ui/Tabs */
export { RBACTabContent } from './RBACTabContent'
// Types are still useful for type safety
export type { RBACTabId, RBACTab } from './RBACTabNav'

// =========================================================================
// FEATURE COMPONENTS
// Main feature visualizations and data displays
// =========================================================================

export { RoleHierarchyDiagram } from './RoleHierarchyDiagram'
export { PermissionMatrix } from './PermissionMatrix'
export { BulkRoleModal } from './BulkRoleModal'

// RichDataGrid versions (primary - use these)
export { AuditLogRichDataGrid } from './AuditLogRichDataGrid'
export { UserRolesRichDataGrid } from './UserRolesRichDataGrid'

// Legacy versions (deprecated - use RichDataGrid versions above)
export { AuditLogTable } from './AuditLogTable'
export { AuditLogDataGrid } from './AuditLogDataGrid'
export { UserRolesTable } from './UserRolesTable'
export { UserRolesDataGrid } from './UserRolesDataGrid'

// =========================================================================
// CRUD COMPONENTS
// Forms and modals for create/update/delete operations
// =========================================================================

export { default as RoleCard } from './RoleCard'
export { default as RoleFormModal } from './RoleFormModal'
export { default as RoleDeleteModal } from './RoleDeleteModal'
export { default as RolePermissionsModal } from './RolePermissionsModal'
export { default as PermissionItem } from './PermissionItem'
export { default as PermissionFormModal } from './PermissionFormModal'
export { default as PermissionSelector } from './PermissionSelector'
export { default as PermissionGroup } from './PermissionGroup'
export { default as PermissionBulkBar } from './PermissionBulkBar'
export { default as FormFooter } from './FormFooter'

// =========================================================================
// UTILITY COMPONENTS
// Loading, error, and empty state displays
// =========================================================================

export { default as AccessDenied } from './AccessDenied'
export { default as LoadingState } from './LoadingState'
export { RBACErrorBoundary } from './RBACErrorBoundary'

// =========================================================================
// HOOKS
// Custom hooks for RBAC management
// =========================================================================

export { useRBACManagement } from './hooks'
export type { UseRBACManagementReturn } from './hooks'

// =========================================================================
// CONSTANTS
// Configuration and constant values
// =========================================================================

export {
	CACHE_KEYS,
	CACHE_CONFIG,
	PAGINATION,
	ROLE_HIERARCHY,
	getRoleConfig,
	ANIMATIONS,
	STAT_CARDS,
	ERROR_MESSAGES as RBAC_ERROR_MESSAGES,
	ACCESS_REQUIREMENTS,
} from '../_constants'
