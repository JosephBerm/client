/**
 * UserRolesTable Component
 *
 * Displays users with their assigned roles in a tabular format.
 * Supports loading states, error handling, and empty states.
 *
 * Architecture: Pure presentation component with action callbacks.
 *
 * @see prd_rbac_management.md - US-RBAC-004
 * @module app/rbac/_components/UserRolesTable
 */

'use client'

import { Users, RefreshCw, AlertTriangle } from 'lucide-react'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

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
		<div className="mb-6 flex items-center justify-between">
			<div>
				<h3 className="text-lg font-semibold text-base-content">User Roles</h3>
				<p className="text-sm text-base-content/60">
					View and manage user role assignments
				</p>
			</div>
			<Button variant="primary" onClick={onBulkUpdate} className="gap-2">
				<Users className="h-4 w-4" />
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
		<div className="flex items-center justify-center py-12">
			<RefreshCw className="h-8 w-8 animate-spin text-primary" />
		</div>
	)
}

/**
 * Error display with message
 */
function ErrorDisplay({ message }: { message: string }) {
	return (
		<div className="flex items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
			<AlertTriangle className="h-5 w-5 flex-shrink-0" />
			<p>{message}</p>
		</div>
	)
}

/**
 * Empty state when no users
 */
function EmptyState() {
	return (
		<div className="py-12 text-center text-base-content/60">
			<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
			<p>No users found</p>
		</div>
	)
}

/**
 * Single user row in the table
 */
function UserRow({ user }: { user: UserWithRole }) {
	const formattedDate = user.lastLoginAt
		? new Date(user.lastLoginAt).toLocaleDateString()
		: 'Never'

	return (
		<tr className="border-b border-base-200 hover:bg-base-200/30 transition-colors">
			<td className="p-3">
				<div>
					<p className="font-medium text-base-content">{user.fullName}</p>
					<p className="text-sm text-base-content/60">{user.email}</p>
				</div>
			</td>
			<td className="p-3">
				<span className="rounded-full bg-base-200 px-3 py-1 text-sm text-base-content/70">
					{user.roleDisplayName}
				</span>
			</td>
			<td className="p-3 text-center">
				<span
					className={`rounded-full px-3 py-1 text-xs font-medium ${
						user.isActive
							? 'bg-success/20 text-success'
							: 'bg-base-200 text-base-content/50'
					}`}
				>
					{user.isActive ? 'Active' : 'Inactive'}
				</span>
			</td>
			<td className="p-3 text-sm text-base-content/60">{formattedDate}</td>
		</tr>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

/**
 * User Roles Management Table
 *
 * Displays all users with their roles in a sortable table.
 * Admin only - used in the "User Roles" tab.
 *
 * Features:
 * - User info with email
 * - Role badge
 * - Active/Inactive status
 * - Last login date
 * - Bulk update button
 */
export function UserRolesTable({
	users,
	isLoading,
	error,
	onBulkUpdate,
}: UserRolesTableProps) {
	// Determine content to render based on state
	const renderContent = () => {
		if (isLoading) {
			return <LoadingSpinner />
		}

		if (error) {
			return <ErrorDisplay message={error} />
		}

		if (!users?.data || users.data.length === 0) {
			return <EmptyState />
		}

		return (
			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr className="border-b border-base-300">
							<th className="p-3 text-left text-sm font-semibold text-base-content">
								User
							</th>
							<th className="p-3 text-left text-sm font-semibold text-base-content">
								Role
							</th>
							<th className="p-3 text-center text-sm font-semibold text-base-content">
								Status
							</th>
							<th className="p-3 text-left text-sm font-semibold text-base-content">
								Last Login
							</th>
						</tr>
					</thead>
					<tbody>
						{users.data.map((user) => (
							<UserRow key={user.id} user={user} />
						))}
					</tbody>
				</table>
			</div>
		)
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<TableHeader onBulkUpdate={onBulkUpdate} />
			{renderContent()}
		</Card>
	)
}

export default UserRolesTable

