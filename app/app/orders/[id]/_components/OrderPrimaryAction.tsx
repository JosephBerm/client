/**
 * OrderPrimaryAction Component
 *
 * Contextual, single "North Star" CTA for the order workflow.
 * Maps status + permissions to the next best action.
 *
 * @module app/orders/[id]/_components/OrderPrimaryAction
 */

'use client'

import { CreditCard, Clock, Truck, CheckCircle2 } from 'lucide-react'

import { OrderStatus } from '@_classes/Enums'
import type Order from '@_classes/Order'

import Button from '@_components/ui/Button'

import type { UseOrderActionsReturn } from '@_types/order.types'

import type { UseOrderPermissionsReturn } from './hooks/useOrderPermissions'
import { ORDER_ACTION_EVENTS } from './constants'

export interface OrderPrimaryActionProps {
	order: Order
	actions: UseOrderActionsReturn
	permissions: UseOrderPermissionsReturn
}

function emitOrderActionEvent(eventName: string) {
	if (typeof window === 'undefined') {
		return
	}
	window.dispatchEvent(new CustomEvent(eventName))
}

/**
 * Single primary action CTA.
 * Returns null when no action is available.
 */
export function OrderPrimaryAction({ order, actions, permissions }: OrderPrimaryActionProps) {
	if (!order) {
		return null
	}

	if (permissions.canConfirmPayment) {
		return (
			<Button
				variant="primary"
				leftIcon={<CreditCard className="h-4 w-4" />}
				onClick={() => emitOrderActionEvent(ORDER_ACTION_EVENTS.openPayment)}
				loading={actions.isProcessing}
			>
				Confirm Payment
			</Button>
		)
	}

	if (permissions.canMarkProcessing) {
		return (
			<Button
				variant="primary"
				leftIcon={<Clock className="h-4 w-4" />}
				onClick={() => void actions.updateStatus(OrderStatus.Processing)}
				loading={actions.isProcessing}
			>
				Start Processing
			</Button>
		)
	}

	if (permissions.canMarkShipped) {
		return (
			<Button
				variant="primary"
				leftIcon={<Truck className="h-4 w-4" />}
				onClick={() => emitOrderActionEvent(ORDER_ACTION_EVENTS.openShipping)}
				loading={actions.isProcessing}
			>
				Add Tracking
			</Button>
		)
	}

	if (permissions.canMarkDelivered) {
		return (
			<Button
				variant="success"
				leftIcon={<CheckCircle2 className="h-4 w-4" />}
				onClick={() => void actions.updateStatus(OrderStatus.Delivered)}
				loading={actions.isProcessing}
			>
				Mark Delivered
			</Button>
		)
	}

	return null
}

export default OrderPrimaryAction
