/**
 * OrderActions Component
 * 
 * Role-based action buttons for order workflow operations.
 * Shows appropriate actions based on user role and order status.
 * 
 * **Actions by Role:**
 * - **Customer**: Request cancellation (Placed, Paid only)
 * - **SalesRep**: Confirm payment (Placed → Paid)
 * - **Fulfillment**: Mark Processing, Shipped, Delivered
 * - **SalesManager+**: Cancel order, all other actions
 * 
 * **REFACTORED:** Now uses useOrderPermissions hook for DRY role checks.
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderActions
 */

'use client'

import { useState } from 'react'

import {
	CreditCard,
	Package,
	Truck,
	CheckCircle2,
	XCircle,
	Clock,
	AlertTriangle,
} from 'lucide-react'

import { OrderStatus } from '@_classes/Enums'
import { OrderStatusHelper } from '@_classes/Helpers'
import type Order from '@_classes/Order'

import FormInput from '@_components/forms/FormInput'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Modal from '@_components/ui/Modal'
import Select from '@_components/ui/Select'

import { SHIPPING_CARRIERS, type UseOrderActionsReturn } from '@_types/order.types'

import type { UseOrderPermissionsReturn } from './hooks/useOrderPermissions'

export interface OrderActionsProps {
	/** The order to display actions for */
	order: Order
	/** Order actions from useOrderActions hook */
	actions: UseOrderActionsReturn
	/** Order permissions from useOrderPermissions hook */
	permissions: UseOrderPermissionsReturn
}

/**
 * Order actions component with role-based buttons.
 * Uses useOrderPermissions for DRY permission checking.
 * 
 * @example
 * ```tsx
 * const actions = useOrderActions(order, refresh)
 * const permissions = useOrderPermissions(order)
 * <OrderActions order={order} actions={actions} permissions={permissions} />
 * ```
 */
