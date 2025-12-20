/**
 * OrderDeliveryDetails Component
 * 
 * Displays shipping/delivery information for order items.
 * Shows dropoff addresses, weights, and tracking numbers.
 * 
 * **Features:**
 * - Per-item delivery addresses
 * - Package weight display
 * - Tracking number display
 * - Conditional rendering (only shows if delivery data exists)
 * 
 * **Performance (Next.js 16 / React 19 Best Practices):**
 * - React.memo: YES - Iterates over products array, filtering and mapping
 * - Early return: YES - Avoids render when no delivery details exist
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderDeliveryDetails
 */

'use client'

import { memo } from 'react'

import type Order from '@_classes/Order'
import type { OrderItem } from '@_classes/Order'

import Card from '@_components/ui/Card'

export interface OrderDeliveryDetailsProps {
	/** The order containing delivery details */
	order: Order
}

/**
 * Order delivery details section.
 * 
 * Memoized because:
 * - Filters products array (O(n) operation)
 * - Maps over filtered items to render cards
 * - Parent re-renders shouldn't trigger expensive filtering
 * 
 * @example
 * ```tsx
 * <OrderDeliveryDetails order={order} />
 * ```
 */
export const OrderDeliveryDetails = memo(function OrderDeliveryDetails({ 
	order 
}: OrderDeliveryDetailsProps) {
	const products = order.products ?? []
	
	// Filter items with delivery information (O(n) operation)
	const itemsWithDelivery = products.filter(
		(item) => item.transitDetails?.locationDropoff
	)

	// Early return - no render cost when no delivery details
	if (itemsWithDelivery.length === 0) {
		return null
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<h3 className="text-lg font-semibold text-base-content mb-6">
				Delivery Details
			</h3>
			<div className="grid gap-4">
				{itemsWithDelivery.map((item, index) => (
					<DeliveryItemCard key={item.id ?? index} item={item} />
				))}
			</div>
		</Card>
	)
})

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL SUB-COMPONENT (not exported)
// ─────────────────────────────────────────────────────────────────────────────

interface DeliveryItemCardProps {
	item: OrderItem
}

/**
 * Individual delivery item card.
 * Not memoized: Parent is memoized, this is simple render.
 */
function DeliveryItemCard({ item }: DeliveryItemCardProps) {
	const dropoff = item.transitDetails?.locationDropoff
	
	// Defensive: Should not happen since parent filters, but safe guard
	if (!dropoff) {
		return null
	}

	// Format address - filter out empty/null parts
	const addressParts = [
		dropoff.addressOne,
		dropoff.city,
		dropoff.state,
		dropoff.zipCode,
		dropoff.country,
	].filter(Boolean)

	return (
		<div className="rounded-xl border border-base-200 bg-base-100 p-4">
			{/* Header */}
			<div className="flex justify-between text-sm text-base-content/60">
				<span>
					Shipment for{' '}
					<span className="font-semibold text-base-content">
						{item.product?.name ?? 'Product'}
					</span>
				</span>
				{item.transitDetails?.weight && (
					<span>Weight: {item.transitDetails.weight} lbs</span>
				)}
			</div>

			{/* Address */}
			<p className="mt-2 text-sm text-base-content/70">
				{addressParts.join(', ')}
			</p>

			{/* Tracking */}
			{item.trackingNumber && (
				<p className="mt-2 text-sm">
					<span className="text-base-content/60">Tracking: </span>
					<span className="font-mono font-medium">{item.trackingNumber}</span>
				</p>
			)}
		</div>
	)
}

export default OrderDeliveryDetails
