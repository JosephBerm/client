/**
 * Order Detail Constants
 *
 * Centralized constants for order detail interactions.
 *
 * @module app/orders/[id]/_components/constants
 */

export const ORDER_ACTION_EVENTS = {
	openPayment: 'orders:action:open-payment',
	openShipping: 'orders:action:open-shipping',
	openCancel: 'orders:action:open-cancel',
} as const
