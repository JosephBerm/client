/**
 * OrderStatusHelper - FAANG-Level Enum Helper
 * 
 * Centralized metadata and helper functions for OrderStatus enum.
 * Follows industry best practices from Google, Netflix, and Stripe.
 * 
 * **Pattern:**
 * - Exhaustive metadata map with Record<OrderStatus, Metadata>
 * - TypeScript enforces completeness (adding enum value requires metadata)
 * - Single source of truth for all status-related properties
 * - Static helper methods for type-safe access
 * 
 * **Features:**
 * - Display names (human-readable)
 * - Badge variants (for UI styling)
 * - Descriptions (for tooltips/help text)
 * - Sort order (for filtering/ordering)
 * - Category grouping (active vs. completed vs. cancelled)
 * 
 * **Benefits:**
 * - Zero magic strings
 * - Type-safe metadata access
 * - Easy to extend (add new properties to interface)
 * - Self-documenting (toList for dropdowns)
 * - Testable (unit test each helper method)
 * 
 * **FAANG Principles:**
 * - Exhaustive mapping (Google TypeScript Style)
 * - Helper class pattern (Netflix)
 * - Type-safe checks (Stripe)
 * - No magic strings (Airbnb ESLint)
 * 
 * @example
 * ```typescript
 * import OrderStatusHelper from '@_classes/Helpers/OrderStatusHelper'
 * import { OrderStatus } from '@_classes/Enums'
 * 
 * // Get display name
 * const name = OrderStatusHelper.getDisplay(OrderStatus.Pending)
 * // → "Pending"
 * 
 * // Get badge variant
 * const variant = OrderStatusHelper.getVariant(OrderStatus.Shipped)
 * // → "info"
 * 
 * // Get description
 * const desc = OrderStatusHelper.getDescription(OrderStatus.WaitingCustomerApproval)
 * // → "Order is awaiting customer approval and payment"
 * 
 * // Render in component
 * <Badge variant={OrderStatusHelper.getVariant(order.status)}>
 *   {OrderStatusHelper.getDisplay(order.status)}
 * </Badge>
 * 
 * // Populate dropdown
 * <FormSelect
 *   options={OrderStatusHelper.toList.map(meta => ({
 *     value: meta.value,
 *     label: meta.display,
 *   }))}
 * />
 * 
 * // Filter by category
 * const activeStatuses = OrderStatusHelper.getActiveStatuses()
 * // → [OrderStatus.Pending, OrderStatus.Placed, OrderStatus.Processing, OrderStatus.Shipped]
 * 
 * // Check if status is terminal
 * const isComplete = OrderStatusHelper.isTerminal(order.status)
 * // → true if Delivered or Cancelled
 * ```
 * 
 * @module Helpers/OrderStatusHelper
 */

import { OrderStatus } from '../Enums'

/**
 * Badge variant types for OrderStatus
 * Maps to DaisyUI badge and custom Badge component variants
 */
export type OrderStatusVariant = 'success' | 'error' | 'warning' | 'info'

/**
 * Status category for grouping and filtering
 */
export type OrderStatusCategory = 'pending' | 'active' | 'completed' | 'cancelled'

/**
 * Complete metadata for an OrderStatus enum value
 * 
 * **Properties:**
 * - **value**: The enum value itself
 * - **display**: Human-readable display name
 * - **variant**: Badge color variant for UI
 * - **description**: Detailed description for tooltips/help
 * - **sortOrder**: Numeric order for sorting (matches enum value)
 * - **category**: Status category for filtering
 * - **isTerminal**: Whether this status is final (no further changes)
 * - **allowedTransitions**: Valid next statuses (for validation)
 */
export interface OrderStatusMetadata {
	/** Enum value */
	value: OrderStatus
	/** Human-readable display name */
	display: string
	/** Badge variant for UI styling */
	variant: OrderStatusVariant
	/** Detailed description */
	description: string
	/** Sort order (matches enum numeric value) */
	sortOrder: number
	/** Status category */
	category: OrderStatusCategory
	/** Whether this is a terminal status */
	isTerminal: boolean
	/** Valid next statuses (for workflow validation) */
	allowedTransitions: OrderStatus[]
}

/**
 * Exhaustive metadata map for OrderStatus enum
 * 
 * TypeScript enforces: If you add a new OrderStatus enum value,
 * you MUST add its metadata here or get a compile error.
 * 
 * **FAANG Pattern:** Record<Enum, Metadata> ensures completeness
 */
