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

import { useCallback, useMemo } from 'react'

import Link from 'next/link'

import { Eye, Package, Plus, Truck } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { formatDate, formatCurrency, API } from '@_shared'

import { AccountRole, OrderStatus } from '@_classes/Enums'

import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult, RichColumnDef } from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

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
	// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
	const role = user?.roleLevel ?? AccountRole.Customer

	// Role checks
	const isCustomer = role === AccountRole.Customer
	const isSalesRep = role === AccountRole.SalesRep
	const isFulfillment = role === AccountRole.FulfillmentCoordinator
	const isManager = role >= AccountRole.SalesManager
	const canCreateOrders = isManager

	// Fetcher for RichDataGrid
	const fetcher = useCallback(
		async (filter: RichSearchFilter): Promise<RichPagedResult<OrderRow>> => {
			const response = await API.Orders.richSearch(filter)

			if (response.data?.payload) {
				return response.data.payload as unknown as RichPagedResult<OrderRow>
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
	const columnHelper = createRichColumnHelper<OrderRow>()

	// Column definitions with role-based visibility
	const columns: RichColumnDef<OrderRow, unknown>[] = useMemo(() => {
		const baseColumns: RichColumnDef<OrderRow, unknown>[] = [
			// Order ID - Text filter
			columnHelper.accessor('id', {
				header: 'Order #',
				filterType: FilterType.Number,
				cell: ({ row }) => (
					<Link
						href={Routes.Orders.detail(row.original.id ?? 0)}
						className="link link-primary font-semibold"
					>
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
						<div className="flex flex-col">
							<span className="font-medium">{row.original.customerName ?? 'N/A'}</span>
							<span className="text-xs text-base-content/60">ID: {row.original.customerId}</span>
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
						<span className="text-sm text-base-content/80">
							{row.original.assignedSalesRepName ?? '—'}
						</span>
					),
				})
			)
		}

		// Total column - Number filter
		baseColumns.push(
			columnHelper.accessor('total', {
				header: 'Total',
				filterType: FilterType.Number,
				cell: ({ row }) => (
					<span className="font-semibold">
						{formatCurrency(row.original.total ?? 0)}
					</span>
				),
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
							return (
								<span className="badge badge-warning badge-sm">Awaiting Payment</span>
							)
						}
						if (order.paymentConfirmedAt) {
							return (
								<span className="text-xs text-success">
									{formatDate(order.paymentConfirmedAt)}
								</span>
							)
						}
						return <span className="text-base-content/40">—</span>
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
							return <span className="badge badge-info badge-sm">In Processing</span>
						}
						if (order.shippedAt) {
							return (
								<div className="flex flex-col">
									<span className="text-xs">{formatDate(order.shippedAt)}</span>
									{order.trackingNumber && (
										<span className="text-xs text-base-content/60 font-mono">
											{order.trackingNumber}
										</span>
									)}
								</div>
							)
						}
						return <span className="text-base-content/40">—</span>
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
					<span className="text-sm text-base-content/70">
						{formatDate(row.original.createdAt)}
					</span>
				),
			})
		)

		// Actions column - Display only
		baseColumns.push(
			columnHelper.display({
				id: 'actions',
				header: 'Actions',
				cell: ({ row }) => (
					<div className="flex items-center gap-1">
						<Link href={Routes.Orders.detail(row.original.id ?? 0)}>
							<Button variant="ghost" size="sm" title="View Order">
								<Eye className="w-4 h-4" />
							</Button>
						</Link>
					</div>
				),
			})
		)

		return baseColumns
	}, [isCustomer, isSalesRep, isFulfillment, isManager, columnHelper])

	// Page description based on role
	const pageDescription = useMemo(() => {
		if (isCustomer) {
			return 'View and track your orders'
		}
		if (isSalesRep) {
			return 'View orders for your assigned customers'
		}
		if (isFulfillment) {
			return 'Process and fulfill pending orders'
		}
		return 'Manage all orders in the system'
	}, [isCustomer, isSalesRep, isFulfillment])

	return (
		<>
			<InternalPageHeader
				title="Orders"
				description={pageDescription}
				actions={
					canCreateOrders && (
						<Link href={Routes.Orders.create()}>
							<Button variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
								Create Order
							</Button>
						</Link>
					)
				}
			/>

			{/* Status Quick Filters (for staff) */}
			{!isCustomer && (
				<div className="flex flex-wrap gap-3 mb-6">
					<QuickFilterCard
						label="Processing"
						icon={<Package className="w-4 h-4" />}
						variant="info"
					/>
					<QuickFilterCard
						label="Ready to Ship"
						icon={<Truck className="w-4 h-4" />}
						variant="warning"
					/>
				</div>
			)}

			<Card className="border border-base-300 bg-base-100 shadow-sm">
				<div className="p-6">
					<RichDataGrid<OrderRow>
						columns={columns}
						fetcher={fetcher}
						defaultPageSize={10}
						defaultSorting={[{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending }]}
						enableGlobalSearch
						searchPlaceholder="Search orders by customer..."
						persistStateKey="orders-grid"
						emptyState={
							<div className="flex flex-col items-center gap-3 py-12">
								<Package className="w-12 h-12 text-base-content/30" />
								<p className="text-base-content/60">No orders found</p>
								<p className="text-sm text-base-content/40">
									{isCustomer
										? 'Your orders will appear here once placed.'
										: 'Orders matching your filters will appear here.'}
								</p>
							</div>
						}
						ariaLabel="Orders table"
					/>
				</div>
			</Card>
		</>
	)
}

/**
 * Quick filter card for common status filters
 */
interface QuickFilterCardProps {
	label: string
	icon: React.ReactNode
	variant?: 'info' | 'warning' | 'success' | 'error'
}

function QuickFilterCard({ label, icon, variant = 'info' }: QuickFilterCardProps) {
	const variantClasses = {
		info: 'border-info/30 bg-info/10 text-info hover:bg-info/20',
		warning: 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20',
		success: 'border-success/30 bg-success/10 text-success hover:bg-success/20',
		error: 'border-error/30 bg-error/10 text-error hover:bg-error/20',
	}

	return (
		<Button
			variant="ghost"
			className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${variantClasses[variant]}`}
		>
			{icon}
			<span className="font-medium text-sm">{label}</span>
		</Button>
	)
}
