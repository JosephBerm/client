/**
 * UserRolesRichDataGrid Component
 *
 * Displays users with their assigned roles using RichDataGrid.
 * Server-side paginated, searchable, filterable data grid.
 *
 * Features:
 * - Server-side pagination and sorting
 * - Global search
 * - Column filters (role, status)
 * - Bulk actions (export, role assignment)
 * - Row selection
 *
 * @see prd_rbac_management.md - US-RBAC-004
 * @module app/rbac/_components/UserRolesRichDataGrid
 */

'use client'

import { useCallback, useState } from 'react'

import { Download, Mail, User, Users, UserCog } from 'lucide-react'

import { API, notificationService, formatDate } from '@_shared'

import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	BulkActionVariant,
	type BulkAction,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult, RichColumnDef } from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import type { UserWithRole } from '@_types/rbac-management'

// =========================================================================
// TYPES
// =========================================================================

interface UserRolesRichDataGridProps {
	/** Callback to open bulk update modal */
	onBulkUpdate: () => void
	/** Whether user can edit roles */
	canEdit: boolean
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
	const active = isActive ?? true
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

export function UserRolesRichDataGrid({
	onBulkUpdate,
	canEdit,
}: UserRolesRichDataGridProps) {
	const [refreshKey, setRefreshKey] = useState(0)

	// Custom fetcher for RichDataGrid
	const fetcher = useCallback(
		async (filter: RichSearchFilter): Promise<RichPagedResult<UserWithRole>> => {
			const response = await API.RBAC.getUsersWithRoles({
				page: filter.page,
				pageSize: filter.pageSize,
				search: filter.globalSearch,
			})

			if (response.data?.payload) {
				const payload = response.data.payload
				return {
					data: payload.data ?? [],
					page: payload.page ?? filter.page,
					pageSize: payload.pageSize ?? filter.pageSize,
					total: payload.total ?? 0,
					totalPages: payload.totalPages ?? payload.pageCount ?? 1,
					hasNext: (payload.page ?? filter.page) < (payload.totalPages ?? payload.pageCount ?? 1),
					hasPrevious: (payload.page ?? filter.page) > 1,
				}
			}

			// Return empty result on error
			return {
				data: [],
				page: 1,
				pageSize: filter.pageSize,
				total: 0,
				totalPages: 0,
				hasNext: false,
				hasPrevious: false,
			}
		},
		[]
	)

	// Column helper for type-safe column definitions
	const columnHelper = createRichColumnHelper<UserWithRole>()

	const columns: RichColumnDef<UserWithRole, unknown>[] = [
		// User - Text filter, searchable
		columnHelper.accessor('fullName', {
			header: 'User',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => <UserNameCell user={row.original} />,
			size: 220,
		}),

		// Email - Text filter, searchable
		columnHelper.accessor('email', {
			header: 'Email',
			filterType: FilterType.Text,
			searchable: true,
			meta: {
				className: 'hidden md:table-cell',
			},
			size: 200,
		}),

		// Role - Select filter, faceted
		columnHelper.accessor('roleDisplayName', {
			header: 'Role',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => <RoleCell roleDisplayName={row.original.roleDisplayName} />,
			size: 140,
		}),

		// Status - Boolean filter
		columnHelper.accessor('isActive', {
			header: 'Status',
			filterType: FilterType.Boolean,
			cell: ({ row }) => <StatusCell isActive={row.original.isActive} />,
			size: 90,
		}),

		// Last Login - Date filter
		columnHelper.accessor('lastLoginAt', {
			header: 'Last Login',
			filterType: FilterType.Date,
			cell: ({ row }) => (
				<span className="text-sm text-base-content/70">
					{row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : 'Never'}
				</span>
			),
			size: 120,
		}),
	]

	// Bulk actions
	const bulkActions: BulkAction<UserWithRole>[] = canEdit ? [
		{
			id: 'export-csv',
			label: 'Export CSV',
			icon: <Download className="w-4 h-4" />,
			variant: BulkActionVariant.Default,
			onAction: async (rows: UserWithRole[]) => {
				const headers = 'User ID,Username,Full Name,Email,Role,Status,Last Login\n'
				const csv = rows.map(r =>
					`${r.id},"${r.username ?? ''}","${r.fullName ?? ''}","${r.email ?? ''}","${r.roleDisplayName ?? ''}",${r.isActive ? 'Active' : 'Inactive'},"${r.lastLoginAt ? formatDate(r.lastLoginAt) : 'Never'}"`
				).join('\n')
				const blob = new Blob([headers + csv], { type: 'text/csv' })
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `user-roles-export-${new Date().toISOString().split('T')[0]}.csv`
				a.click()
				URL.revokeObjectURL(url)
				notificationService.success(`Exported ${rows.length} users`)
			},
		},
		{
			id: 'bulk-role-change',
			label: 'Change Roles',
			icon: <UserCog className="w-4 h-4" />,
			variant: BulkActionVariant.Primary,
			onAction: async () => {
				// Open bulk modal - this would need to pass selected users
				onBulkUpdate()
			},
		},
	] : []

	return (
		<Card className="border border-base-300 bg-base-100 p-3 sm:p-6 shadow-sm">
			{/* Header */}
			<div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h3 className="text-base sm:text-lg font-semibold text-base-content">
						User Roles
					</h3>
					<p className="text-xs sm:text-sm text-base-content/60">
						View and manage user role assignments
					</p>
				</div>
				{canEdit && (
					<Button variant="primary" onClick={onBulkUpdate} className="gap-2 self-end sm:self-auto">
						<Users className="h-4 w-4" />
						<span className="hidden sm:inline">Bulk Update</span>
						<span className="sm:hidden">Bulk</span>
					</Button>
				)}
			</div>

			{/* Data Grid */}
			<div className="overflow-x-auto -mx-3 sm:mx-0">
				<div className="min-w-[480px] px-3 sm:px-0">
					<RichDataGrid<UserWithRole>
						columns={columns}
						fetcher={fetcher}
						filterKey={String(refreshKey)}
						defaultPageSize={10}
						defaultSorting={[{ columnId: createColumnId('fullName'), direction: SortDirection.Ascending }]}
						enableGlobalSearch
						enableColumnFilters
						enableRowSelection={canEdit}
						enableColumnResizing
						bulkActions={bulkActions.length > 0 ? bulkActions : undefined}
						searchPlaceholder="Search users by name or email..."
						persistStateKey="rbac-user-roles-grid"
						emptyState={
							<div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
								<Users className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-base-content/20" />
								<p className="text-sm text-base-content/60">No users found</p>
							</div>
						}
						ariaLabel="User roles table"
					/>
				</div>
			</div>
		</Card>
	)
}

export default UserRolesRichDataGrid