const ORDER_STATUS_METADATA_MAP: Record<OrderStatus, OrderStatusMetadata> = {
	[OrderStatus.Cancelled]: {
		value: OrderStatus.Cancelled,
		display: 'Cancelled',
		variant: 'error',
		description: 'Order has been cancelled and will not be fulfilled',
		sortOrder: OrderStatus.Cancelled, // 0
		category: 'cancelled',
		isTerminal: true,
		allowedTransitions: [], // No transitions from cancelled
	},
	[OrderStatus.Pending]: {
		value: OrderStatus.Pending,
		display: 'Pending',
		variant: 'warning',
		description: 'Order is awaiting staff review and quote preparation',
		sortOrder: OrderStatus.Pending, // 100
		category: 'pending',
		isTerminal: false,
		allowedTransitions: [OrderStatus.WaitingCustomerApproval, OrderStatus.Cancelled],
	},
	[OrderStatus.WaitingCustomerApproval]: {
		value: OrderStatus.WaitingCustomerApproval,
		display: 'Awaiting Customer Approval',
		variant: 'warning',
		description: 'Quote has been sent and is awaiting customer approval and payment',
		sortOrder: OrderStatus.WaitingCustomerApproval, // 200
		category: 'pending',
		isTerminal: false,
		allowedTransitions: [OrderStatus.Placed, OrderStatus.Cancelled],
	},
	[OrderStatus.Placed]: {
		value: OrderStatus.Placed,
		display: 'Placed',
		variant: 'info',
		description: 'Customer has approved quote and order has been confirmed',
		sortOrder: OrderStatus.Placed, // 300
		category: 'active',
		isTerminal: false,
		allowedTransitions: [OrderStatus.Processing, OrderStatus.Cancelled],
	},
	[OrderStatus.Processing]: {
		value: OrderStatus.Processing,
		display: 'Processing',
		variant: 'warning',
		description: 'Order is being prepared and packaged for shipment',
		sortOrder: OrderStatus.Processing, // 400
		category: 'active',
		isTerminal: false,
		allowedTransitions: [OrderStatus.Shipped, OrderStatus.Cancelled],
	},
	[OrderStatus.Shipped]: {
		value: OrderStatus.Shipped,
		display: 'Shipped',
		variant: 'info',
		description: 'Order has been shipped and is in transit to customer',
		sortOrder: OrderStatus.Shipped, // 500
		category: 'active',
		isTerminal: false,
		allowedTransitions: [OrderStatus.Delivered],
	},
	[OrderStatus.Delivered]: {
		value: OrderStatus.Delivered,
		display: 'Delivered',
		variant: 'success',
		description: 'Order has been successfully delivered to customer',
		sortOrder: OrderStatus.Delivered, // 600
		category: 'completed',
		isTerminal: true,
		allowedTransitions: [], // Terminal state
	},
}

/**
 * OrderStatusHelper - Static helper class for OrderStatus enum
 * 
 * Provides type-safe, centralized access to all OrderStatus metadata.
 * Eliminates magic strings and hardcoded maps throughout the codebase.
 * 
 * **FAANG Pattern:** Static helper class (Netflix, Stripe)
 */
export default class OrderStatusHelper {
	/**
	 * Array of all OrderStatus metadata
	 * 
	 * Useful for:
	 * - Populating dropdowns/select inputs
	 * - Iterating over all statuses
	 * - Generating documentation
	 * - Building filters
	 * 
	 * @example
	 * ```typescript
	 * // Populate dropdown
	 * <FormSelect
	 *   options={OrderStatusHelper.toList.map(meta => ({
	 *     value: meta.value,
	 *     label: meta.display,
	 *   }))}
	 * />
	 * 
	 * // Generate status list
	 * OrderStatusHelper.toList.forEach(meta => {
	 *   console.log(`${meta.display}: ${meta.description}`)
	 * })
	 * ```
	 */
	static readonly toList: OrderStatusMetadata[] = Object.values(ORDER_STATUS_METADATA_MAP)

	/**
	 * Get human-readable display name for a status
	 * 
	 * @param status - OrderStatus enum value
	 * @returns Display name string
	 * 
	 * @example
	 * ```typescript
	 * OrderStatusHelper.getDisplay(OrderStatus.WaitingCustomerApproval)
	 * // → "Awaiting Customer Approval"
	 * ```
	 */
	static getDisplay(status: OrderStatus): string {
		return ORDER_STATUS_METADATA_MAP[status]?.display || 'Unknown'
	}

