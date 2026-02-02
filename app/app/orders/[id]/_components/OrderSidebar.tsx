/**
 * OrderSidebar Component
 * 
 * Composes sidebar components for the order detail page.
 * Provides a cohesive sidebar layout with actions, timeline, notes, and info.
 * 
 * **Composition Pattern:**
 * This component follows the Composition pattern, orchestrating child components
 * while keeping each focused on a single responsibility.
 * 
 * **Child Components:**
 * - OrderActions: Role-based workflow buttons
 * - OrderNotes: Order notes display
 * - OrderQuickInfo: Quick reference stats
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/OrderSidebar
 */

'use client'

import type Order from '@_classes/Order'

import type { UseOrderActionsReturn } from '@_types/order.types'

import { OrderActions } from './OrderActions'
import { OrderNotes } from './OrderNotes'
import { OrderQuickInfo } from './OrderQuickInfo'

import type { UseOrderPermissionsReturn } from './hooks/useOrderPermissions'

export interface OrderSidebarProps {
	/** The order to display */
	order: Order
	/** Order workflow actions */
	actions: UseOrderActionsReturn
	/** Order permissions */
	permissions: UseOrderPermissionsReturn
}

/**
 * Order sidebar composition component.
 * Arranges all sidebar elements in proper order.
 * 
 * @example
 * ```tsx
 * <OrderSidebar 
 *   order={order} 
 *   actions={actions} 
 *   permissions={permissions} 
 * />
 * ```
 */
export function OrderSidebar({ order, actions, permissions }: OrderSidebarProps) {
	return (
		<div className="space-y-6">
			{/* Actions Card - Most important, at top */}
			<OrderActions order={order} actions={actions} permissions={permissions} />

			{/* Order Notes - Contextual information */}
			<OrderNotes notes={order.notes} />

			{/* Quick Info - Reference data */}
			<OrderQuickInfo order={order} />
		</div>
	)
}

export default OrderSidebar
