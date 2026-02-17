/**
 * Orders List Page
 *
 * Displays a paginated, sortable list of orders with role-based columns.
 * Uses RichDataGrid for advanced data grid features.
 *
 * **Role-Based Features:**
 * - Customer: View own orders (limited columns)
 * - SalesRep: View assigned customers' orders + Customer column
 * - Fulfillment: View all orders + Processing/Shipping columns
 * - SalesManager/Admin: View all orders + All columns + Summary stats
 *
 * **Features (Phase 2.3 Migration):**
 * - RichDataGrid with global search and sorting
 * - Server-side pagination via /orders/search/rich endpoint
 * - Status filtering with faceted counts
 * - Role-based column visibility
 *
 * @see RICHDATAGRID_MIGRATION_PLAN.md - Phase 2.3
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/page
 */

'use client'

import Link from 'next/link'

import classNames from 'classnames'
import { Download, Eye, FileSpreadsheet, Package, Plus, Truck } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { formatDate, formatCurrency, API, notificationService, usePermissions, RoleLevels } from '@_shared'

import { OrderStatus } from '@_classes/Enums'

import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	BulkActionVariant,
	type BulkAction,
	type RowId,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult, RichColumnDef } from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import Surface from '@_components/ui/Surface'

import { InternalPageHeader } from '../_components'

/**
 * Order interface for RichDataGrid display
 * Extends the base Order class with additional display properties
 * from backend API response
 */
interface OrderRow {
	id?: number
	customerId?: number
	customerName?: string
	total: number
	status: number
	createdAt: string | Date
	shippingAddress?: string
	assignedSalesRepName?: string
	paymentConfirmedAt?: string | Date | null
	shippedAt?: string | Date | null
	deliveredAt?: string | Date | null
	trackingNumber?: string
}

