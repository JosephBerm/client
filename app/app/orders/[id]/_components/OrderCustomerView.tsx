/**
 * OrderCustomerView Component
 *
 * Simplified customer-facing view for order details.
 * Optimized for clarity and minimal actions.
 *
 * @module app/orders/[id]/_components/OrderCustomerView
 */

'use client'

import type Order from '@_classes/Order'

import { OrderPaymentSection } from '@_features/payments'

import { OrderHeader } from './OrderHeader'
import { OrderLineItems } from './OrderLineItems'
import { OrderTimeline } from './OrderTimeline'
import { OrderDeliveryDetails } from './OrderDeliveryDetails'
import { OrderActions } from './OrderActions'
import { OrderNotes } from './OrderNotes'

import type { UseOrderActionsReturn } from '@_types/order.types'
import type { UseOrderPermissionsReturn } from './hooks/useOrderPermissions'

export interface OrderCustomerViewProps {
	order: Order
	actions: UseOrderActionsReturn
	permissions: UseOrderPermissionsReturn
}

export function OrderCustomerView({ order, actions, permissions }: OrderCustomerViewProps) {
	return (
		<div className="space-y-6">
			<OrderTimeline order={order} compact />

			<OrderHeader order={order} />

			<OrderActions order={order} actions={actions} permissions={permissions} />

			<OrderLineItems order={order} />

			{order.id && (
				<OrderPaymentSection
					orderId={order.id}
					totalAmountCents={Math.round(order.total * 100)}
					canPayByCard
					canRecordPayment={false}
					canRefund={false}
				/>
			)}

			<OrderDeliveryDetails order={order} />

			<OrderNotes notes={order.notes} />
		</div>
	)
}

export default OrderCustomerView
