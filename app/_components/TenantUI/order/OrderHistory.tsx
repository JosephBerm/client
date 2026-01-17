'use client'

import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import Card from '@_components/ui/Card'
import Badge, { type BadgeProps } from '@_components/ui/Badge'
import { DataGrid } from '@_components/tables'

interface Order {
	id: string
	orderNumber: string
	date: string
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
	total: number
	tracking?: string
}

interface OrderHistoryProps {
	orders?: Order[]
	showStatus?: boolean
	showTracking?: boolean
}

/**
 * Order History Component
 *
 * Displays user's order history in a table format.
 * Includes order status and tracking information.
 * Uses DaisyUI semantic colors and existing UI components.
 *
 * TIER: Standard
 * CATEGORY: Order
 */
export default function OrderHistory({ orders = [], showStatus = true, showTracking = true }: OrderHistoryProps) {
	// Map order status to Badge variant/tone for DaisyUI semantic colors
	const getStatusBadgeProps = (status: Order['status']): Pick<BadgeProps, 'variant' | 'tone'> => {
		const statusMap: Record<Order['status'], Pick<BadgeProps, 'variant' | 'tone'>> = {
			pending: { variant: 'warning', tone: 'subtle' },
			processing: { variant: 'info', tone: 'subtle' },
			shipped: { variant: 'primary', tone: 'solid' },
			delivered: { variant: 'success', tone: 'solid' },
			cancelled: { variant: 'error', tone: 'solid' },
		}
		return statusMap[status]
	}

	if (orders.length === 0) {
		return (
			<Card variant='elevated'>
				<div className='flex min-h-[200px] items-center justify-center p-6'>
					<p className='text-base-content/60'>No orders found</p>
				</div>
			</Card>
		)
	}

	return (
		<Card variant='elevated'>
			<header className='border-b border-base-300 p-4 sm:p-6'>
				<h2 className='text-lg font-semibold text-base-content sm:text-xl'>Order History</h2>
			</header>

			{/* Mobile: Card layout, Desktop: Table layout */}
			{/* Mobile view (< sm) */}
			<div className='block sm:hidden'>
				<div className='divide-y divide-base-200'>
					{orders.map((order) => (
						<div
							key={order.id}
							className='space-y-2 p-4'>
							<div className='flex items-center justify-between'>
								<span className='font-medium text-base-content'>{order.orderNumber}</span>
								{showStatus && (
									<Badge
										{...getStatusBadgeProps(order.status)}
										size='sm'>
										{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
									</Badge>
								)}
							</div>
							<div className='flex items-center justify-between text-sm'>
								<span className='text-base-content/60'>
									{new Date(order.date).toLocaleDateString()}
								</span>
								<span className='font-semibold text-base-content'>${order.total.toFixed(2)}</span>
							</div>
							{showTracking && order.tracking && (
								<p className='text-xs text-base-content/50'>Tracking: {order.tracking}</p>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Desktop view (sm+) */}
			<div className='hidden overflow-x-auto sm:block'>
				<OrderHistoryDataGrid
					orders={orders}
					showStatus={showStatus}
					showTracking={showTracking}
					getStatusBadgeProps={getStatusBadgeProps}
				/>
			</div>
		</Card>
	)
}

// =========================================================================
// DATA GRID COMPONENT
// =========================================================================

interface OrderHistoryDataGridProps {
	orders: Order[]
	showStatus: boolean
	showTracking: boolean
	getStatusBadgeProps: (status: Order['status']) => Pick<BadgeProps, 'variant' | 'tone'>
}

/**
 * DataGrid component for displaying order history (desktop only)
 */
function OrderHistoryDataGrid({ orders, showStatus, showTracking, getStatusBadgeProps }: OrderHistoryDataGridProps) {
	const columns = useMemo<ColumnDef<Order>[]>(() => {
		const baseColumns: ColumnDef<Order>[] = [
			{
				accessorKey: 'orderNumber',
				header: 'Order #',
				cell: ({ row }) => (
					<span className='text-sm font-medium text-base-content'>{row.original.orderNumber}</span>
				),
				size: 120,
			},
			{
				accessorKey: 'date',
				header: 'Date',
				cell: ({ row }) => (
					<span className='text-sm text-base-content/70'>
						{new Date(row.original.date).toLocaleDateString()}
					</span>
				),
				size: 100,
			},
		]

		if (showStatus) {
			baseColumns.push({
				accessorKey: 'status',
				header: 'Status',
				cell: ({ row }) => {
					const order = row.original
					return (
						<Badge
							{...getStatusBadgeProps(order.status)}
							size='sm'>
							{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
						</Badge>
					)
				},
				size: 100,
			})
		}

		baseColumns.push({
			accessorKey: 'total',
			header: 'Total',
			cell: ({ row }) => (
				<span className='text-sm text-right font-semibold text-base-content block'>
					${row.original.total.toFixed(2)}
				</span>
			),
			size: 90,
		})

		if (showTracking) {
			baseColumns.push({
				accessorKey: 'tracking',
				header: 'Tracking',
				cell: ({ row }) => <span className='text-sm text-base-content/60'>{row.original.tracking || '-'}</span>,
				size: 120,
			})
		}

		return baseColumns
	}, [showStatus, showTracking, getStatusBadgeProps])

	return (
		<DataGrid
			columns={columns}
			data={orders}
			ariaLabel='Order history'
		/>
	)
}
