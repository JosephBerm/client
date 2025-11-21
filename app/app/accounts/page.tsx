'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import ServerDataTable from '@_components/tables/ServerDataTable'
import Button from '@_components/ui/Button'
import { InternalPageHeader } from '../_components'
import Modal from '@_components/ui/Modal'
import RoleBadge from '@_components/common/RoleBadge'
import { createServerTableFetcher, formatDate } from '@_shared'
import { logger } from '@_core'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'
import { useState } from 'react'

interface Account {
	id: string
	username: string
	email: string
	role: number
	createdAt: string | Date
}

export default function AccountsPage() {
	const router = useRouter()
	const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; account: Account | null }>({
		isOpen: false,
		account: null,
	})
	const [refreshKey, setRefreshKey] = useState(0)

	// Column definitions
	const columns: ColumnDef<Account>[] = useMemo(
		() => [
			{
				accessorKey: 'username',
				header: 'Username',
				cell: ({ row }) => (
					<Link
					href={Routes.Accounts.detail(row.original.id)}
						className="link link-primary font-semibold"
					>
						{row.original.username}
					</Link>
				),
			},
			{
				accessorKey: 'email',
				header: 'Email',
			},
			{
				accessorKey: 'role',
				header: 'Role',
				cell: ({ row }) => <RoleBadge role={row.original.role} />,
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ row }) => formatDate(row.original.createdAt),
			},
			{
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<div className="flex gap-2">
					<Link href={Routes.Accounts.detail(row.original.id)}>
							<Button variant="ghost" size="sm">
								<Eye className="w-4 h-4" />
							</Button>
						</Link>
						<Button
							variant="ghost"
							size="sm"
							className="text-error hover:text-error"
							onClick={() =>
								setDeleteModal({ isOpen: true, account: row.original })
							}
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				),
			},
		],
		[]
	)

	// Fetch function for server-side table
	const fetchAccounts = createServerTableFetcher<Account>('/account/search')

	const handleDelete = async () => {
		if (!deleteModal.account) return

		try {
			const { data } = await API.Accounts.delete(deleteModal.account.id)
			
			if (data.statusCode === 200) {
				toast.success('Account deleted successfully')
				setDeleteModal({ isOpen: false, account: null })
				// Refresh the table
				setRefreshKey((prev) => prev + 1)
			} else {
				toast.error(data.message || 'Failed to delete account')
			}
		} catch (error) {
			logger.error('Failed to delete account', {
				error,
				accountId: deleteModal.account?.id,
				component: 'AccountsPage',
			})
			toast.error('An error occurred while deleting the account')
		}
	}

	return (
		<>
			<InternalPageHeader
				title="Accounts"
				description="Manage user accounts in the system"
				actions={
					<Button
						variant="primary"
						leftIcon={<Plus className="w-5 h-5" />}
					onClick={() => router.push(Routes.Accounts.create())}
					>
						Create Account
					</Button>
				}
			/>

			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<ServerDataTable
						key={refreshKey}
						columns={columns}
						fetchData={fetchAccounts}
						initialPageSize={10}
						emptyMessage="No accounts found"
					/>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={deleteModal.isOpen}
				onClose={() => setDeleteModal({ isOpen: false, account: null })}
				title="Delete Account"
			>
				<div className="space-y-4">
					<p>
						Are you sure you want to delete the account{' '}
						<strong>{deleteModal.account?.username}</strong>?
					</p>
					<p className="text-error text-sm">This action cannot be undone.</p>
					<div className="flex justify-end gap-4 mt-6">
						<Button
							variant="ghost"
							onClick={() => setDeleteModal({ isOpen: false, account: null })}
						>
							Cancel
						</Button>
						<Button variant="error" onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}

