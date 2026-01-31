/**
 * OrderStatusBadge Component
 *
 * Domain-specific badge for displaying order status.
 * Uses centralized OrderStatusHelper for display names and variants (FAANG pattern).
 *
 * **Architecture (3-Tier Badge System):**
 * ```
 * OrderStatusBadge (this - TIER 3)
 *    ↓ Maps OrderStatus → StatusBadge props via OrderStatusHelper
 * StatusBadge (TIER 2)
 *    ↓ Adds icon support, accessibility
 * Badge (TIER 1 - native DaisyUI 5)
 * ```
 *
 * **Features:**
 * - Order status enum from central @_classes/Enums
 * - Automatic color mapping via OrderStatusHelper.getVariant()
 * - Human-readable labels via OrderStatusHelper.getDisplay()
 * - Tooltip descriptions via OrderStatusHelper.getDescription()
 * - Full theme support (light/dark/custom themes)
 * - Zero hardcoded strings or magic values
 *
 * **Status Mapping (via OrderStatusHelper):**
 * - Cancelled (0): Error (red) - Order cancelled
 * - Pending (100): Warning (yellow) - Awaiting review
 * - WaitingCustomerApproval (200): Warning (yellow) - Quote pending
 * - Placed (300): Info (blue) - Customer confirmed
 * - Paid (350): Success (green) - Payment received
 * - Processing (400): Warning (yellow) - Being prepared
 * - Shipped (500): Info (blue) - In transit
 * - Delivered (600): Success (green) - Completed
 *
 * **Use Cases:**
 * - Order list tables
 * - Order detail pages
 * - Dashboard order summaries
 * - Customer order history
 * - Fulfillment management
 *
 * @example
 * ```tsx
 * import { OrderStatusBadge } from '@_components/common'
 * import { OrderStatus } from '@_classes/Enums'
 *
 * // Basic usage
 * <OrderStatusBadge status={OrderStatus.Pending} />
 * <OrderStatusBadge status={OrderStatus.Delivered} />
 *
 * // With numeric value from API
 * <OrderStatusBadge status={order.status} />
 *
 * // With custom className
 * <OrderStatusBadge status={OrderStatus.Shipped} className="ml-2" />
 *
 * // In a table cell
 * cell: ({ row }) => <OrderStatusBadge status={row.original.status} />
 * ```
 *
 * @see OrderStatusHelper - Status metadata
 * @see StatusBadge - Intermediate component
 * @module OrderStatusBadge
 */

import type { OrderStatus } from '@_classes/Enums'
import OrderStatusHelper from '@_classes/Helpers/OrderStatusHelper'

import StatusBadge, { type BadgeStyle, type BadgeSize } from '@_components/ui/StatusBadge'

// ============================================================================
// TYPES
// ============================================================================

/**
 * OrderStatusBadge component props interface.
 */
interface OrderStatusBadgeProps {
	/**
	 * Order status enum value (from central enum).
	 * Numeric values: Cancelled=0, Pending=100, WaitingCustomerApproval=200,
	 * Placed=300, Paid=350, Processing=400, Shipped=500, Delivered=600
	 */
	status: OrderStatus

	/**
	 * Badge visual style.
	 * @default 'solid'
	 */
	badgeStyle?: BadgeStyle

	/**
	 * Badge size.
	 * @default 'md'
	 */
	size?: BadgeSize

	/**
	 * Additional CSS classes.
	 */
	className?: string

	/**
	 * HTML data attribute for testing.
	 */
	'data-testid'?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * OrderStatusBadge Component
 *
 * Renders a colored badge with the order status label.
 * Uses OrderStatusHelper for FAANG-level type-safety and DRY compliance.
 *
 * **Implementation:**
 * - Display name: OrderStatusHelper.getDisplay(status)
 * - Badge variant: OrderStatusHelper.getVariant(status)
 * - Description: OrderStatusHelper.getDescription(status)
 * - Zero hardcoded strings or magic values
 *
 * @param props - Component props including status and className
 * @returns OrderStatusBadge component
 */
export default function OrderStatusBadge({
	status,
	badgeStyle = 'solid',
	size = 'md',
	className,
	'data-testid': testId,
}: OrderStatusBadgeProps) {
	// Get all metadata from OrderStatusHelper (zero magic strings!)
	const label = OrderStatusHelper.getDisplay(status)
	const variant = OrderStatusHelper.getVariant(status)
	const description = OrderStatusHelper.getDescription(status)

	return (
		<StatusBadge
			variant={variant}
			label={label}
			description={description}
			badgeStyle={badgeStyle}
			size={size}
			className={className}
			data-testid={testId}
		/>
	)
}
