/**
 * Fulfillment Queue Page
 *
 * Dedicated page for Fulfillment Coordinators to process and ship orders.
 * Displays orders ready for fulfillment (status: Paid, Processing).
 *
 * **Features:**
 * - Filtered order queue (Paid/Processing status)
 * - Quick actions (Process, Ship, Add Tracking)
 * - Order detail panel on selection
 * - Bulk actions for efficiency
 *
 * **Role Access:**
 * - FulfillmentCoordinator (Level 2000): Full access
 * - SalesManager+ (Level 4000+): Full access
 * - Others: Redirected or access denied
 *
 * **Next.js 16 Optimization:**
 * - Client Component for interactivity
 * - Uses RichDataGrid for server-side pagination
 * - React Compiler auto-memoizes callbacks
 *
 * **Route**: /app/fulfillment
 *
 * @module app/fulfillment/page
 */

'use client'

import Link from 'next/link'

import { Eye, Package, Truck } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import {
	formatDate,
	formatCurrency,
	API,
	notificationService,
	usePermissions,
	RoleLevels,
	useAdminView,
} from '@_shared'

import { OrderStatus } from '@_classes/Enums'

import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	type RichSearchFilter,
	type RichPagedResult,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../_components'

/**
 * Order interface for RichDataGrid display
 */
