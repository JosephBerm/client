/**
 * useOrderPermissions Hook - MAANG-Level Permission Management
 * 
 * Centralizes all permission logic for the Order Details page.
 * Wraps the generic `usePermissions` hook to provide order-specific,
 * context-aware permission flags.
 * 
 * **Features:**
 * - Context-aware permissions (Own, Assigned, Team, All)
 * - Memoized for performance (prevents unnecessary re-renders)
 * - Type-safe with full TypeScript support
 * - DRY principle (single source of truth for order permissions)
 * - Follows existing `useQuotePermissions` pattern
 * 
 * **Permission Contexts:**
 * - Own: Customer viewing their own order
 * - Assigned: SalesRep viewing assigned order
 * - All: Fulfillment/Manager/Admin viewing any order
 * 
 * @see prd_orders.md - Order Management PRD
 * @see useQuotePermissions - Pattern reference
 * @module app/orders/[id]/_components/hooks/useOrderPermissions
 */

'use client'

import { useMemo } from 'react'

import { usePermissions, Resources, Actions, Contexts, RoleLevels } from '@_shared/hooks/usePermissions'

import { OrderStatus } from '@_classes/Enums'
import type Order from '@_classes/Order'

/**
 * Return type for useOrderPermissions hook
 */
export interface UseOrderPermissionsReturn {
	/** Can view this order (hierarchical: Own -> Assigned -> All) */
	canView: boolean
	/** Can update this order (context-aware: Own -> Assigned -> All) */
	canUpdate: boolean
	/** Can confirm payment (SalesRep+ for assigned, Manager+ for all) */
	canConfirmPayment: boolean
	/** Can update tracking (Fulfillment+, SalesRep+ for assigned) */
	canUpdateTracking: boolean
	/** Can mark as Processing (Fulfillment+) */
	canMarkProcessing: boolean
	/** Can mark as Shipped (Fulfillment+, requires tracking) */
	canMarkShipped: boolean
	/** Can mark as Delivered (Fulfillment+) */
	canMarkDelivered: boolean
	/** Can cancel order (Manager+ only) */
	canCancel: boolean
	/** Can request cancellation (Customer for own orders) */
	canRequestCancellation: boolean
	/** Can delete order (Admin only) */
	canDelete: boolean
	/** Can add internal notes (SalesRep+ only) */
	canAddInternalNotes: boolean
	/** Whether user is staff (SalesRep+) */
	isStaff: boolean
	/** Whether user is fulfillment or above */
	isFulfillmentOrAbove: boolean
	/** Context flags for debugging/analytics */
	context: {
		isOwnOrder: boolean
		isAssignedOrder: boolean
	}
}

/**
 * Custom hook for order-specific permissions
 * 
 * Provides memoized boolean flags for all order-related actions.
 * Context-aware: permissions depend on order ownership, assignment, and user role.
 * 
 * **Permission Hierarchy:**
 * 1. Customer: Can view/request cancellation for own orders only
 * 2. SalesRep: Can confirm payment for assigned orders
 * 3. Fulfillment: Can update status (Processing, Shipped, Delivered)
 * 4. SalesManager: Can cancel orders, all other actions
 * 5. Admin: Full access including delete
 * 
 * @param order - The order entity (null if not loaded)
 * @returns Memoized permission flags and context
 * 
 * @example
 * ```tsx
 * const { canView, canConfirmPayment, canCancel, context } = useOrderPermissions(order)
 * 
 * if (!canView) {
 *   return <AccessDenied />
 * }
 * 
 * {canConfirmPayment && order.status === OrderStatus.Placed && (
 *   <Button onClick={handleConfirmPayment}>Confirm Payment</Button>
 * )}
 * ```
 */