	/**
	 * Get badge variant for a status (for UI styling)
	 * 
	 * @param status - OrderStatus enum value
	 * @returns Badge variant ('success' | 'error' | 'warning' | 'info')
	 * 
	 * @example
	 * ```typescript
	 * const variant = OrderStatusHelper.getVariant(OrderStatus.Delivered)
	 * // → "success"
	 * 
	 * <Badge variant={variant}>{name}</Badge>
	 * ```
	 */
	static getVariant(status: OrderStatus): OrderStatusVariant {
		return ORDER_STATUS_METADATA_MAP[status]?.variant || 'info'
	}

	/**
	 * Get detailed description for a status
	 * 
	 * @param status - OrderStatus enum value
	 * @returns Description string
	 * 
	 * @example
	 * ```typescript
	 * const desc = OrderStatusHelper.getDescription(OrderStatus.Processing)
	 * // → "Order is being prepared and packaged for shipment"
	 * 
	 * <Tooltip content={desc}>
	 *   <Badge>{OrderStatusHelper.getDisplay(status)}</Badge>
	 * </Tooltip>
	 * ```
	 */
	static getDescription(status: OrderStatus): string {
		return ORDER_STATUS_METADATA_MAP[status]?.description || 'No description available'
	}

	/**
	 * Get full metadata object for a status
	 * 
	 * @param status - OrderStatus enum value
	 * @returns Complete OrderStatusMetadata object
	 * 
	 * @example
	 * ```typescript
	 * const meta = OrderStatusHelper.getMetadata(OrderStatus.Shipped)
	 * console.log(meta.display)     // "Shipped"
	 * console.log(meta.variant)     // "info"
	 * console.log(meta.category)    // "active"
	 * console.log(meta.isTerminal)  // false
	 * ```
	 */
	static getMetadata(status: OrderStatus): OrderStatusMetadata {
		return ORDER_STATUS_METADATA_MAP[status]
	}

	/**
	 * Get status category
	 * 
	 * @param status - OrderStatus enum value
	 * @returns Category ('pending' | 'active' | 'completed' | 'cancelled')
	 * 
	 * @example
	 * ```typescript
	 * OrderStatusHelper.getCategory(OrderStatus.Processing)
	 * // → "active"
	 * ```
	 */
	static getCategory(status: OrderStatus): OrderStatusCategory {
		return ORDER_STATUS_METADATA_MAP[status]?.category || 'pending'
	}

	/**
	 * Check if a status is terminal (final, no further changes)
	 * 
	 * @param status - OrderStatus enum value
	 * @returns True if status is terminal (Delivered or Cancelled)
	 * 
	 * @example
	 * ```typescript
	 * OrderStatusHelper.isTerminal(OrderStatus.Delivered)  // true
	 * OrderStatusHelper.isTerminal(OrderStatus.Cancelled)  // true
	 * OrderStatusHelper.isTerminal(OrderStatus.Processing) // false
	 * ```
	 */
	static isTerminal(status: OrderStatus): boolean {
		return ORDER_STATUS_METADATA_MAP[status]?.isTerminal || false
	}

	/**
	 * Get allowed transitions from current status
	 * 
	 * @param status - Current OrderStatus
	 * @returns Array of valid next statuses
	 * 
	 * @example
	 * ```typescript
	 * const nextStatuses = OrderStatusHelper.getAllowedTransitions(OrderStatus.Pending)
	 * // → [OrderStatus.WaitingCustomerApproval, OrderStatus.Cancelled]
	 * 
	 * // Validate transition
	 * const canTransition = nextStatuses.includes(newStatus)
	 * ```
	 */
	static getAllowedTransitions(status: OrderStatus): OrderStatus[] {
		return ORDER_STATUS_METADATA_MAP[status]?.allowedTransitions || []
	}