interface OrderRow {
	id?: number
	customerId?: string | number | null
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

export default function FulfillmentQueuePage() {
	const user = useAuthStore((state) => state.user)
	const { isAdminViewActive } = useAdminView()

	// RBAC: Only FulfillmentCoordinator+ can access
	const { isFulfillmentCoordinatorOrAbove, isSalesManagerOrAbove } = usePermissions()

	const canAccess = isFulfillmentCoordinatorOrAbove || isSalesManagerOrAbove

	// Access denied for non-fulfillment roles
	if (!canAccess) {
		return (
			<>
				<InternalPageHeader
					title='Access Denied'
					description='You do not have permission to access the fulfillment queue.'
				/>
				<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
					<p className='text-base-content/70'>
						Only Fulfillment Coordinators and Sales Managers can access this page.
					</p>
				</Card>
			</>
		)
	}

	/**
	 * Fetcher for RichDataGrid - Filters orders by fulfillment-ready status
	 * React Compiler auto-memoizes this function.
	 */
	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<OrderRow>> => {
		// Add status filter to only show orders ready for fulfillment
		// Status: Paid (2) or Processing (3)
		const fulfillmentStatuses = [OrderStatus.Paid, OrderStatus.Processing]

		// Add status filter to the request
		const enrichedFilter = {
			...filter,
			columnFilters: [
				...(filter.columnFilters || []),
				{
					columnId: createColumnId('status'),
					filterType: FilterType.Select,
					operator: 'in',
					value: fulfillmentStatuses,
				},
			],
		}

		const response = await API.Orders.richSearch(enrichedFilter)

		if (response.data?.payload) {
			const payload = response.data.payload as unknown as RichPagedResult<
				OrderRow & { customer?: { name?: string | null } | null }
			>
			return {
				...payload,
				data: payload.data.map((row) => ({
					...row,
					customerName: row.customerName ?? row.customer?.name ?? 'N/A',
					customerId: row.customerId ?? null,
				})),
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
	}

	// Column helper for type-safe column definitions
	const columnHelper = createRichColumnHelper<OrderRow>()

	/**
	 * Column definitions optimized for fulfillment workflow.
	 * React Compiler auto-memoizes based on dependency tracking.
	 */
	const columns: RichColumnDef<OrderRow, unknown>[] = [
		// Order ID - Link to detail
		columnHelper.accessor('id', {
			header: 'Order #',
			filterType: FilterType.Number,
			cell: ({ row }) => (
				<Link
					href={Routes.Orders.detail(row.original.id ?? 0)}
					className='link link-primary font-semibold'
					data-testid='order-link'>
					#{row.original.id}
				</Link>
			),
		}),

		// Customer column
		columnHelper.accessor('customerName', {
			header: 'Customer',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className='flex flex-col'>
					<span className='font-medium'>{row.original.customerName ?? 'N/A'}</span>
					{isAdminViewActive && row.original.customerId && (
						<span className='text-xs text-base-content/60'>ID: {row.original.customerId}</span>
					)}
				</div>
			),
		}),

		// Status column - Select filter
		columnHelper.accessor('status', {
			header: 'Status',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
		}),

		// Total column
		columnHelper.accessor('total', {
			header: 'Total',
			filterType: FilterType.Number,
			cell: ({ row }) => <span className='font-semibold'>{formatCurrency(row.original.total ?? 0)}</span>,
		}),

		// Payment confirmed column
		columnHelper.accessor('paymentConfirmedAt', {
			header: 'Payment',
			filterType: FilterType.Date,
			cell: ({ row }) => {
				const order = row.original
				if (order.paymentConfirmedAt) {
					return <span className='text-xs text-success'>{formatDate(order.paymentConfirmedAt)}</span>
				}
				return <span className='badge badge-warning badge-sm'>Awaiting Payment</span>
			},
		}),

		// Shipping column
		columnHelper.accessor('shippedAt', {
			header: 'Shipping',
			filterType: FilterType.Date,
			cell: ({ row }) => {
				const order = row.original
				if (order.status === OrderStatus.Processing) {
					return <span className='badge badge-info badge-sm'>Ready to Ship</span>
				}
				if (order.shippedAt) {
					return (
						<div className='flex flex-col'>
							<span className='text-xs'>{formatDate(order.shippedAt)}</span>
							{order.trackingNumber && (
								<span className='text-xs text-base-content/60 font-mono'>{order.trackingNumber}</span>
							)}
						</div>
					)
				}
				return <span className='text-base-content/40'>—</span>
			},
		}),

		// Created date column
		columnHelper.accessor('createdAt', {
			header: 'Created',
			filterType: FilterType.Date,
			cell: ({ row }) => (
				<span className='text-sm text-base-content/70'>{formatDate(row.original.createdAt)}</span>
			),
		}),

		// Actions column
		columnHelper.display({
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<div className='flex items-center gap-1'>
					<Link href={Routes.Orders.detail(row.original.id ?? 0)}>
						<Button
							variant='ghost'
							size='sm'
							title='View Order'
							data-testid='view-order-btn'>
							<Eye className='w-4 h-4' />
						</Button>
					</Link>
				</div>
			),
		}),
	]

	return (
		<>
			<InternalPageHeader
				title='Fulfillment Queue'
				description='Process and ship orders ready for fulfillment. Orders are filtered to show only Paid and Processing status.'
			/>

			{/* Fulfillment Queue Grid */}
			<Card>
				<div className='card-body p-3 sm:p-6'>
					<div data-testid='order-queue'>
						<RichDataGrid<OrderRow>
							columns={columns}
							fetcher={fetcher}
							filterKey='fulfillment-queue'
							defaultPageSize={25}
							defaultSorting={[
								{ columnId: createColumnId('createdAt'), direction: SortDirection.Ascending },
							]}
							enableGlobalSearch
							enableColumnFilters
							enableRowSelection={false}
							enableColumnResizing
							searchPlaceholder='Search orders by order number or customer name...'
							persistStateKey='fulfillment-queue-grid'
							emptyState={
								<div className='flex flex-col items-center gap-3 py-12'>
									<Package className='w-12 h-12 text-base-content/40' />
									<p className='text-base-content/60 font-medium'>No orders ready for fulfillment</p>
									<p className='text-sm text-base-content/40'>
										Orders will appear here when they are paid and ready to be processed.
									</p>
								</div>
							}
							ariaLabel='Fulfillment queue'
						/>
					</div>
				</div>
			</Card>
		</>
	)
}
