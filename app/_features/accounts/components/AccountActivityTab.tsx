/**
 * AccountActivityTab Component
 * 
 * Activity tab content for the account detail page.
 * Shows recent orders and quotes for the account.
 * 
 * **Features:**
 * - Recent orders table
 * - Recent quotes table
 * - Loading states
 * - Empty states
 * - Navigation to detail pages
 * 
 * @module features/accounts/components/AccountActivityTab
 */

'use client'

import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { Eye, ShoppingCart, FileText } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { formatDate, formatCurrency } from '@_shared'

import type Order from '@_classes/Order'
import type Quote from '@_classes/Quote'
import { QuoteStatus } from '@_classes/Enums'

import LoadingSpinner from '@_components/common/LoadingSpinner'
import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import { DataGrid, type ColumnDef } from '@_components/tables'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

// ============================================================================
// TYPES
// ============================================================================

export interface AccountActivityTabProps {
	/** Recent orders for this account */
	orders: Order[]
	/** Recent quotes for this account */
	quotes: Quote[]
	/** Whether orders are loading */
	isLoadingOrders: boolean
	/** Whether quotes are loading */
	isLoadingQuotes: boolean
	/** Whether account has a customer/company association */
	hasCustomerAssociation?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AccountActivityTab Component
 * 
 * Renders the activity section of the account detail page.
 * Shows recent orders and quotes in data grid format.
 */
export default function AccountActivityTab({
	orders,
	quotes,
	isLoadingOrders,
	isLoadingQuotes,
	hasCustomerAssociation = true,
}: AccountActivityTabProps) {
	const router = useRouter()

	// ============================================================================
	// COLUMN DEFINITIONS
	// Note: Hooks must be called unconditionally (before any early returns)
	// per React's Rules of Hooks
	// ============================================================================

	const orderColumns: ColumnDef<Order>[] = useMemo(
		() => [
			{
				accessorKey: 'id',
				header: 'Order ID',
				cell: ({ row }) => (
					<span className="font-mono text-sm">#{row.original.id}</span>
				),
			},
			{
				accessorKey: 'createdAt',
				header: 'Date',
				cell: ({ row }) => (
					<span className="text-sm text-base-content/70">
						{formatDate(row.original.createdAt, 'short')}
					</span>
				),
			},
			{
				accessorKey: 'total',
				header: 'Total',
				cell: ({ row }) => (
					<span className="font-medium">
						{formatCurrency(row.original.total || 0)}
					</span>
				),
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push(Routes.Orders.detail(row.original.id!))}
						leftIcon={<Eye className="h-4 w-4" />}
					>
						View
					</Button>
				),
			},
		],
		[router]
	)

	const quoteColumns: ColumnDef<Quote>[] = useMemo(
		() => [
			{
				accessorKey: 'id',
				header: 'Quote ID',
				cell: ({ row }) => (
					<span className="font-mono text-sm">#{row.original.id}</span>
				),
			},
			{
				accessorKey: 'createdAt',
				header: 'Requested',
				cell: ({ row }) => (
					<span className="text-sm text-base-content/70">
						{formatDate(row.original.createdAt, 'short')}
					</span>
				),
			},
			{
				accessorKey: 'products',
				header: 'Items',
				cell: ({ row }) => (
					<span className="text-sm">
						{row.original.products?.length ?? 0} items
					</span>
				),
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => {
					const status = row.original.status
					const variant = status === QuoteStatus.Read ? 'success' : 'warning'
					const label = status === QuoteStatus.Read ? 'Reviewed' : 'Pending'
					return <Badge variant={variant} tone="subtle">{label}</Badge>
				},
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push(Routes.Quotes.detail(row.original.id ?? ''))}
						leftIcon={<Eye className="h-4 w-4" />}
					>
						View
					</Button>
				),
			},
		],
		[router]
	)

	// ============================================================================
	// EARLY RETURN: No Customer Association
	// Note: This must come AFTER all hooks per React's Rules of Hooks
	// ============================================================================

	if (!hasCustomerAssociation) {
		return (
			<Card className="border border-base-300 bg-base-100 p-8 shadow-sm">
				<div className="text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mx-auto mb-4">
						<ShoppingCart className="h-8 w-8 text-warning" />
					</div>
					<h2 className="text-lg font-semibold text-base-content mb-2">
						No Customer Association
					</h2>
					<p className="text-sm text-base-content/60 max-w-md mx-auto">
						This account is not linked to a customer organization. Activity data 
						(orders and quotes) will be available once the account is associated 
						with a customer.
					</p>
				</div>
			</Card>
		)
	}

	// ============================================================================
	// RENDER
	// ============================================================================

	return (
		<div className="space-y-6">
			{/* Recent Orders */}
			<Card className="border border-base-300 bg-base-100 shadow-sm overflow-hidden">
				<div className="p-6 border-b border-base-300">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<ShoppingCart className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-base-content">Recent Orders</h2>
							<p className="text-sm text-base-content/60">
								Last 10 orders for this account
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					{isLoadingOrders ? (
						<div className="flex items-center justify-center py-12">
							<LoadingSpinner />
						</div>
					) : (
						<DataGrid
							columns={orderColumns}
							data={orders}
							ariaLabel="Account orders"
							emptyMessage="No orders found for this account"
							manualPagination={false}
						/>
					)}
				</div>
			</Card>

			{/* Recent Quotes */}
			<Card className="border border-base-300 bg-base-100 shadow-sm overflow-hidden">
				<div className="p-6 border-b border-base-300">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
							<FileText className="h-5 w-5 text-secondary" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-base-content">Recent Quotes</h2>
							<p className="text-sm text-base-content/60">
								Last 10 quote requests for this account
							</p>
						</div>
					</div>
				</div>
				<div className="p-6">
					{isLoadingQuotes ? (
						<div className="flex items-center justify-center py-12">
							<LoadingSpinner />
						</div>
					) : (
						<DataGrid
							columns={quoteColumns}
							data={quotes}
							ariaLabel="Account quotes"
							emptyMessage="No quotes found for this account"
							manualPagination={false}
						/>
					)}
				</div>
			</Card>
		</div>
	)
}
