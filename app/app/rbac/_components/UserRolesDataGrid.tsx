/**
 * UserRolesDataGrid Component
 *
 * Modern data grid for displaying user role assignments.
 * Migrated from UserRolesTable to use DataGrid for consistency.
 * Mobile-first responsive design.
 *
 * Features:
 * - Client-side pagination via DataGrid
 * - Custom cell renderers for roles and status
 * - Edit actions with permission checks
 * - Skeleton loading states
 *
 * @see prd_rbac_management.md - US-RBAC-003
 * @module app/rbac/_components/UserRolesDataGrid
 */

'use client'

import { useMemo } from 'react'
import { Pencil, User, Mail } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import Button from '@_components/ui/Button'
import { DataGrid } from '@_components/tables'

import type { UserWithRole } from '@_types/rbac-management'

// =========================================================================
// TYPES
// =========================================================================

interface UserRolesDataGridProps {
	users: UserWithRole[]
	isLoading: boolean
	onEditUser?: (user: UserWithRole) => void
	canEditUsers?: boolean
}

// =========================================================================
// CELL COMPONENTS
// =========================================================================

/**
 * User name cell with avatar placeholder - mobile optimized
 */
function UserNameCell({ user }: { user: UserWithRole }) {
	return (
		<div className="flex items-center gap-2 sm:gap-3 min-w-0">
			<div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
				<User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
			</div>
			<div className="flex flex-col min-w-0">
				<span className="text-sm font-medium text-base-content truncate">
					{user.fullName || user.username || 'Unknown User'}
				</span>
				<span className="hidden sm:flex items-center gap-1 text-xs text-base-content/50 truncate">
					<Mail className="h-3 w-3 flex-shrink-0" />
					{user.email}
				</span>
			</div>
		</div>
	)
}

/**
 * Email cell - mobile only display (shown separately on mobile)
 */
function EmailCell({ email }: { email: string }) {
	return (
		<div className="flex items-center gap-1.5 min-w-0">
			<Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-base-content/40 flex-shrink-0" />
			<span className="text-xs sm:text-sm text-base-content/70 truncate">
				{email}
			</span>
		</div>
	)
}

/**
 * Role badge cell - mobile optimized
 */
function RoleCell({ roleDisplayName }: { roleDisplayName: string }) {
	if (!roleDisplayName) {
		return (
			<span className="text-xs sm:text-sm text-base-content/50 italic">No role assigned</span>
		)
	}

	return (
		<span className="inline-flex items-center rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-primary">
			{roleDisplayName}
		</span>
	)
}

/**
 * Status cell with badge - mobile optimized
 */
function StatusCell({ isActive }: { isActive?: boolean }) {
	const active = isActive ?? true // Default to active if not specified
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium ${
				active ? 'bg-success/20 text-success' : 'bg-base-200 text-base-content/50'
			}`}
		>
			{active ? 'Active' : 'Inactive'}
		</span>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export function UserRolesDataGrid({
	users,
	isLoading,
	onEditUser,
	canEditUsers = false,
}: UserRolesDataGridProps) {
	// Column definitions - useMemo is required for TanStack Table stable reference
	const columns = useMemo<ColumnDef<UserWithRole>[]>(
		() => [
			{
				id: 'user',
				accessorKey: 'fullName',
				header: 'User',
				cell: ({ row }) => <UserNameCell user={row.original} />,
				size: 220,
			},
			{
				id: 'email',
				accessorKey: 'email',
				header: 'Email',
				cell: ({ row }) => <EmailCell email={row.original.email} />,
				size: 200,
				meta: {
					// Hide on mobile - info shown in user cell
					className: 'hidden md:table-cell',
				},
			},
			{
				id: 'role',
				accessorKey: 'roleDisplayName',
				header: 'Role',
				cell: ({ row }) => <RoleCell roleDisplayName={row.original.roleDisplayName} />,
				size: 140,
			},
			{
				id: 'status',
				accessorKey: 'isActive',
				header: 'Status',
				cell: ({ row }) => <StatusCell isActive={row.original.isActive} />,
				size: 90,
			},
			...(canEditUsers && onEditUser
				? [
						{
							id: 'actions',
							header: '',
							cell: ({ row }: { row: { original: UserWithRole } }) => (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onEditUser(row.original)}
									aria-label={`Edit ${row.original.fullName || row.original.username}`}
									className="p-1.5 sm:p-2"
								>
									<Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
								</Button>
							),
							size: 60,
						} as ColumnDef<UserWithRole>,
				  ]
				: []),
		],
		[canEditUsers, onEditUser]
	)

	return (
		<div className="overflow-x-auto -mx-3 sm:mx-0">
			<div className="min-w-[480px] px-3 sm:px-0">
			<DataGrid<UserWithRole>
				data={users}
				columns={columns}
				isLoading={isLoading}
				loadingVariant="skeleton"
				skeletonRowCount={5}
				enablePagination
				enablePageSize
				emptyMessage={
						<div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
							<User className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-base-content/20" />
							<p className="text-sm text-base-content/60">No users found</p>
						</div>
					}
					ariaLabel="User roles table"
				/>
			</div>
		</div>
	)
}

export default UserRolesDataGrid