export function OrderActions({ order, actions, permissions }: OrderActionsProps) {
	// Modal states
	const [showPaymentModal, setShowPaymentModal] = useState(false)
	const [showShipModal, setShowShipModal] = useState(false)
	const [showCancelModal, setShowCancelModal] = useState(false)
	
	// Form states
	const [paymentReference, setPaymentReference] = useState('')
	const [paymentNotes, setPaymentNotes] = useState('')
	const [trackingNumber, setTrackingNumber] = useState('')
	const [carrier, setCarrier] = useState('')
	const [shippingNotes, setShippingNotes] = useState('')
	const [cancellationReason, setCancellationReason] = useState('')

	// Use permissions hook for DRY role checks
	const {
		canConfirmPayment,
		canMarkProcessing,
		canMarkShipped,
		canMarkDelivered,
		canCancel,
		canRequestCancellation,
	} = permissions

	// Check if any actions are available
	const hasActions = canConfirmPayment || canMarkProcessing || canMarkShipped || 
		canMarkDelivered || canCancel || canRequestCancellation

	// Handlers
	const handleConfirmPayment = async () => {
		const result = await actions.confirmPayment(paymentReference || undefined, paymentNotes || undefined)
		if (result.success) {
			setShowPaymentModal(false)
			setPaymentReference('')
			setPaymentNotes('')
		}
	}

	const handleMarkProcessing = async () => {
		await actions.updateStatus(OrderStatus.Processing)
	}

	const handleMarkShipped = async () => {
		if (!trackingNumber) {
			return
		}
		const result = await actions.updateStatus(
			OrderStatus.Shipped,
			trackingNumber,
			carrier || undefined,
			shippingNotes || undefined
		)
		if (result.success) {
			setShowShipModal(false)
			setTrackingNumber('')
			setCarrier('')
			setShippingNotes('')
		}
	}

	const handleMarkDelivered = async () => {
		await actions.updateStatus(OrderStatus.Delivered)
	}

	const handleCancel = async () => {
		if (!cancellationReason) {
			return
		}
		
		let result
		if (canRequestCancellation) {
			result = await actions.requestCancellation(cancellationReason)
		} else {
			result = await actions.cancelOrder(cancellationReason)
		}
		
		if (result.success) {
			setShowCancelModal(false)
			setCancellationReason('')
		}
	}

	// If no actions available or order is terminal, show info message
	if (!hasActions) {
		const isTerminal = OrderStatusHelper.isTerminal(order.status)
		if (isTerminal) {
			return (
				<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
					<div className="flex items-center gap-3 text-base-content/60">
						<CheckCircle2 className="w-5 h-5" />
						<span>
							This order is {OrderStatusHelper.getDisplay(order.status).toLowerCase()} and requires no further action.
						</span>
					</div>
				</Card>
			)
		}
		return null
	}

	return (
		<>
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
				<h3 className="text-sm font-semibold uppercase text-base-content/60 mb-4">
					Available Actions
				</h3>

				<div className="flex flex-wrap gap-3">
					{/* Confirm Payment */}
					{canConfirmPayment && (
						<Button
							variant="primary"
							leftIcon={<CreditCard className="w-4 h-4" />}
							onClick={() => setShowPaymentModal(true)}
							loading={actions.isProcessing}
						>
							Confirm Payment
						</Button>
					)}

					{/* Mark Processing */}
					{canMarkProcessing && (
						<Button
							variant="secondary"
							leftIcon={<Clock className="w-4 h-4" />}
							onClick={() => void handleMarkProcessing()}
							loading={actions.isProcessing}
						>
							Mark Processing
						</Button>
					)}

					{/* Mark Shipped */}
					{canMarkShipped && (
						<Button
							variant="secondary"
							leftIcon={<Truck className="w-4 h-4" />}
							onClick={() => setShowShipModal(true)}
							loading={actions.isProcessing}
						>
							Mark Shipped
						</Button>
					)}

					{/* Mark Delivered */}
					{canMarkDelivered && (
						<Button
							variant="success"
							leftIcon={<Package className="w-4 h-4" />}
							onClick={() => void handleMarkDelivered()}
							loading={actions.isProcessing}
						>
							Mark Delivered
						</Button>
					)}

					{/* Cancel / Request Cancellation */}
					{(canCancel || canRequestCancellation) && (
						<Button
							variant="error"
							leftIcon={<XCircle className="w-4 h-4" />}
							onClick={() => setShowCancelModal(true)}
							loading={actions.isProcessing}
						>
							{canRequestCancellation ? 'Request Cancellation' : 'Cancel Order'}
						</Button>
					)}
				</div>

				{/* Next status hint */}
				<div className="mt-4 text-sm text-base-content/60">
					<span className="font-medium">Current Status:</span>{' '}
					{OrderStatusHelper.getDisplay(order.status)}
					{!OrderStatusHelper.isTerminal(order.status) && (
						<>
							{' → '}
							<span className="font-medium">
								Next: {OrderStatusHelper.getDisplay(OrderStatusHelper.getNextStatus(order.status) ?? order.status)}
							</span>
						</>
					)}
				</div>
			</Card>

			{/* Payment Confirmation Modal */}
			<Modal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				title="Confirm Payment"
			>
				<div className="space-y-4">
					<p className="text-sm text-base-content/70">
						Confirm that payment has been received for this order. This will move the order to &quot;Paid&quot; status.
					</p>
					
					<FormInput
						label="Payment Reference (Optional)"
						placeholder="Check #, Transaction ID, etc."
						value={paymentReference}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentReference(e.target.value)}
					/>
					
					<FormInput
						label="Notes (Optional)"
						placeholder="Add any notes about the payment"
						value={paymentNotes}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentNotes(e.target.value)}
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button 
							variant="ghost" 
							onClick={() => setShowPaymentModal(false)}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={() => void handleConfirmPayment()}
							loading={actions.isProcessing}
						>
							Confirm Payment
						</Button>
					</div>
				</div>
			</Modal>

			{/* Shipping Modal */}
			<Modal
				isOpen={showShipModal}
				onClose={() => setShowShipModal(false)}
				title="Mark as Shipped"
			>
				<div className="space-y-4">
					<p className="text-sm text-base-content/70">
						Enter tracking information to mark this order as shipped.
					</p>
					
					<FormInput
						label="Tracking Number"
						placeholder="Enter tracking number"
						value={trackingNumber}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrackingNumber(e.target.value)}
						required
					/>
					
					<Select
						value={carrier}
						onChange={(e) => setCarrier(e.target.value)}
						options={SHIPPING_CARRIERS.map((c) => ({ value: c.value, label: c.label }))}
						placeholder="Select carrier..."
						aria-label="Shipping Carrier"
					/>
					
					<FormInput
						label="Notes (Optional)"
						placeholder="Add shipping notes"
						value={shippingNotes}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShippingNotes(e.target.value)}
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button 
							variant="ghost" 
							onClick={() => setShowShipModal(false)}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={() => void handleMarkShipped()}
							loading={actions.isProcessing}
							disabled={!trackingNumber}
						>
							Mark Shipped
						</Button>
					</div>
				</div>
			</Modal>

			{/* Cancel/Cancellation Request Modal */}
			<Modal
				isOpen={showCancelModal}
				onClose={() => setShowCancelModal(false)}
				title={canRequestCancellation ? 'Request Cancellation' : 'Cancel Order'}
			>
				<div className="space-y-4">
					<div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
						<AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
						<p className="text-sm text-base-content/70">
							{canRequestCancellation
								? 'Your cancellation request will be reviewed by our team. You will be notified once it has been processed.'
								: 'This action cannot be undone. The order will be permanently cancelled.'}
						</p>
					</div>
					
					<FormInput
						label="Cancellation Reason"
						placeholder="Please provide a reason for cancellation"
						value={cancellationReason}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCancellationReason(e.target.value)}
						required
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button 
							variant="ghost" 
							onClick={() => setShowCancelModal(false)}
						>
							Go Back
						</Button>
						<Button
							variant="error"
							onClick={() => void handleCancel()}
							loading={actions.isProcessing}
							disabled={!cancellationReason}
						>
							{canRequestCancellation ? 'Submit Request' : 'Cancel Order'}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}

export default OrderActions