export default function OrdersPage() {
	const user = useAuthStore((state) => state.user)

	// RBAC: Use usePermissions hook for role-based checks
	const { isCustomer, isSalesRepOrAbove, isFulfillmentCoordinatorOrAbove, isSalesManagerOrAbove, roleLevel } =
		usePermissions()

	// Role checks using usePermissions() hook
	const role = roleLevel ?? RoleLevels.Customer
	const isSalesRep = isSalesRepOrAbove && !isSalesManagerOrAbove
	const isFulfillment = isFulfillmentCoordinatorOrAbove && !isSalesRepOrAbove
	const isManager = isSalesManagerOrAbove
	const canCreateOrders = isManager

	/**
	 * Fetcher for RichDataGrid - React Compiler auto-memoizes this function.
	 * @see NEXTJS16_OPTIMIZATION_PLAN.md - Priority 1
	 */
	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<OrderRow>> => {
		const response = await API.Orders.richSearch(filter)

		if (response.data?.statusCode === 200 && response.data.payload) {
			return response.data.payload as unknown as RichPagedResult<OrderRow>
		}

		const statusCode = response.data?.statusCode ?? response.status
		const message = response.data?.message ?? 'Failed to load orders'
		throw new Error(`${message} (status: ${statusCode})`)
	}

	// Column helper for type-safe column definitions
	const columnHelper = createRichColumnHelper<OrderRow>()

	/**
	 * Column definitions with role-based visibility.
	 * React Compiler auto-memoizes based on dependency tracking.
	 * @see NEXTJS16_OPTIMIZATION_PLAN.md - Priority 1
	 */
	const columns: RichColumnDef<OrderRow, unknown>[] = (() => {
		const baseColumns: RichColumnDef<OrderRow, unknown>[] = [
			// Order ID - Text filter
			columnHelper.accessor('id', {
				header: 'Order #',
				filterType: FilterType.Number,
				cell: ({ row }) => (
					<Link
						href={Routes.Orders.detail(row.original.id ?? 0)}
						className='link link-primary font-semibold'>
						#{row.original.id}
					</Link>
				),
			}),
		]

		// Customer column for staff roles
		if (!isCustomer) {
			baseColumns.push(
				columnHelper.accessor('customerName', {
					header: 'Customer',
					filterType: FilterType.Text,
					searchable: true,
					cell: ({ row }) => (
						<div className='flex flex-col'>
							<span className='font-medium'>{row.original.customerName ?? 'N/A'}</span>
							<span className='text-xs text-base-content/60'>ID: {row.original.customerId}</span>
						</div>
					),
				})
			)
		}

		// Sales Rep column for managers and fulfillment
		if (isManager || isFulfillment) {
			baseColumns.push(
				columnHelper.accessor('assignedSalesRepName', {
					header: 'Sales Rep',
					filterType: FilterType.Text,
					cell: ({ row }) => (
						<span className='text-sm text-base-content/80'>{row.original.assignedSalesRepName ?? '—'}</span>
					),
				})
			)
		}

		// Total column - Number filter
		baseColumns.push(
			columnHelper.accessor('total', {
				header: 'Total',
				filterType: FilterType.Number,
				cell: ({ row }) => <span className='font-semibold'>{formatCurrency(row.original.total ?? 0)}</span>,
			})
		)

		// Status column - Select filter, faceted
		baseColumns.push(
			columnHelper.accessor('status', {
				header: 'Status',
				filterType: FilterType.Select,
				faceted: true,
				cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
			})
		)

		// Payment confirmed column for SalesRep and above
		if (isSalesRep || isManager) {
			baseColumns.push(
				columnHelper.accessor('paymentConfirmedAt', {
					header: 'Payment',
					filterType: FilterType.Date,
					cell: ({ row }) => {
						const order = row.original
						if (order.status === OrderStatus.Placed) {
							return <span className='badge badge-warning badge-sm'>Awaiting Payment</span>
						}
						if (order.paymentConfirmedAt) {
							return <span className='text-xs text-success'>{formatDate(order.paymentConfirmedAt)}</span>
						}
						return <span className='text-base-content/40'>—</span>
					},
				})
			)
		}

		// Shipping column for fulfillment and managers
		if (isFulfillment || isManager) {
			baseColumns.push(
				columnHelper.accessor('shippedAt', {
					header: 'Shipped',
					filterType: FilterType.Date,
					cell: ({ row }) => {
						const order = row.original
						if (order.status === OrderStatus.Processing) {
							return <span className='badge badge-info badge-sm'>In Processing</span>
						}
						if (order.shippedAt) {
							return (
								<div className='flex flex-col'>
									<span className='text-xs'>{formatDate(order.shippedAt)}</span>
									{order.trackingNumber && (
										<span className='text-xs text-base-content/60 font-mono'>
											{order.trackingNumber}
										</span>
									)}
								</div>
							)
						}
						return <span className='text-base-content/40'>—</span>
					},
				})
			)
		}

		// Created date column - Date filter
		baseColumns.push(
			columnHelper.accessor('createdAt', {
				header: 'Created',
				filterType: FilterType.Date,
				cell: ({ row }) => (
					<span className='text-sm text-base-content/70'>{formatDate(row.original.createdAt)}</span>
				),
			})
		)

		// Actions column - Display only
		baseColumns.push(
			columnHelper.display({
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<div className='flex items-center gap-1'>
						<Link href={Routes.Orders.detail(row.original.id ?? 0)}>
							<Button
								variant='ghost'
								size='sm'
								title='View Order'>
								<Eye className='w-4 h-4' />
							</Button>
						</Link>
					</div>
				),
			})
		)

		return baseColumns
	})()

	// Page description based on role - simple conditional, no memoization needed
	const pageDescription = isCustomer
		? 'View and track your orders'
		: isSalesRep
		? 'View orders for your assigned customers'
		: isFulfillment
		? 'Process and fulfill pending orders'
		: 'Manage all orders in the system'

	return (
		<>
			<InternalPageHeader
				title='Orders'
				description={pageDescription}
				actions={
					canCreateOrders && (
						<Link href={Routes.Orders.create()}>
							<Button
								variant='primary'
								leftIcon={<Plus className='w-5 h-5' />}>
								Create Order
							</Button>
						</Link>
					)
				}
			/>

			{/* Status Quick Filters (for staff) */}
			{!isCustomer && (
				<div className='flex flex-wrap gap-3 mb-6'>
					<QuickFilterCard
						label='Processing'
						icon={<Package className='w-4 h-4' />}
						variant='info'
					/>
					<QuickFilterCard
						label='Ready to Ship'
						icon={<Truck className='w-4 h-4' />}
						variant='warning'
					/>
				</div>
			)}

			<Surface variant='subtle' padding='lg'>
					<RichDataGrid<OrderRow>
						columns={columns}
						fetcher={fetcher}
						defaultPageSize={10}
						defaultSorting={[
							{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending },
						]}
						enableGlobalSearch
						enableColumnFilters
						enableRowSelection={isManager}
						enableColumnResizing
						bulkActions={
							isManager
								? ([
										{
											id: 'export-csv',
											label: 'Export CSV',
											icon: <Download className='w-4 h-4' />,
											variant: BulkActionVariant.Default,
											onAction: async (rows: OrderRow[]) => {
												const headers = 'Order ID,Customer,Total,Status,Created\n'
												const csv = rows
													.map(
														(r) =>
															`${r.id},"${r.customerName ?? ''}",${r.total},${
																r.status
															},"${formatDate(r.createdAt)}"`
													)
													.join('\n')
												const blob = new Blob([headers + csv], { type: 'text/csv' })
												const url = URL.createObjectURL(blob)
												const a = document.createElement('a')
												a.href = url
												a.download = `orders-export-${
													new Date().toISOString().split('T')[0]
												}.csv`
												a.click()
												URL.revokeObjectURL(url)
												notificationService.success(`Exported ${rows.length} orders`)
											},
										},
								  ] satisfies BulkAction<OrderRow>[])
								: undefined
						}
						searchPlaceholder='Search orders by customer...'
						persistStateKey='orders-grid'
						emptyState={
							<div className='flex flex-col items-center gap-3 py-12'>
								<Package className='w-12 h-12 text-base-content/30' />
								<p className='text-base-content/60'>No orders found</p>
								<p className='text-sm text-base-content/40'>
									{isCustomer
										? 'Your orders will appear here once placed.'
										: 'Orders matching your filters will appear here.'}
								</p>
							</div>
						}
						ariaLabel='Orders table'
					/>
			</Surface>
		</>
	)
}

