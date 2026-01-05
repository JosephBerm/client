/**
 * RBAC Management Page
 *
 * Admin/Sales Manager interface for viewing and managing roles and permissions.
 * Sales Managers can view (read-only), Admins can modify.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This component follows Next.js 16 best practices:
 *
 * 1. **React Compiler** (`reactCompiler: true` in next.config.mjs):
 *    - Automatic memoization - manual useCallback/useMemo NOT required
 *    - Compiler analyzes code and applies optimizations automatically
 *    - Only use useCallback when explicitly passing to memo'd components
 *
 * 2. **Cache Components** (`cacheComponents: true`):
 *    - Server-side caching via `use cache` directive (not applicable here)
 *    - Client components use SWR-pattern via useFetchWithCache
 *
 * 3. **Component Composition**:
 *    - Page acts as orchestrator only
 *    - All UI logic delegated to child components
 *    - Clean separation of concerns
 *
 * 4. **Generic Tabs Component**:
 *    - Uses consolidated Tabs component from @_components/ui/Tabs
 *    - DRY principle - same component used across app
 *    - Animated sliding indicator and mobile scroll support
 *
 * Component Hierarchy:
 * - RBACManagementPage (this file)
 *   ├── AccessDenied (if unauthorized)
 *   ├── InternalPageHeader + RBACPageActions
 *   ├── RBACErrorAlert (if error)
 *   ├── RBACStatsCards (overview stats)
 *   ├── Tabs (generic tabs with TabPanel content)
 *   │   ├── TabPanel: RoleHierarchyDiagram
 *   │   ├── TabPanel: PermissionMatrix
 *   │   ├── TabPanel: AuditLogRichDataGrid (admin only)
 *   │   └── TabPanel: UserRolesRichDataGrid (admin only)
 *   └── BulkRoleModal (modal overlay)
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @see prd_rbac_management.md
 * @module app/rbac/page
 */

'use client'

import { useState } from 'react'

import { Shield, Table, History, UserCog } from 'lucide-react'

import { Tabs, TabsList, Tab, TabPanel } from '@_components/ui/Tabs'

import { InternalPageHeader } from '../_components'

import {
	// Page composition
	AccessDenied,
	RBACStatsCards,
	RBACPageActions,
	RBACErrorAlert,
	BulkRoleModal,
	// Feature components
	RoleHierarchyDiagram,
	PermissionMatrix,
	AuditLogRichDataGrid,
	UserRolesRichDataGrid,
	// Hook
	useRBACManagement,
	// Types (keep for type safety)
	type RBACTabId,
} from './_components'

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * RBAC Management Page
 *
 * Note: With React Compiler enabled, manual useCallback is NOT needed for:
 * - Simple state setters (setActiveTab, setShowBulkModal)
 * - Inline arrow functions passed to child components
 *
 * The compiler automatically memoizes functions when beneficial.
 */
export default function RBACManagementPage() {
	// ---------------------------------------------------------------------------
	// STATE & HOOKS
	// ---------------------------------------------------------------------------

	const [activeTab, setActiveTab] = useState<RBACTabId>('hierarchy')
	const [showBulkModal, setShowBulkModal] = useState(false)

	const {
		// Data
		overview,
		matrix,
		auditLog,
		users,

		// Loading states
		isLoadingOverview,
		isLoadingAuditLog,
		isLoadingUsers,

		// Error states
		overviewError,
		auditLogError,
		usersError,

		// Permissions
		canView,
		canEdit,
		canViewAuditLogs,

		// Actions
		refreshOverview,
		fetchAuditLog,
		fetchUsers,
		bulkUpdateRoles,

		// Filters
		auditLogFilters,
		setAuditLogFilters,
	} = useRBACManagement()

	// ---------------------------------------------------------------------------
	// HANDLERS
	// React Compiler auto-memoizes these - no manual useCallback needed
	// ---------------------------------------------------------------------------

	/**
	 * Handle tab change with lazy loading for admin tabs
	 */
	const handleTabChange = (tabId: string) => {
		const newTab = tabId as RBACTabId
		setActiveTab(newTab)

		// Lazy load data for admin-only tabs
		if (newTab === 'audit' && canViewAuditLogs && !auditLog) {
			void fetchAuditLog()
		}
		if (newTab === 'users' && canEdit && !users) {
			void fetchUsers()
		}
	}

	/**
	 * Open bulk update modal
	 */
	const handleOpenBulkModal = () => {
		setShowBulkModal(true)
	}

	/**
	 * Close bulk update modal
	 */
	const handleCloseBulkModal = () => {
		setShowBulkModal(false)
	}

	// ---------------------------------------------------------------------------
	// RENDER: ACCESS DENIED
	// ---------------------------------------------------------------------------

	if (!canView) {
		return (
			<AccessDenied
				title="Access Denied"
				description="You do not have permission to view this page."
				heading="Sales Manager Access Required"
				message="You need to be a Sales Manager or higher to access the RBAC management page."
				showBackButton
			/>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: MAIN PAGE
	// ---------------------------------------------------------------------------

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="RBAC Management"
				description="Manage roles, permissions, and user access levels"
				loading={isLoadingOverview}
				actions={
					<RBACPageActions
						canEdit={canEdit}
						isLoading={isLoadingOverview}
						onBulkUpdate={handleOpenBulkModal}
						onRefresh={refreshOverview}
					/>
				}
			/>

			{/* Error Alert */}
			{overviewError && <RBACErrorAlert message={overviewError} />}

			{/* Stats Cards */}
			{overview && <RBACStatsCards overview={overview} />}

			{/* Tab Navigation - Using Generic Tabs Component */}
			<Tabs value={activeTab} onValueChange={handleTabChange} variant="bordered">
				<TabsList className="mb-6">
					<Tab value="hierarchy" icon={<Shield className="h-4 w-4" />}>
						Role Hierarchy
					</Tab>
					<Tab value="matrix" icon={<Table className="h-4 w-4" />}>
						Permission Matrix
					</Tab>
					<Tab
						value="audit"
						icon={<History className="h-4 w-4" />}
						badge="Admin"
						badgeVariant="admin"
						hidden={!canViewAuditLogs}
					>
						Audit Log
					</Tab>
					<Tab
						value="users"
						icon={<UserCog className="h-4 w-4" />}
						badge="Admin"
						badgeVariant="admin"
						hidden={!canEdit}
					>
						User Roles
					</Tab>
				</TabsList>

				{/* Role Hierarchy Tab */}
				<TabPanel value="hierarchy">
					{overview && <RoleHierarchyDiagram roles={overview.roles} />}
				</TabPanel>

				{/* Permission Matrix Tab */}
				<TabPanel value="matrix">
					{overview && <PermissionMatrix matrix={matrix} roles={overview.roles} canEdit={canEdit} />}
				</TabPanel>

				{/* Audit Log Tab (Admin Only) */}
				<TabPanel value="audit">
					{canViewAuditLogs && <AuditLogRichDataGrid canView={canViewAuditLogs} />}
				</TabPanel>

				{/* User Roles Tab (Admin Only) */}
				<TabPanel value="users">
					{canEdit && <UserRolesRichDataGrid onBulkUpdate={handleOpenBulkModal} canEdit={canEdit} />}
				</TabPanel>
			</Tabs>

			{/* Bulk Role Update Modal */}
			<BulkRoleModal
				isOpen={showBulkModal}
				onClose={handleCloseBulkModal}
				users={users}
				isLoadingUsers={isLoadingUsers}
				onBulkUpdate={bulkUpdateRoles}
				onLoadUsers={fetchUsers}
			/>
		</>
	)
}
