/**
 * Order Totals Utilities
 *
 * Centralized helpers for computing order totals.
 * Keeps calculations DRY across header, line items, and ledger.
 *
 * @module app/orders/[id]/_components/utils/orderTotals
 */

import type Order from '@_classes/Order'

export interface OrderTotals {
	subtotal: number
	tax: number
	shipping: number
	discount: number
	grandTotal: number
}

/**
 * Compute order totals from line items and order-level fields.
 */
export function getOrderTotals(order: Order): OrderTotals {
	const products = order.products ?? []
	const subtotal = products.reduce((sum, item) => sum + (item.total ?? 0), 0)
	const tax = order.salesTax ?? 0
	const shipping = order.shipping ?? 0
	const discount = order.discount ?? 0
	const grandTotal = subtotal + tax + shipping - discount

	return { subtotal, tax, shipping, discount, grandTotal }
}
