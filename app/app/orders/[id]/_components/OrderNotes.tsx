/**
 * OrderNotes Component
 * 
 * Displays order notes in a card format.
 * Preserves whitespace formatting.
 * 
 * **Features:**
 * - Preserves newlines/whitespace
 * - Conditional rendering (only shows if notes exist)
 * - Consistent card styling
 * 
 * **Performance Notes (Next.js 16 / React 19):**
 * - NOT memoized: Simple component with minimal render cost
 * - Early return pattern for null case provides sufficient optimization
 * - React 19's automatic optimizations handle simple component re-renders
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderNotes
 */

'use client'

import Card from '@_components/ui/Card'

export interface OrderNotesProps {
	/** Order notes content */
	notes: string | null | undefined
	/** Card title (default: "Order Notes") */
	title?: string
}

/**
 * Order notes display component.
 * Only renders if notes are provided.
 * 
 * @example
 * ```tsx
 * <OrderNotes notes={order.notes} />
 * <OrderNotes notes={order.notes} title="Internal Notes" />
 * ```
 */
export function OrderNotes({ 
	notes, 
	title = 'Order Notes' 
}: OrderNotesProps) {
	// Don't render if no notes - early return for performance
	if (!notes) {
		return null
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			<h3 className="text-sm font-semibold uppercase text-base-content/60 mb-3">
				{title}
			</h3>
			<p className="text-sm text-base-content/70 whitespace-pre-wrap">
				{notes}
			</p>
		</Card>
	)
}

export default OrderNotes