export function useOrderPermissions(order: Order | null): UseOrderPermissionsReturn {
	const { user, roleLevel, hasPermission, hasMinimumRole, isSalesRepOrAbove, isSalesManagerOrAbove, isFulfillmentCoordinatorOrAbove } = usePermissions()

	// Memoize all permission checks for efficiency
	const permissions = useMemo(() => {
		// Early return if no user or order
		if (!user || !order) {
			return {
				canView: false,
				canUpdate: false,
				canConfirmPayment: false,
				canUpdateTracking: false,
				canMarkProcessing: false,
				canMarkShipped: false,
				canMarkDelivered: false,
				canCancel: false,
				canRequestCancellation: false,
				canDelete: false,
				canAddInternalNotes: false,
				isStaff: false,
				isFulfillmentOrAbove: false,
				context: {
					isOwnOrder: false,
					isAssignedOrder: false,
				},
			}
		}

		// Determine context for the current order
		// Check if order belongs to user's customer account
		const isOwnOrder = user.customerId
			? user.customerId === order.customerId
			: false

		// Compare assignedSalesRepId as strings (backend stores as string, user.id is string|null)
		// Note: Order class may not have assignedSalesRepId property yet - handle defensively
		const orderAsAny = order as unknown as { assignedSalesRepId?: string | null }
		const isAssignedOrder = orderAsAny.assignedSalesRepId != null && user.id != null
			? String(orderAsAny.assignedSalesRepId) === String(user.id)
			: false

		const isStaff = hasMinimumRole(RoleLevels.SalesRep)
		const isFulfillmentOrAbove = isFulfillmentCoordinatorOrAbove
		
		// Per PRD prd_orders.md: Fulfillment tasks are restricted to Fulfillment, SalesManager, Admin
		// SalesRep CANNOT process fulfillment (add tracking, mark shipped, etc.)
		const hasFulfillmentPermissions = 
			roleLevel === RoleLevels.FulfillmentCoordinator ||
			isSalesManagerOrAbove

		// View Permissions (Hierarchical: Own -> Assigned -> All)
		const canView =
			(isOwnOrder && hasPermission(Resources.Orders, Actions.Read, Contexts.Own)) ||
			(isAssignedOrder && hasPermission(Resources.Orders, Actions.Read, Contexts.Assigned)) ||
			hasPermission(Resources.Orders, Actions.Read, Contexts.All)

		// Update Permissions (Context-aware: Own -> Assigned -> All)
		const canUpdateOwn = isOwnOrder && hasPermission(Resources.Orders, Actions.Update, Contexts.Own)
		const canUpdateAssigned = isAssignedOrder && hasPermission(Resources.Orders, Actions.Update, Contexts.Assigned)
		const canUpdateAll = hasPermission(Resources.Orders, Actions.Update, Contexts.All)
		const canUpdate = canUpdateOwn || canUpdateAssigned || canUpdateAll

		// Status-specific checks
		const isPlaced = order.status === OrderStatus.Placed
		const isPaid = order.status === OrderStatus.Paid
		const isProcessing = order.status === OrderStatus.Processing
		const isShipped = order.status === OrderStatus.Shipped
		const isCancelled = order.status === OrderStatus.Cancelled
		const isDelivered = order.status === OrderStatus.Delivered
		// Note: OrderStatus.Cancelled = 0 (falsy), so we can't use !order.status
		const canModifyStatus = !isCancelled && !isDelivered

		// Confirm Payment: SalesRep+ for assigned, Manager+ for all
		const canConfirmPayment =
			isPlaced &&
			(
				(isAssignedOrder && isSalesRepOrAbove) ||
				isSalesManagerOrAbove
			)

		// Update Tracking: Per PRD - Fulfillment, SalesManager, Admin only
		// SalesRep CANNOT process fulfillment (add tracking) per prd_orders.md
		const canUpdateTracking =
			canModifyStatus && hasFulfillmentPermissions

		// Status Transitions: Fulfillment, SalesManager, Admin only (NOT SalesRep per PRD)
		const canMarkProcessing = isPaid && hasFulfillmentPermissions
		const canMarkShipped = isProcessing && hasFulfillmentPermissions
		const canMarkDelivered = isShipped && hasFulfillmentPermissions

		// Cancel: Manager+ only, not after shipped
		const canCancel =
			isSalesManagerOrAbove &&
			canModifyStatus &&
			order.status !== OrderStatus.Shipped

		// Request Cancellation: Customer for own orders (Placed or Paid only)
		const canRequestCancellation =
			isOwnOrder &&
			(isPlaced || isPaid) &&
			!isStaff

		// Delete: Admin only
		const canDelete = hasPermission(Resources.Orders, Actions.Delete)

		// Internal Notes: SalesRep+ only
		const canAddInternalNotes = isStaff

		return {
			canView,
			canUpdate,
			canConfirmPayment,
			canUpdateTracking,
			canMarkProcessing,
			canMarkShipped,
			canMarkDelivered,
			canCancel,
			canRequestCancellation,
			canDelete,
			canAddInternalNotes,
			isStaff,
			isFulfillmentOrAbove,
			context: {
				isOwnOrder,
				isAssignedOrder,
			},
		}
	}, [user, order, roleLevel, hasPermission, hasMinimumRole, isSalesRepOrAbove, isSalesManagerOrAbove, isFulfillmentCoordinatorOrAbove])

	return permissions
}

export default useOrderPermissions