/**
 * Quick filter card for common status filters.
 *
 * Uses Button component with outline variant and custom color overrides
 * to create filter chip styling while maintaining consistent UX patterns.
 */
interface QuickFilterCardProps {
	label: string
	icon: React.ReactNode
	variant?: 'info' | 'warning' | 'success' | 'error'
	active?: boolean
	onClick?: () => void
}

function QuickFilterCard({ label, icon, variant = 'info', active = false, onClick }: QuickFilterCardProps) {
	/**
	 * Variant-specific styles for filter chips.
	 * Uses DaisyUI semantic color tokens with opacity modifiers.
	 */
	const variantStyles = {
		info: classNames(
			'border-info/30 text-info',
			active ? 'bg-info/20 border-info/60 ring-2 ring-info/20' : 'bg-info/5 hover:bg-info/15 hover:border-info/50'
		),
		warning: classNames(
			'border-warning/30 text-warning',
			active
				? 'bg-warning/20 border-warning/60 ring-2 ring-warning/20'
				: 'bg-warning/5 hover:bg-warning/15 hover:border-warning/50'
		),
		success: classNames(
			'border-success/30 text-success',
			active
				? 'bg-success/20 border-success/60 ring-2 ring-success/20'
				: 'bg-success/5 hover:bg-success/15 hover:border-success/50'
		),
		error: classNames(
			'border-error/30 text-error',
			active
				? 'bg-error/20 border-error/60 ring-2 ring-error/20'
				: 'bg-error/5 hover:bg-error/15 hover:border-error/50'
		),
	}

	return (
		<Button
			variant='outline'
			size='sm'
			onClick={onClick}
			leftIcon={icon}
			aria-pressed={active}
			className={classNames(
				// Reset outline variant defaults, apply chip styles
				'border shadow-none hover:shadow-none',
				// Variant-specific colors
				variantStyles[variant]
			)}>
			{label}
		</Button>
	)
}
