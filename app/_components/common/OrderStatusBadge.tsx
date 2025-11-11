/**
 * OrderStatusBadge Component
 *
 * Specialized badge component for displaying order status with appropriate colors.
 * Maps order status numeric values to human-readable labels and color variants.
 * Provides consistent visual representation of order statuses throughout the app.
 *
 * **Features:**
 * - Order status enum with numeric values
 * - Automatic color mapping based on status
 * - Human-readable status labels
 * - DaisyUI Badge integration
 * - Custom className support
 * - Type-safe status handling
 *
 * **Status Mapping:**
 * - Pending (0): Warning (yellow) - Awaiting review
 * - Processing (1): Info (blue) - Being prepared
 * - Shipped (2): Primary (brand color) - In transit
 * - Delivered (3): Success (green) - Completed
 * - Cancelled (4): Error (red) - Cancelled
 *
 * **Note:**
 * This component uses a local OrderStatus enum for backward compatibility.
 * Consider migrating to use OrderStatus from @_classes/Enums and
 * OrderStatusName/OrderStatusVariants from @_classes/EnumsTranslations.
 *
 * **Use Cases:**
 * - Order list tables
 * - Order detail pages
 * - Dashboard order summaries
 * - Customer order history
 *
 * @example
 * ```tsx
 * import OrderStatusBadge, { OrderStatus } from '@_components/common/OrderStatusBadge';
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
 *     <OrderStatusBadge status={getValue() as number} />
 *   )
 * }
 *
 * // Conditional rendering based on status
 * {order.status === OrderStatus.Delivered && (
 *   <div>
 *     <OrderStatusBadge status={order.status} />
 *     <span className="ml-2">Thank you for your order!</span>
 *   </div>
 * )}
 * ```
 *
 * @module OrderStatusBadge
 */

import Badge from '@_components/ui/Badge'

/**
 * Order status enumeration.
 * Maps order statuses to numeric values for backend compatibility.
 *
 * @deprecated Consider using OrderStatus from @_classes/Enums instead.
 */
export enum OrderStatus {
	/** Order is pending review */
	Pending = 0,
	/** Order is being processed/prepared */
	Processing = 1,
	/** Order has been shipped */
	Shipped = 2,
	/** Order has been delivered */
	Delivered = 3,
	/** Order has been cancelled */
	Cancelled = 4,
}

/**
 * OrderStatusBadge component props interface.
 */
interface OrderStatusBadgeProps {
	/**
	 * Order status value (enum or number).
	 * Should match one of the OrderStatus enum values.
	 */
	status: OrderStatus | number

	/**
	 * Additional CSS classes to apply to the badge.
	 */
	className?: string
}

/**
 * OrderStatusBadge Component
 *
 * Badge component that displays order status with appropriate color and label.
 * Handles status to color/label mapping internally.
 *
 * **Status Configuration:**
 * Each status maps to:
 * - label: Human-readable text
 * - variant: Badge color variant
 *
 * **Color Meanings:**
 * - Warning (yellow): Needs attention or action
 * - Info (blue): Informational, in progress
 * - Primary (brand): Important active state
 * - Success (green): Completed successfully
 * - Error (red): Failed or cancelled
 * - Neutral (gray): Unknown or default
 *
 * @param props - Component props including status and className
 * @returns OrderStatusBadge component
 */
export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
	const getStatusConfig = (status: number) => {
		switch (status) {
			case OrderStatus.Pending:
				return { label: 'Pending', variant: 'warning' as const }
			case OrderStatus.Processing:
				return { label: 'Processing', variant: 'info' as const }
			case OrderStatus.Shipped:
				return { label: 'Shipped', variant: 'primary' as const }
			case OrderStatus.Delivered:
				return { label: 'Delivered', variant: 'success' as const }
			case OrderStatus.Cancelled:
				return { label: 'Cancelled', variant: 'error' as const }
			default:
				return { label: 'Unknown', variant: 'neutral' as const }
		}
	}

	const config = getStatusConfig(status)

	return (
		<Badge variant={config.variant} className={className}>
			{config.label}
		</Badge>
	)
}
