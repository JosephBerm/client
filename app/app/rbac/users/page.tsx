'use client'

/**
 * RBAC User Roles Management Page
 *
 * Dedicated page for viewing and managing user role assignments.
 * Admin-only page with full CRUD operations on user roles.
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
 *
 * 2. **Server-Side Pagination**:
 *    - Uses RichDataGrid with server-side pagination
 *    - Efficient handling of large user datasets
 *
 * 3. **Database-Driven RBAC**:
 *    - All role data is fetched from the database via API
 *    - NO hardcoded role definitions - enables white-label customization
 *
 * **Industry Best Practices (2025-2026):**
 * - User/group role assignment page with inline editing
 * - Role membership changes without multiple navigation steps
 * - Bulk operations for efficient admin workflows
 * - Export functionality for compliance reporting
 * - Real-time search and filtering
 *
 * @see prd_rbac_management.md - US-RBAC-004
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module app/rbac/users/page
 */

import { useState } from 'react'

import Link from 'next/link'

import { ChevronLeft, Info, Shield, Users, AlertCircle, RefreshCw } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../../_components'
import { UserRolesRichDataGrid, BulkRoleModal, useRBACManagement } from '../_components'

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Error state component
 * Displays error message with retry option
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<Card className='border-error/30 bg-error/5 p-8 text-center'>
			<AlertCircle className='mx-auto mb-4 h-12 w-12 text-error' />
			<h3 className='text-lg font-semibold text-error'>Failed to Load Users</h3>
			<p className='mt-2 text-base-content/70'>{message}</p>
			<Button
				variant='outline'
				size='sm'
				onClick={onRetry}
				className='mt-4'
				leftIcon={<RefreshCw className='h-4 w-4' />}>
				Try Again
			</Button>
		</Card>
	)
}

/**
 * Access denied component
 * Shown when user lacks admin privileges
 */
function AccessDeniedState() {
	return (
		<>
			<InternalPageHeader
				title='Access Denied'
				description='Administrator access required.'
			/>
			<Card className='border-error/30 bg-error/5 p-8 text-center'>
				<Shield className='mx-auto mb-4 h-12 w-12 text-error' />
				<h3 className='text-lg font-semibold text-error'>Access Restricted</h3>
				<p className='mt-2 text-base-content/70'>This page is only accessible to administrators.</p>
				<Link
					href={Routes.RBAC.location}
					className='mt-4 inline-block'>
					<Button
						variant='primary'
						size='sm'>
						Back to RBAC
					</Button>
				</Link>
			</Card>
		</>
	)
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

/**
 * RBAC User Roles Management Page
 *
 * Provides a dedicated interface for managing user role assignments.
 * Features:
 * - Server-side paginated user list with roles
 * - Global search across users
 * - Bulk role update modal
 * - CSV export functionality
 * - Mobile-responsive design
 */
export default function RBACUsersPage() {
	const { isAdmin } = usePermissions()
	const [showBulkModal, setShowBulkModal] = useState(false)

	const { users, isLoadingUsers, usersError, fetchUsers, bulkUpdateRoles } = useRBACManagement()

	// ---------------------------------------------------------------------------
	// HANDLERS
	// React Compiler auto-memoizes these - no manual useCallback needed
	// ---------------------------------------------------------------------------

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

	if (!isAdmin) {
		return <AccessDeniedState />
	}

	// ---------------------------------------------------------------------------
	// RENDER: MAIN PAGE
	// ---------------------------------------------------------------------------

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title='User Roles'
				description='View and manage user role assignments'
				loading={isLoadingUsers}
				actions={
					<div className='flex items-center gap-2'>
						<Button
							variant='primary'
							size='sm'
							onClick={handleOpenBulkModal}
							leftIcon={<Users className='h-4 w-4' />}>
							<span className='hidden sm:inline'>Bulk Update</span>
							<span className='sm:hidden'>Bulk</span>
						</Button>
						<Link href={Routes.RBAC.location}>
							<Button
								variant='ghost'
								size='sm'
								leftIcon={<ChevronLeft className='h-4 w-4' />}>
								<span className='hidden sm:inline'>Back to RBAC</span>
								<span className='sm:hidden'>Back</span>
							</Button>
						</Link>
					</div>
				}
			/>

			{/* Info Banner */}
			<Card className='mb-6 border-info/20 bg-info/5'>
				<div className='flex items-start gap-3 p-4'>
					<Info className='mt-0.5 h-5 w-5 shrink-0 text-info' />
					<div>
						<h4 className='font-medium text-info'>User Role Management</h4>
						<p className='mt-1 text-sm text-base-content/70'>
							Manage user role assignments from this page. Use bulk update to change multiple users at
							once. All changes are logged for audit compliance. Higher-level roles inherit permissions
							from lower levels.
						</p>
					</div>
				</div>
			</Card>

			{/* Content */}
			{usersError ? (
				<ErrorState
					message={usersError}
					onRetry={() => void fetchUsers()}
				/>
			) : (
				<UserRolesRichDataGrid
					onBulkUpdate={handleOpenBulkModal}
					canEdit={isAdmin}
				/>
			)}

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
