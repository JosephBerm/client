/**
 * UserRolesTable Component
 *
 * Wrapper component that provides the legacy API while using the modern UserRolesDataGrid.
 * Maintains backwards compatibility with existing consumers.
 *
 * **DRY Compliance:** Delegates to UserRolesDataGrid for actual implementation.
 *
 * @see prd_rbac_management.md - US-RBAC-004
 * @module app/rbac/_components/UserRolesTable
 */

'use client'

import { Users, RefreshCw, AlertTriangle } from 'lucide-react'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { UserRolesDataGrid } from './UserRolesDataGrid'

import type { UserWithRole } from '@_types/rbac-management'
import type { PagedResult } from '@_classes/Base/PagedResult'

// =========================================================================
// TYPES
// =========================================================================

interface UserRolesTableProps {
	/** Paginated user data */
	users: PagedResult<UserWithRole> | null
	/** Loading state */
	isLoading: boolean
	/** Error message if any */
	error: string | null
	/** Callback to open bulk update modal */
	onBulkUpdate: () => void
}

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

/**
 * Table header section with title and bulk update button
 */
function TableHeader({ onBulkUpdate }: { onBulkUpdate: () => void }) {
	return (
		<div className='mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
			<div>
				<h3 className='text-base sm:text-lg font-semibold text-base-content'>User Roles</h3>
				<p className='text-xs sm:text-sm text-base-content/60'>View and manage user role assignments</p>
			</div>
			<Button
				variant='primary'
				size='sm'
				onClick={onBulkUpdate}
				className='gap-2 w-full sm:w-auto'>
				<Users className='h-4 w-4' />
				Bulk Update
			</Button>
		</div>
	)
}

/**
 * Loading spinner state
 */
function LoadingSpinner() {
	return (
		<div className='flex items-center justify-center py-8 sm:py-12'>
			<RefreshCw className='h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary' />
		</div>
	)
}

/**
 * Error display with message
 */
function ErrorDisplay({ message }: { message: string }) {
	return (
		<div className='flex items-center gap-2 sm:gap-3 rounded-lg border border-error/30 bg-error/10 p-3 sm:p-4 text-error'>
			<AlertTriangle className='h-4 w-4 sm:h-5 sm:w-5 shrink-0' />
			<p className='text-sm'>{message}</p>
		</div>
	)
}

/**
 * Empty state when no users
 */
function EmptyState() {
	return (
		<div className='py-8 sm:py-12 text-center text-base-content/60'>
			<Users className='mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 opacity-50' />
			<p className='text-sm'>No users found</p>
		</div>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

/**
 * User Roles Management Table
 *
 * Displays all users with their roles using the UserRolesDataGrid component.
 * Admin only - used in the "User Roles" tab.
 *
 * Features:
 * - Delegates to UserRolesDataGrid for consistent table rendering
 * - Provides header with bulk update button
 * - Handles loading, error, and empty states
 */
export function UserRolesTable({ users, isLoading, error, onBulkUpdate }: UserRolesTableProps) {
	// Determine content to render based on state
	const renderContent = () => {
		if (isLoading && !users) {
			return <LoadingSpinner />
		}

		if (error) {
			return <ErrorDisplay message={error} />
		}

		if (!users?.data || users.data.length === 0) {
			return <EmptyState />
		}

		// Delegate to UserRolesDataGrid for actual table rendering
		return (
			<UserRolesDataGrid
				users={users.data}
				isLoading={isLoading}
			/>
		)
	}

	return (
		<Card className='border border-base-300 bg-base-100 p-4 sm:p-6 shadow-sm'>
			<TableHeader onBulkUpdate={onBulkUpdate} />
			{renderContent()}
		</Card>
	)
}

export default UserRolesTable
