/**
 * OrderHeader Component
 *
 * Displays order header information including order number, status badge,
 * customer information, and financial summary.
 *
 * **Features:**
 * - Order number and creation date
 * - Status badge with color coding
 * - Customer name and contact
 * - Financial summary (subtotal, tax, shipping, discount, total)
 * - Sales rep assignment (for staff)
 *
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderHeader
 */

'use client'

import { useMemo } from 'react'

import { Calendar, Package, User, DollarSign, Truck } from 'lucide-react'

import { formatCurrency, formatDate } from '@_shared'

import { OrderStatusHelper } from '@_classes/Helpers'

import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import SyncStatusBadge, { type SyncState } from '@_components/common/SyncStatusBadge'
import Card from '@_components/ui/Card'

import { useEntitySyncStatus, useIntegrationConnections } from '@_features/integrations'

import type Order from '@_classes/Order'

export interface OrderHeaderProps {
	/** The order to display */
	order: Order
	/** Whether to show sales rep info (staff only) */
	showSalesRep?: boolean
	/** Whether to show internal notes (staff only) */
	showInternalNotes?: boolean
}

/**
 * Order header component with order info and financial summary.
 *
 * @example
 * ```tsx
 * <OrderHeader
 *   order={order}
 *   showSalesRep={user.role >= AccountRole.SalesRep}
 *   showInternalNotes={user.role >= AccountRole.SalesRep}
 * />
 * ```
 */
export function OrderHeader({
	order,
	showSalesRep = false,
	showInternalNotes = false,
}: OrderHeaderProps) {
	// Calculate financial totals
	const subtotal = useMemo(() => {
		if (!order?.products?.length) return 0
		return order.products.reduce((sum, item) => sum + (item.total ?? 0), 0)
	}, [order?.products])

	const total = useMemo(() => {
		if (!order) return 0
		return subtotal + (order.salesTax ?? 0) + (order.shipping ?? 0) - (order.discount ?? 0)
	}, [order, subtotal])

	const orderDate = order?.createdAt ? formatDate(order.createdAt) : '-'
	const statusDescription = OrderStatusHelper.getDescription(order.status)

	// Check if order is synced to ERP (PRD Reference: Customer view - sync status indicators)
	const { data: connections } = useIntegrationConnections()
	const { data: syncMapping } = useEntitySyncStatus('Order', order?.id)

	const hasActiveConnection = connections?.some(c => c.isActive) ?? false

	const syncState: SyncState = useMemo(() => {
		if (!hasActiveConnection) return 'not_synced'
		if (!syncMapping) return 'pending'
		return 'synced'
	}, [hasActiveConnection, syncMapping])

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			{/* Header Row */}
			<div className="flex flex-wrap items-start justify-between gap-4 mb-6">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<h2 className="text-2xl font-bold text-base-content">
							Order #{order.id}
						</h2>
						<OrderStatusBadge status={order.status} />
						{hasActiveConnection && (
							<SyncStatusBadge
								state={syncState}
								provider={syncMapping?.provider}
								lastSyncAt={syncMapping?.lastSyncAt}
								compact
							/>
						)}
					</div>
					<p className="text-sm text-base-content/60" title={statusDescription}>
						{statusDescription}
					</p>
				</div>
				<div className="text-right text-sm text-base-content/60">
					<div className="flex items-center gap-2 justify-end">
						<Calendar className="w-4 h-4" />
						<span>Created {orderDate}</span>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Customer Information */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-semibold uppercase text-base-content/60">
						<User className="w-4 h-4" />
						<span>Customer</span>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-base-content">
							{order.customer?.name || 'Unassigned customer'}
						</p>
						{order.customer?.email && (
							<p className="text-sm text-base-content/70">{order.customer.email}</p>
						)}
						{order.customer?.phone && (
							<p className="text-sm text-base-content/70">{order.customer.phone}</p>
						)}
					</div>
				</div>

				{/* Order Info */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-semibold uppercase text-base-content/60">
						<Package className="w-4 h-4" />
						<span>Order Details</span>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-base-content/70">Products</span>
							<span className="font-medium">{order.products?.length ?? 0} items</span>
						</div>
						{showSalesRep && (
							<div className="flex justify-between">
								<span className="text-base-content/70">Sales Rep</span>
								<span className="font-medium">
									{/* TODO: Show sales rep name when available */}
									{order.customer ? 'Assigned' : 'Unassigned'}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Financial Summary */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-semibold uppercase text-base-content/60">
						<DollarSign className="w-4 h-4" />
						<span>Financial Summary</span>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-base-content/70">Subtotal</span>
							<span className="font-medium">{formatCurrency(subtotal)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-base-content/70">Sales Tax</span>
							<span className="font-medium">{formatCurrency(order.salesTax ?? 0)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-base-content/70">Shipping</span>
							<span className="font-medium">{formatCurrency(order.shipping ?? 0)}</span>
						</div>
						{order.discount > 0 && (
							<div className="flex justify-between">
								<span className="text-base-content/70">Discount</span>
								<span className="font-medium text-success">-{formatCurrency(order.discount)}</span>
							</div>
						)}
						<div className="flex justify-between border-t border-base-200 pt-2">
							<span className="font-semibold">Total</span>
							<span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Shipping Information (if available) */}
			{order.products?.some(item => item.trackingNumber) && (
				<div className="mt-6 pt-6 border-t border-base-200">
					<div className="flex items-center gap-2 text-sm font-semibold uppercase text-base-content/60 mb-3">
						<Truck className="w-4 h-4" />
						<span>Shipping</span>
					</div>
					<div className="flex flex-wrap gap-4">
						{order.products
							.filter(item => item.trackingNumber)
							.map((item, index) => (
								<div key={item.id ?? index} className="text-sm">
									<span className="text-base-content/70">
										{item.product?.name || 'Product'}:
									</span>{' '}
									<span className="font-medium font-mono">{item.trackingNumber}</span>
								</div>
							))}
					</div>
				</div>
			)}

			{/* Notes Section */}
			{order.notes && (
				<div className="mt-6 pt-6 border-t border-base-200">
					<h4 className="text-sm font-semibold uppercase text-base-content/60 mb-2">
						Order Notes
					</h4>
					<p className="text-sm text-base-content/70 whitespace-pre-wrap">
						{order.notes}
					</p>
				</div>
			)}

			{/* Internal Notes (staff only) */}
			{showInternalNotes && (
				<div className="mt-6 pt-6 border-t border-base-200">
					<h4 className="text-sm font-semibold uppercase text-base-content/60 mb-2">
						Internal Notes
					</h4>
					{/* Note: internalNotes would need to be added to frontend Order class */}
					<p className="text-sm text-base-content/70 italic">
						No internal notes available
					</p>
				</div>
			)}
		</Card>
	)
}

export default OrderHeader

