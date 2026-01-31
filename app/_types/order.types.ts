/**
 * Order Types
 * 
 * TypeScript types for order management feature.
 * Matches backend DTOs from server/Classes/Others/OrderDTOs.cs.
 * 
 * @see prd_orders.md - Order Management PRD
 * @module order.types
 */

import type { OrderStatus } from '@_classes/Enums'
import type Order from '@_classes/Order'

// =========================================================================
// LIST & SUMMARY TYPES
// =========================================================================

/**
 * Order list item (lightweight for table display).
 * Contains only essential fields needed for orders list.
 */
export interface OrderListItem {
	/** UUID/GUID from backend */
	id: string
	orderNumber: string
	customerName: string
	customerEmail?: string
	createdAt: string
	status: OrderStatus
	total: number
	productCount: number
	assignedSalesRepId?: string
	assignedSalesRepName?: string
}

/**
 * Order dashboard summary statistics.
 * Filtered based on user role.
 */
export interface OrderSummary {
	totalOrders: number
	placedCount: number
	paidCount: number
	processingCount: number
	shippedCount: number
	deliveredCount: number
	cancelledCount: number
	totalRevenue: number
	requiresActionCount: number
}

// =========================================================================
// REQUEST TYPES
// =========================================================================

/**
 * Request DTO for confirming payment on an order.
 * Changes status from Placed → Paid.
 * 
 * @see prd_orders.md - US-ORD-003
 */
export interface ConfirmPaymentRequest {
	/** Payment reference (check #, transaction ID, etc.) */
	paymentReference?: string
	/** Optional notes about the payment */
	notes?: string
}

/**
 * Request DTO for updating order status.
 * Used by fulfillment to progress orders through workflow.
 * 
 * @see prd_orders.md - US-ORD-004, US-ORD-005
 */
export interface UpdateOrderStatusRequest {
	/** Target status */
	newStatus: OrderStatus
	/** Tracking number (required when marking as Shipped) */
	trackingNumber?: string
	/** Shipping carrier (FedEx, UPS, USPS, etc.) */
	carrier?: string
	/** Cancellation reason (required when status is Cancelled) */
	cancellationReason?: string
	/** Optional internal notes */
	internalNotes?: string
}

/**
 * Request DTO for adding tracking to an order item.
 * 
 * @see prd_orders.md - US-ORD-004
 */
export interface AddTrackingRequest {
	/** Order item ID */
	orderItemId: number
	/** Tracking number */
	trackingNumber: string
	/** Shipping carrier */
	carrier?: string
}

/**
 * Request DTO for customer cancellation request.
 * 
 * @see prd_orders.md - US-ORD-006
 */
export interface RequestCancellationRequest {
	/** Reason for cancellation */
	reason: string
}

// =========================================================================
// RESPONSE TYPES
// =========================================================================

/**
 * Response DTO for order status change operations.
 */
export interface OrderStatusChangeResult {
	success: boolean
	oldStatus: OrderStatus
	newStatus: OrderStatus
	changedAt: string
	changedBy?: string
	errorMessage?: string
}

// =========================================================================
// HOOK RETURN TYPES
// =========================================================================

/**
 * Return type for useOrderActions hook.
 * Provides order workflow operations.
 * 
 * @see useOrderActions hook
 */
export interface UseOrderActionsReturn {
	/** Confirm payment (Placed → Paid) */
	confirmPayment: (paymentReference?: string, notes?: string) => Promise<{ success: boolean }>
	/** Update order status */
	updateStatus: (
		newStatus: OrderStatus,
		trackingNumber?: string,
		carrier?: string,
		notes?: string
	) => Promise<{ success: boolean }>
	/** Add tracking to an order item */
	addTracking: (orderItemId: string, trackingNumber: string, carrier?: string) => Promise<{ success: boolean }>
	/** Request cancellation (customer) */
	requestCancellation: (reason: string) => Promise<{ success: boolean }>
	/** Cancel order (manager) */
	cancelOrder: (reason: string) => Promise<{ success: boolean }>
	/** Whether any operation is in progress */
	isProcessing: boolean
}

/**
 * Return type for useOrderDetails hook.
 * Manages order detail page state.
 */
export interface UseOrderDetailsReturn {
	/** The order being viewed */
	order: Order | null
	/** Loading state */
	isLoading: boolean
	/** Error state */
	error: Error | null
	/** Refresh order data */
	refresh: () => Promise<void>
}

// =========================================================================
// UI HELPER TYPES
// =========================================================================

/**
 * Status timeline step for order progress visualization.
 */
export interface OrderTimelineStep {
	status: OrderStatus
	label: string
	description?: string
	timestamp?: Date | null
	completedBy?: string
	isComplete: boolean
	isCurrent: boolean
}

/**
 * Order action button configuration.
 * Used to render role-appropriate action buttons.
 */
export interface OrderActionConfig {
	/** Action identifier */
	action: 'confirmPayment' | 'markProcessing' | 'markShipped' | 'markDelivered' | 'cancel' | 'requestCancellation'
	/** Button label */
	label: string
	/** Button variant */
	variant: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'ghost'
	/** Whether action is available for current status */
	available: boolean
	/** Whether action is loading */
	loading?: boolean
	/** Optional icon component */
	icon?: React.ComponentType<{ className?: string }>
	/** Confirmation message (if needed) */
	confirmMessage?: string
}

/**
 * Carrier options for shipping.
 */
export const SHIPPING_CARRIERS = [
	{ value: 'FedEx', label: 'FedEx' },
	{ value: 'UPS', label: 'UPS' },
	{ value: 'USPS', label: 'USPS' },
	{ value: 'DHL', label: 'DHL' },
	{ value: 'Other', label: 'Other' },
] as const

export type ShippingCarrier = (typeof SHIPPING_CARRIERS)[number]['value']

