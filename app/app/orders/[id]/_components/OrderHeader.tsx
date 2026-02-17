/**
 * OrderHeader Component
 *
 * Displays order header information including order number, status badge,
 * and high-level metadata with a contextual CTA slot.
 *
 * **Features:**
 * - Order number and creation date
 * - Status badge with color coding
 * - High-level order value summary
 * - Contextual primary action (slot)
 * - Sales rep assignment (for staff)
 *
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderHeader
 */

'use client'

import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { AlertCircle, Calendar, Package } from 'lucide-react'

import { useEntitySyncStatus, useIntegrationConnections } from '@_features/integrations'

import { formatCurrency, formatDate } from '@_shared'

import { OrderStatusHelper } from '@_classes/Helpers'
import type Order from '@_classes/Order'


import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import SyncStatusBadge, { type SyncState } from '@_components/common/SyncStatusBadge'
import Card from '@_components/ui/Card'



import { getOrderTotals } from './utils/orderTotals'

export interface OrderHeaderProps {
	/** The order to display */
	order: Order
	/** Whether to show sales rep info (staff only) */
	showSalesRep?: boolean
	/** Optional primary action (contextual CTA) */
	primaryAction?: ReactNode
}

/**
 * Order header component with order info and financial summary.
 *
 * @example
 * ```tsx
 * <OrderHeader
 *   order={order}
 *   showSalesRep={user.role >= AccountRole.SalesRep}
 * />
 * ```
 */
export function OrderHeader({
	order,
	showSalesRep = false,
	primaryAction,
}: OrderHeaderProps) {
	const totals = useMemo(() => getOrderTotals(order), [order])

	const orderDate = order?.createdAt ? formatDate(order.createdAt) : '-'
	const statusDescription = OrderStatusHelper.getDescription(order.status)

	// Check if order is synced to ERP (PRD Reference: Customer view - sync status indicators)
	const { data: connections, error: connectionsError } = useIntegrationConnections()
	const { data: syncMapping, error: syncMappingError } = useEntitySyncStatus('Order', order?.id)

	const hasActiveConnection = connections?.some(c => c.isActive) ?? false
	const hasSyncStatusError = !!connectionsError || !!syncMappingError

	const syncState: SyncState = useMemo(() => {
		if (!hasActiveConnection) {
			return 'not_synced'
		}
		if (!syncMapping) {
			return 'pending'
		}
		return 'synced'
	}, [hasActiveConnection, syncMapping])

	return (
		<Card className="border border-base-200 bg-base-100 p-5 shadow-sm">
			{/* Header Row */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
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
					<p className="mt-2 text-sm text-base-content/60" title={statusDescription}>
						{statusDescription}
					</p>
					{hasSyncStatusError && (
						<p className="mt-2 inline-flex items-center gap-1 text-xs text-warning">
							<AlertCircle className="h-3 w-3" />
							ERP sync status unavailable. Please retry.
						</p>
					)}
				</div>
				<div className="flex flex-col items-end gap-3 text-right">
					<div className="flex items-center gap-2 text-sm text-base-content/60">
						<Calendar className="w-4 h-4" />
						<span>Created {orderDate}</span>
					</div>
					{primaryAction && <div className="w-full sm:w-auto">{primaryAction}</div>}
				</div>
			</div>

			{/* Meta Row */}
			<div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs font-semibold uppercase text-base-content/60">
						<Package className="w-4 h-4" />
						<span>Items</span>
					</div>
					<p className="text-sm font-semibold text-base-content">
						{order.products?.length ?? 0} items
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase text-base-content/60">Order Value</p>
					<p className="text-sm font-semibold text-base-content">
						{formatCurrency(totals.grandTotal)}
					</p>
				</div>
				{showSalesRep && (
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase text-base-content/60">Sales Rep</p>
						<p className="text-sm font-semibold text-base-content">
							{/* TODO: Show sales rep name when available */}
							{order.customer ? 'Assigned' : 'Unassigned'}
						</p>
					</div>
				)}
			</div>
		</Card>
	)
}

export default OrderHeader

