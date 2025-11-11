/**
 * Enum Translation Maps
 * 
 * Provides human-readable translations and UI variants for OrderStatus enum values.
 * Maps enum values to display names and badge/chip color variants for consistent styling.
 * 
 * **Maps:**
 * - **OrderStatusName**: Enum value → Display name
 * - **OrderStatusVariants**: Enum value → Badge variant (color/styling)
 * 
 * **Benefits:**
 * - Centralized display name management
 * - Consistent UI styling across components
 * - Easy to update all instances of status display
 * - Type-safe with enum keys
 * 
 * @example
 * ```typescript
 * import { OrderStatus } from '@_classes/Enums';
 * import { OrderStatusName, OrderStatusVariants } from '@_classes/EnumsTranslations';
 * 
 * // Display order status name
 * const statusName = OrderStatusName[order.status];
 * console.log(statusName); // e.g., "Awaiting Customer Approval"
 * 
 * // Display order status badge
 * const variant = OrderStatusVariants[order.status];
 * <Badge variant={variant}>{OrderStatusName[order.status]}</Badge>
 * 
 * // Order status table column
 * {
 *   accessorKey: 'status',
 *   header: 'Status',
 *   cell: ({ getValue }) => {
 *     const status = getValue() as OrderStatus;
 *     return (
 *       <Badge variant={OrderStatusVariants[status]}>
 *         {OrderStatusName[status]}
 *       </Badge>
 *     );
 *   }
 * }
 * ```
 * 
 * @module EnumsTranslations
 */

import { OrderStatus } from '@_classes/Enums'

/**
 * OrderStatusName Map
 * 
 * Maps OrderStatus enum values to human-readable display names.
 * Used throughout the UI to display order status in a user-friendly format.
 * 
 * **Status Names:**
 * - Pending: "Pending"
 * - WaitingCustomerApproval: "Awaiting Customer Approval"
 * - Placed: "Placed"
 * - Processing: "Processing"
 * - Shipped: "Shipped"
 * - Delivered: "Delivered"
 * - Cancelled: "Cancelled"
 */
export const OrderStatusName = {
	[OrderStatus.Pending]: 'Pending',
	[OrderStatus.WaitingCustomerApproval]: 'Awaiting Customer Approval',
	[OrderStatus.Placed]: 'Placed',
	[OrderStatus.Processing]: 'Processing',
	[OrderStatus.Shipped]: 'Shipped',
	[OrderStatus.Delivered]: 'Delivered',
	[OrderStatus.Cancelled]: 'Cancelled',
}

/**
 * OrderStatusVariants Map
 * 
 * Maps OrderStatus enum values to Badge component variant names.
 * Determines the color/styling of status badges for visual differentiation.
 * 
 * **Variant Mapping:**
 * - **Pending**: warning (yellow/orange - needs attention)
 * - **WaitingCustomerApproval**: warning (yellow/orange - awaiting action)
 * - **Placed**: info (blue - informational)
 * - **Processing**: warning (yellow/orange - in progress)
 * - **Shipped**: info (blue - informational)
 * - **Delivered**: success (green - completed successfully)
 * - **Cancelled**: error (red - cancelled/failed)
 * 
 * **Variant Types:**
 * - `warning`: Yellow/orange for statuses requiring attention or in progress
 * - `info`: Blue for informational statuses
 * - `success`: Green for successful/completed statuses
 * - `error`: Red for cancelled or failed statuses
 * 
 * **Usage with Badge Component:**
 * The variant values match the Badge component's variant prop:
 * `<Badge variant="success">Delivered</Badge>`
 */
export const OrderStatusVariants = {
	[OrderStatus.Pending]: 'warning',
	[OrderStatus.WaitingCustomerApproval]: 'warning',
	[OrderStatus.Placed]: 'info',
	[OrderStatus.Processing]: 'warning',
	[OrderStatus.Shipped]: 'info',
	[OrderStatus.Delivered]: 'success',
	[OrderStatus.Cancelled]: 'error',
}
