/**
 * OrderCustomerIntelligence Component
 *
 * Customer context panel for the Intelligence Sidebar.
 * Displays key contact details and identifiers.
 *
 * @module app/orders/[id]/_components/OrderCustomerIntelligence
 */

'use client'

import type Order from '@_classes/Order'

import Card from '@_components/ui/Card'

export interface OrderCustomerIntelligenceProps {
	order: Order
}

export function OrderCustomerIntelligence({ order }: OrderCustomerIntelligenceProps) {
	const customer = order.customer

	return (
		<Card className="border border-base-200 bg-base-100 p-6 shadow-sm">
			<h3 className="text-sm font-semibold uppercase text-base-content/60 mb-4">
				Customer Intelligence
			</h3>

			<div className="space-y-3 text-sm">
				<InfoRow label="Customer" value={customer?.name || 'Unassigned'} />
				<InfoRow label="Email" value={customer?.email} />
				<InfoRow label="Phone" value={customer?.phone} />
				<InfoRow label="Customer ID" value={order.customerId ? `#${order.customerId}` : '—'} mono />
			</div>
		</Card>
	)
}

function InfoRow({
	label,
	value,
	mono = false,
}: {
	label: string
	value?: string | null
	mono?: boolean
}) {
	return (
		<div className="flex justify-between gap-3">
			<span className="text-base-content/70">{label}</span>
			<span className={`font-medium ${mono ? 'font-mono' : ''}`}>
				{value || '—'}
			</span>
		</div>
	)
}

export default OrderCustomerIntelligence
