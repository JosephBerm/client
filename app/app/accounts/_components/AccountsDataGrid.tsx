'use client'

/**
 * AccountsDataGrid Component
 * 
 * Server-side paginated data grid for user accounts with:
 * - View, edit role, and delete actions
 * - Role change modal (admin only)
 * - Delete confirmation modal
 * - Automatic table refresh after mutations
 * - RichDataGrid with global search and sorting
 * 
 * This component encapsulates all account table logic,
 * keeping the page component clean and focused.
 * 
 * **Next.js 16 Optimization:**
 * - React Compiler enabled - automatic memoization
 * - No manual useMemo/useCallback needed
 * 
 * **Migration:** Phase 3.3 - Migrated from ServerDataGrid to RichDataGrid
 * @see RICHDATAGRID_MIGRATION_PLAN.md
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module accounts/AccountsDataGrid
 */

import { useCallback, useState } from 'react'

import Link from 'next/link'

import { Download, Eye, Key, Trash2, UserCog, UserX } from 'lucide-react'

import { PasswordResetModal } from '@_features/accounts'
import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { 
	notificationService, 
	formatDate, 
	API, 
	usePermissions,
	ROLE_OPTIONS,
} from '@_shared'

import type { AccountRoleType } from '@_classes/Enums'
import { AccountRole, AccountStatus } from '@_classes/Enums'

import { RoleBadge, AccountStatusBadge } from '@_components/common'
import AccountActionsDropdown from '@_components/admin/AccountActionsDropdown'
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
import ConfirmationModal from '@_components/ui/ConfirmationModal'

import type { AccountInfo } from '@_types'

import RoleChangeModal from './RoleChangeModal'

// Use shared type
type Account = AccountInfo

// ============================================================================
// TYPES
// ============================================================================