	/**
	 * Validate if a status transition is allowed
	 * 
	 * @param fromStatus - Current status
	 * @param toStatus - Desired new status
	 * @returns True if transition is valid
	 * 
	 * @example
	 * ```typescript
	 * OrderStatusHelper.canTransition(OrderStatus.Pending, OrderStatus.WaitingCustomerApproval)
	 * // → true
	 * 
	 * OrderStatusHelper.canTransition(OrderStatus.Delivered, OrderStatus.Processing)
	 * // → false (cannot go backwards from terminal state)
	 * ```
	 */
	static canTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
		const allowedTransitions = this.getAllowedTransitions(fromStatus)
		return allowedTransitions.includes(toStatus)
	}

	/**
	 * Get all statuses by category
	 * 
	 * @param category - Status category to filter by
	 * @returns Array of OrderStatus values in that category
	 * 
	 * @example
	 * ```typescript
	 * const activeStatuses = OrderStatusHelper.getStatusesByCategory('active')
	 * // → [OrderStatus.Placed, OrderStatus.Processing, OrderStatus.Shipped]
	 * ```
	 */
	static getStatusesByCategory(category: OrderStatusCategory): OrderStatus[] {
		return this.toList.filter((meta) => meta.category === category).map((meta) => meta.value)
	}

	/**
	 * Get all active statuses (orders in progress)
	 * 
	 * @returns Array of active OrderStatus values
	 * 
	 * @example
	 * ```typescript
	 * const activeStatuses = OrderStatusHelper.getActiveStatuses()
	 * // → [OrderStatus.Placed, OrderStatus.Processing, OrderStatus.Shipped]
	 * 
	 * // Filter orders
	 * const activeOrders = orders.filter(o =>
	 *   activeStatuses.includes(o.status)
	 * )
	 * ```
	 */
	static getActiveStatuses(): OrderStatus[] {
		return this.getStatusesByCategory('active')
	}

	/**
	 * Get all pending statuses (awaiting action)
	 * 
	 * @returns Array of pending OrderStatus values
	 */
	static getPendingStatuses(): OrderStatus[] {
		return this.getStatusesByCategory('pending')
	}

	/**
	 * Get all completed statuses
	 * 
	 * @returns Array of completed OrderStatus values
	 */
	static getCompletedStatuses(): OrderStatus[] {
		return this.getStatusesByCategory('completed')
	}

	/**
	 * Check if a value is a valid OrderStatus enum value
	 * 
	 * Type guard for runtime validation
	 * 
	 * @param value - Value to check
	 * @returns True if value is valid OrderStatus
	 * 
	 * @example
	 * ```typescript
	 * const status = getStatusFromAPI()  // unknown type
	 * 
	 * if (OrderStatusHelper.isValid(status)) {
	 *   // TypeScript now knows status is OrderStatus
	 *   const display = OrderStatusHelper.getDisplay(status)
	 * }
	 * ```
	 */
	static isValid(value: unknown): value is OrderStatus {
		if (typeof value !== 'number') return false
		return Object.values(OrderStatus).includes(value as OrderStatus)
	}

	/**
	 * Sort statuses by their sort order (numeric value)
	 * 
	 * @param statuses - Array of OrderStatus values to sort
	 * @param direction - Sort direction ('asc' | 'desc')
	 * @returns Sorted array
	 * 
	 * @example
	 * ```typescript
	 * const statuses = [OrderStatus.Shipped, OrderStatus.Pending, OrderStatus.Delivered]
	 * const sorted = OrderStatusHelper.sort(statuses, 'asc')
	 * // → [OrderStatus.Pending, OrderStatus.Shipped, OrderStatus.Delivered]
	 * ```
	 */
	static sort(statuses: OrderStatus[], direction: 'asc' | 'desc' = 'asc'): OrderStatus[] {
		return [...statuses].sort((a, b) => {
			const orderA = ORDER_STATUS_METADATA_MAP[a].sortOrder
			const orderB = ORDER_STATUS_METADATA_MAP[b].sortOrder
			return direction === 'asc' ? orderA - orderB : orderB - orderA
		})
	}

	/**
	 * Get the next logical status in the order lifecycle
	 * 
	 * @param status - Current status
	 * @returns Next status or undefined if terminal
	 * 
	 * @example
	 * ```typescript
	 * OrderStatusHelper.getNextStatus(OrderStatus.Pending)
	 * // → OrderStatus.WaitingCustomerApproval
	 * 
	 * OrderStatusHelper.getNextStatus(OrderStatus.Delivered)
	 * // → undefined (terminal state)
	 * ```
	 */
	static getNextStatus(status: OrderStatus): OrderStatus | undefined {
		const transitions = this.getAllowedTransitions(status)
		// Return first non-cancelled transition (normal flow)
		return transitions.find((s) => s !== OrderStatus.Cancelled)
	}
}

