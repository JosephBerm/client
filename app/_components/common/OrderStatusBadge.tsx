/**
 * OrderStatusBadge Component
 *
 * Specialized badge component for displaying order status with appropriate colors.
 * Uses centralized OrderStatusHelper for display names and variants (FAANG pattern).
 * 
 * **REFACTORED:** Now uses central OrderStatus enum and OrderStatusHelper
 * - ✅ No more duplicate enum definitions
 * - ✅ Zero magic strings  
 * - ✅ Type-safe with OrderStatusHelper
 * - ✅ Consistent with entire codebase
 *
 * **Features:**
 * - Order status enum from central @_classes/Enums
 * - Automatic color mapping via OrderStatusHelper.getVariant()
 * - Human-readable labels via OrderStatusHelper.getDisplay()
 * - DaisyUI Badge integration
 * - Custom className support
 * - Type-safe status handling
 *
 * **Status Mapping (via OrderStatusHelper):**
 * - Cancelled (0): Error (red)
 * - Pending (100): Warning (yellow)
 * - WaitingCustomerApproval (200): Warning (yellow)
 * - Placed (300): Info (blue)
 * - Processing (400): Warning (yellow)
 * - Shipped (500): Info (blue)
 * - Delivered (600): Success (green)
 *
 * **Use Cases:**
 * - Order list tables
 * - Order detail pages
 * - Dashboard order summaries
 * - Customer order history
 *
 * @example
 * ```tsx
 * import OrderStatusBadge from '@_components/common/OrderStatusBadge'
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
 * {
 *   accessorKey: 'status',
 *   header: 'Status',
 *   cell: ({ getValue }) => (
 *     <OrderStatusBadge status={getValue() as OrderStatus} />
 *   )
 * }
 *
 * // Conditional rendering based on status
 * {order.status === OrderStatus.Delivered && (
 *   <div>
 *     <OrderStatusBadge status={order.status} />
 *     <span>Thank you for your order!</span>
 *   </div>
 * )}
 * ```
 *
 * @module OrderStatusBadge
 */

import classNames from 'classnames'

import type { OrderStatus } from '@_classes/Enums'
import OrderStatusHelper from '@_classes/Helpers/OrderStatusHelper'

/**
 * OrderStatusBadge component props interface.
 */
interface OrderStatusBadgeProps {
	/**
	 * Order status enum value (from central enum)
	 * Numeric values: Cancelled=0, Pending=100, WaitingCustomerApproval=200,
	 * Placed=300, Processing=400, Shipped=500, Delivered=600
	 */
	status: OrderStatus

	/**
	 * Optional additional CSS classes
	 */
	className?: string
}

/**
 * OrderStatusBadge Component
 *
 * Renders a colored badge with the order status label.
 * Uses OrderStatusHelper for FAANG-level type-safety and DRY compliance.
 *
 * **Implementation:**
 * - Display name: OrderStatusHelper.getDisplay(status)
 * - Badge variant: OrderStatusHelper.getVariant(status)
 * - Zero hardcoded strings or magic values
 *
 * **DaisyUI Badge Variants:**
 * - success: Green background (Delivered)
 * - error: Red background (Cancelled)
 * - warning: Yellow/orange background (Pending, WaitingCustomerApproval, Processing)
 * - info: Blue background (Placed, Shipped)
 *
 * @param props - Component props including status and className
 * @returns OrderStatusBadge component
 */
export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	// Get display name and variant from OrderStatusHelper (zero magic strings!)
	const displayName = OrderStatusHelper.getDisplay(status)
	const variant = OrderStatusHelper.getVariant(status)

	return (
		<span
			className={classNames(
				'badge',
				{
					'badge-success': variant === 'success',
					'badge-error': variant === 'error',
					'badge-warning': variant === 'warning',
					'badge-info': variant === 'info',
				},
				className
			)}
		>
			{displayName}
		</span>
	)
}