interface RoleModalState {
	isOpen: boolean
	account: Account | null
	selectedRole: AccountRoleType | null
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AccountsDataGrid Component
 * 
 * Renders a server-side paginated table of user accounts
 * with role management capabilities for admins.
 */
export default function AccountsDataGrid() {
	const { isAdmin } = usePermissions()
	
	// State
	const [refreshKey, setRefreshKey] = useState(0)
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; account: Account | null }>({
		isOpen: false,
		account: null,
	})
	const [roleModal, setRoleModal] = useState<RoleModalState>({
		isOpen: false,
		account: null,
		selectedRole: null,
	})
	const [isDeleting, setIsDeleting] = useState(false)
	const [isUpdatingRole, setIsUpdatingRole] = useState(false)
	const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; account: Account | null }>({
		isOpen: false,
		account: null,
	})

	// Custom fetcher for RichDataGrid
	const fetcher = useCallback(
		async (filter: RichSearchFilter): Promise<RichPagedResult<Account>> => {
			const response = await API.Accounts.richSearch(filter)

			if (response.data?.payload) {
				return response.data.payload as unknown as RichPagedResult<Account>
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

	// Refresh table data (React Compiler auto-memoizes)
	const refreshTable = () => {
		setRefreshKey(prev => prev + 1)
	}

	// ========================================================================
	// DELETE HANDLERS (React Compiler auto-memoizes)
	// ========================================================================

	const handleDelete = async () => {
		if (!deleteModal.account) {
			return
		}

		setIsDeleting(true)
		try {
			const { data } = await API.Accounts.delete(deleteModal.account.id)
			
			if (data.statusCode === 200) {
				notificationService.success('Account deleted successfully', {
					metadata: { accountId: deleteModal.account.id },
					component: 'AccountsDataGrid',
					action: 'deleteAccount',
				})
				setDeleteModal({ isOpen: false, account: null })
				refreshTable()
			} else {
				notificationService.error(data.message ?? 'Failed to delete account', {
					metadata: { accountId: deleteModal.account.id },
					component: 'AccountsDataGrid',
					action: 'deleteAccount',
				})
			}
		} catch (error) {
			logger.error('Delete account error', { error })
			notificationService.error('An error occurred while deleting the account', {
				metadata: { error, accountId: deleteModal.account?.id },
				component: 'AccountsDataGrid',
				action: 'deleteAccount',
			})
		} finally {
			setIsDeleting(false)
		}
	}

	// ========================================================================
	// ROLE CHANGE HANDLERS (React Compiler auto-memoizes)
	// ========================================================================

	const handleRoleChange = async () => {
		if (!roleModal.account || roleModal.selectedRole === null) {
			return
		}

		setIsUpdatingRole(true)
		try {
			const { data } = await API.Accounts.updateRole(
				roleModal.account.id, 
				roleModal.selectedRole
			)
			
			if (data.statusCode === 200) {
				const roleLabel = ROLE_OPTIONS.find(r => r.value === roleModal.selectedRole)?.label ?? 'Unknown'
				notificationService.success(`Role updated to ${roleLabel}`, {
					metadata: { accountId: roleModal.account.id, newRole: roleModal.selectedRole },
					component: 'AccountsDataGrid',
					action: 'updateRole',
				})
				setRoleModal({ isOpen: false, account: null, selectedRole: null })
				refreshTable()
			} else {
				notificationService.error(data.message ?? 'Failed to update role', {
					metadata: { accountId: roleModal.account.id },
					component: 'AccountsDataGrid',
					action: 'updateRole',
				})
			}
		} catch (error) {
			logger.error('Role change error', { error })
			notificationService.error('An error occurred while updating the role', {
				metadata: { error, accountId: roleModal.account?.id },
				component: 'AccountsDataGrid',
				action: 'updateRole',
			})
		} finally {
			setIsUpdatingRole(false)
		}
	}

	// ========================================================================
	// MODAL HANDLERS (React Compiler auto-memoizes)
	// ========================================================================

	const openDeleteModal = (account: Account) => {
		setDeleteModal({ isOpen: true, account })
	}

	const closeDeleteModal = () => {
		setDeleteModal({ isOpen: false, account: null })
	}

	const openRoleModal = (account: Account) => {
		setRoleModal({
			isOpen: true,
			account,
			selectedRole: account.role as AccountRoleType
		})
	}

	const closeRoleModal = () => {
		setRoleModal({ isOpen: false, account: null, selectedRole: null })
	}

	const updateSelectedRole = (role: AccountRoleType | null) => {
		setRoleModal(prev => ({ ...prev, selectedRole: role }))
	}

	const openPasswordModal = (account: Account) => {
		setPasswordModal({ isOpen: true, account })
	}

	const closePasswordModal = () => {
		setPasswordModal({ isOpen: false, account: null })
	}

	// ========================================================================
	// COLUMN DEFINITIONS (React Compiler auto-memoizes)
	// ========================================================================

	/**
	 * Handle account status change from dropdown
	 */
	const handleStatusChange = (accountId: string, newStatus: AccountStatus) => {
		logger.info('Account status changed', {
			component: 'AccountsDataGrid',
			accountId,
			newStatus,
		})
		// Refresh table to show updated status
		refreshTable()
	}

	// Column helper for type-safe column definitions
	const columnHelper = createRichColumnHelper<Account>()

	const columns: RichColumnDef<Account, unknown>[] = [
		// Username - Text filter, searchable
		columnHelper.accessor('username', {
			header: 'Username',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<Link
					href={Routes.Accounts.detail(row.original.id)}
					className="link link-primary font-semibold"
				>
					{row.original.username}
				</Link>
			),
		}),

		// Email - Text filter, searchable
		columnHelper.accessor('email', {
			header: 'Email',
			filterType: FilterType.Text,
			searchable: true,
		}),

		// Role - Select filter, faceted
		columnHelper.accessor('role', {
			header: 'Role',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => <RoleBadge role={row.original.role} />,
		}),

		// Status - Select filter, faceted
		columnHelper.accessor('status', {
			header: 'Status',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => (
				<AccountStatusBadge 
					status={row.original.status ?? AccountStatus.Active} 
					size="sm"
				/>
			),
		}),

		// Created At - Date filter
		columnHelper.accessor('createdAt', {
			header: 'Created',
			filterType: FilterType.Date,
			cell: ({ row }) => formatDate(row.original.createdAt),
		}),

		// Actions - Display only
		columnHelper.display({
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<div className="flex gap-2 items-center">
					<Link href={Routes.Accounts.detail(row.original.id)}>
						<Button variant="ghost" size="sm" title="View account">
							<Eye className="w-4 h-4" />
						</Button>
					</Link>
					{isAdmin && (
						<>
							<Button
								variant="ghost"
								size="sm"
								title="Change role"
								onClick={() => openRoleModal(row.original)}
							>
								<UserCog className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								title="Reset password"
								onClick={() => openPasswordModal(row.original)}
							>
								<Key className="w-4 h-4" />
							</Button>
							{/* Phase 1: Admin Account Actions Dropdown */}
							<AccountActionsDropdown
								account={row.original}
								onStatusChange={handleStatusChange}
							/>
						</>
					)}
					<Button
						variant="ghost"
						size="sm"
						className="text-error hover:text-error"
						title="Delete account"
						onClick={() => openDeleteModal(row.original)}
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			),
		}),
	]

	// ========================================================================
	// RENDER
	// ========================================================================

	return (
		<>
			<RichDataGrid<Account>
				columns={columns}
				fetcher={fetcher}
				filterKey={String(refreshKey)}
				defaultPageSize={10}
				defaultSorting={[{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending }]}
				enableGlobalSearch
				enableColumnFilters
				enableRowSelection={isAdmin}
				enableColumnResizing
				bulkActions={isAdmin ? [
					{
						id: 'export-csv',
						label: 'Export CSV',
						icon: <Download className="w-4 h-4" />,
						variant: BulkActionVariant.Default,
						onAction: async (rows: Account[]) => {
							const headers = 'ID,Username,Email,Role,Status,Created\n'
							const csv = rows.map(r =>
								`${r.id},"${r.username ?? ''}","${r.email ?? ''}",${r.role},${r.status},"${formatDate(r.createdAt)}"`
							).join('\n')
							const blob = new Blob([headers + csv], { type: 'text/csv' })
							const url = URL.createObjectURL(blob)
							const a = document.createElement('a')
							a.href = url
							a.download = `accounts-export-${new Date().toISOString().split('T')[0]}.csv`
							a.click()
							URL.revokeObjectURL(url)
							notificationService.success(`Exported ${rows.length} accounts`)
						},
					},
					{
						id: 'deactivate-selected',
						label: 'Deactivate Selected',
						icon: <UserX className="w-4 h-4" />,
						variant: BulkActionVariant.Danger,
						confirmMessage: (count) => `Are you sure you want to deactivate ${count} account(s)?`,
						onAction: async (rows: Account[]) => {
							const activeAccounts = rows.filter(r => r.status === AccountStatus.Active)
							const promises = activeAccounts.map(r => API.Accounts.changeStatus(r.id, AccountStatus.Suspended))
							await Promise.all(promises)
							notificationService.success(`Deactivated ${activeAccounts.length} accounts`)
							refreshTable()
						},
					},
				] satisfies BulkAction<Account>[] : undefined}
				searchPlaceholder="Search accounts by username or email..."
				persistStateKey="accounts-grid"
				emptyState={
					<div className="flex flex-col items-center gap-3 py-12">
						<p className="text-base-content/60">No accounts found</p>
						<p className="text-sm text-base-content/40">
							User accounts will appear here.
						</p>
					</div>
				}
				ariaLabel="Accounts table"
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={closeDeleteModal}
				onConfirm={handleDelete}
				title="Delete Account"
				message={`Are you sure you want to delete the account "${deleteModal.account?.username}"?`}
				details="This action cannot be undone. All data associated with this account will be permanently removed."
				variant="danger"
				confirmText="Delete"
				cancelText="Cancel"
				isLoading={isDeleting}
			/>

			{/* Role Change Modal */}
			<RoleChangeModal
				isOpen={roleModal.isOpen}
				account={roleModal.account}
				selectedRole={roleModal.selectedRole}
				isLoading={isUpdatingRole}
				onClose={closeRoleModal}
				onSelectRole={updateSelectedRole}
				onConfirm={() => void handleRoleChange()}
			/>

			{/* Password Reset Modal (Admin Only) */}
			<PasswordResetModal
				isOpen={passwordModal.isOpen}
				account={passwordModal.account}
				onClose={closePasswordModal}
				onSuccess={refreshTable}
			/>
		</>
	)
}

