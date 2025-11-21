'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus } from 'lucide-react'
import { useAuthStore } from '@_features/auth'
import { AccountRole } from '@_classes/Enums'
import { Routes } from '@_features/navigation'
import ServerDataGrid from '@_components/tables/ServerDataGrid'
import Button from '@_components/ui/Button'
import { InternalPageHeader } from '../_components'
import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import { createServerTableFetcher, formatDate, formatCurrency } from '@_shared'
import type { IUser } from '@_classes/User'

interface Order {
	id: number
	customerId: number
	customerName?: string
	totalAmount: number
	status: number
	createdAt: string | Date
	shippingAddress?: string
}

export default function OrdersPage() {
	const user = useAuthStore((state) => state.user)
	const isAdmin = user?.role === AccountRole.Admin

	// Column definitions
	const columns: ColumnDef<Order>[] = useMemo(
		() => [
			{
				accessorKey: 'id',
				header: 'Order #',
			cell: ({ row }) => (
				<Link
					href={Routes.Orders.detail(row.original.id)}
					className="link link-primary font-semibold"
				>
						#{row.original.id}
					</Link>
				),
			},
			...(isAdmin
				? [
						{
							accessorKey: 'customerName',
							header: 'Customer',
							cell: ({ row }: any) => row.original.customerName || 'N/A',
						},
				  ]
				: []),
			{
				accessorKey: 'totalAmount',
				header: 'Total',
				cell: ({ row }) => formatCurrency(row.original.totalAmount),
			},
			{
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
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
				<Link href={Routes.Orders.detail(row.original.id)}>
					<Button variant="ghost" size="sm">
							<Eye className="w-4 h-4" />
						</Button>
					</Link>
				),
			},
		],
		[isAdmin]
	)

	// Fetch function for server-side table
	const fetchOrders = createServerTableFetcher<Order>('/orders/search')

	return (
		<>
			<InternalPageHeader
				title="Orders"
				description={
					isAdmin
						? 'Manage all orders in the system'
						: 'View and track your orders'
				}
				actions={
					isAdmin && (
						<Button variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
							Create Order
						</Button>
					)
				}
			/>

			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
				<ServerDataGrid
					columns={columns}
					fetchData={fetchOrders}
					initialPageSize={10}
					emptyMessage="No orders found"
					ariaLabel="Orders table"
				/>
				</div>
			</div>
		</>
	)
}

