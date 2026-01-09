/**
 * CustomerAccountsSection Component
 * 
 * Displays linked user accounts for a customer organization.
 * Shows DataGrid with account details and actions.
 * 
 * **Features:**
 * - DataGrid with name, email, role, created date
 * - Add account button
 * - Empty state with call-to-action
 * - Loading state
 * 
 * **Performance Optimizations (React 19 Best Practices):**
 * - useCallback for navigation handlers (stable references)
 * - useMemo for column definitions (prevents unnecessary DataGrid re-renders)
 * - Sub-components are pure functions (no state, no side effects)
 * 
 * @see prd_customers.md - Linked Accounts
 * @see React 19 Documentation - useCallback best practices
 * @module customers/components
 */

'use client'

import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { Plus, UserCheck } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { formatDate } from '@_lib/dates'

import type User from '@_classes/User'

import RoleBadge from '@_components/common/RoleBadge'
import { DataGrid } from '@_components/tables'
import type { ColumnDef } from '@_components/tables'
import Button from '@_components/ui/Button'

/** Component props */
interface CustomerAccountsSectionProps {
	/** Customer ID for creating new accounts */
	customerId: number | string
	/** Linked user accounts */
	accounts: User[]
	/** Whether accounts are loading */
	isLoading: boolean
}

/**
 * CustomerAccountsSection - Linked accounts grid.
 * Uses DataGrid for consistent table experience.
 * 
 * **React 19 Optimization Notes:**
 * - useCallback stabilizes navigation functions to prevent child re-renders
 * - useMemo for columns ensures DataGrid only re-renders when data changes
 * - Pure presentational sub-components (AccountsEmptyState) extracted for clarity
 */
export function CustomerAccountsSection({
	customerId,
	accounts,
	isLoading,
}: CustomerAccountsSectionProps) {
	const router = useRouter()

	/**
	 * Navigate to account detail page.
	 * Memoized with useCallback to provide stable reference for DataGrid cells.
	 */
	const navigateToAccount = useCallback(
		(accountId: string) => {
			router.push(Routes.Accounts.detail(accountId))
		},
		[router]
	)

	/**
	 * Navigate to create account page.
	 * Memoized to prevent unnecessary re-renders of header button.
	 */
	const navigateToCreateAccount = useCallback(() => {
		router.push(Routes.Accounts.create({ customerId: String(customerId) }))
	}, [router, customerId])

	/**
	 * Column definitions - memoized for DataGrid performance.
	 * 
	 * **Why useMemo here:**
	 * - DataGrid performs shallow comparison on columns prop
	 * - Without memoization, new array reference triggers full re-render
	 * - navigateToAccount is now stable via useCallback, so columns are stable
	 */
	const columns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const { name, username } = row.original
					const formattedName = [name?.first, name?.middle, name?.last]
						.filter(Boolean)
						.join(' ')
					return (
						<span className="font-medium text-base-content">
							{formattedName || username}
						</span>
					)
				},
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: ({ row }) => (
					<a
						href={`mailto:${row.original.email}`}
						className="link link-primary text-sm"
					>
						{row.original.email ?? 'Not provided'}
					</a>
				),
			},
			{
				accessorKey: 'role',
				header: 'Role',
			cell: ({ row }) => <RoleBadge role={row.original.roleLevel ?? 0} />,
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ row }) => (
					<span className="text-sm text-base-content/70">
						{formatDate(row.original.createdAt, 'short')}
					</span>
				),
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<div className="flex justify-end">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => navigateToAccount(row.original.id ?? '')}
						>
							View
						</Button>
					</div>
				),
			},
		],
		[navigateToAccount]
	)

	return (
		<section className="card bg-base-100 border border-base-300 shadow-sm">
			<div className="card-body p-4 sm:p-6">
				{/* Header */}
				<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 className="text-lg font-semibold text-base-content">
							Customer Accounts
						</h3>
						<p className="text-sm text-base-content/70">
							Users linked to this organization with access to MedSource Pro.
						</p>
					</div>
					<Button
						variant="primary"
						size="sm"
						leftIcon={<Plus size={16} />}
						onClick={navigateToCreateAccount}
					>
						<span className="hidden sm:inline">Add Account</span>
						<span className="sm:hidden">Add</span>
					</Button>
				</div>

				{/* Data Grid */}
				<DataGrid<User>
					columns={columns}
					data={accounts}
					ariaLabel="Customer accounts"
					isLoading={isLoading}
					emptyMessage={
						<AccountsEmptyState onAddAccount={navigateToCreateAccount} />
					}
				/>
			</div>
		</section>
	)
}

/**
 * AccountsEmptyState - Empty state with call-to-action.
 * Extracted for readability.
 */
interface AccountsEmptyStateProps {
	onAddAccount: () => void
}

function AccountsEmptyState({ onAddAccount }: AccountsEmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-6">
			<UserCheck size={32} className="text-base-content/30" />
			<p className="text-base-content/60 text-sm">
				No accounts linked to this customer yet.
			</p>
			<Button variant="primary" size="sm" onClick={onAddAccount}>
				Add First Account
			</Button>
		</div>
	)
}

export default CustomerAccountsSection

