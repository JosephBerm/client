/**
 * OrderQuickInfo Component
 * 
 * Displays quick reference information about an order.
 * Shows IDs and high-level status.
 * 
 * **Features:**
 * - Order ID
 * - Customer ID
 * - High-level status indicator
 * 
 * **Performance Notes (Next.js 16 / React 19):**
 * - NOT memoized: Simple component with minimal render cost
 * - Pure function helpers extracted outside component
 * - React 19's automatic optimizations handle simple component re-renders
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderQuickInfo
 */

'use client'

import { OrderStatus } from '@_classes/Enums'
import type Order from '@_classes/Order'

import { useAdminView } from '@_shared'

import Card from '@_components/ui/Card'

export interface OrderQuickInfoProps {
	/** The order to display info for */
	order: Order
}

/**
 * Order quick info sidebar card.
 * 
 * @example
 * ```tsx
 * <OrderQuickInfo order={order} />
 * ```
 */
export function OrderQuickInfo({ order }: OrderQuickInfoProps) {
	const { isAdminViewActive } = useAdminView()

	// Determine high-level status
	const statusLabel = getHighLevelStatus(order.status)

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<h3 className="text-sm font-semibold uppercase text-base-content/60 mb-4">
				Quick Info
			</h3>
			<div className="space-y-3 text-sm">
				<InfoRow label="Order ID" value={`#${order.id}`} mono />
				{isAdminViewActive && <InfoRow label="Customer ID" value={`#${order.customerId}`} mono />}
				<InfoRow label="Status" value={statusLabel} />
			</div>
		</Card>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// PURE HELPERS (defined outside component to avoid recreation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get high-level status label.
 * Pure function - no side effects.
 */
function getHighLevelStatus(status: OrderStatus): string {
	switch (status) {
		case OrderStatus.Cancelled:
			return 'Cancelled'
		case OrderStatus.Delivered:
			return 'Completed'
		default:
			return 'Active'
	}
}

/**
 * Info row sub-component.
 * Pure presentational component.
 */
function InfoRow({ 
	label, 
	value, 
	mono = false 
}: { 
	label: string
	value: string | number | null | undefined
	mono?: boolean 
}) {
	return (
		<div className="flex justify-between">
			<span className="text-base-content/70">{label}</span>
			<span className={`font-medium ${mono ? 'font-mono' : ''}`}>
				{value ?? '—'}
			</span>
		</div>
	)
}

export default OrderQuickInfo
