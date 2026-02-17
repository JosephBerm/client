/**
 * Order Detail Components - Barrel Export
 * 
 * Components for the order detail page, organized by responsibility.
 * 
 * **ARCHITECTURE PATTERN:**
 * ```
 * page.tsx (Orchestrator)
 *   - OrderTimeline (compact)
 *   - Layout Grid
 *     - Main Content
 *       - OrderHeader
 *       - OrderLineItems
 *       - OrderFinancialLedger
 *       - OrderDeliveryDetails
 *     - OrderSidebar (Composition)
 *       - OrderActions
 *       - OrderCustomerIntelligence
 *       - OrderNotes
 *       - OrderActivityFeed
 * ```
 * 
 * **IMPORT PATTERN:**
 * - Components import DIRECTLY from sibling files (not from index)
 * - This prevents circular dependencies
 * - External consumers import from this barrel
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components
 */

// =============================================================================
// HEADER & STATUS
// =============================================================================

export { OrderHeader } from './OrderHeader'
export type { OrderHeaderProps } from './OrderHeader'

export { OrderTimeline } from './OrderTimeline'
export type { OrderTimelineProps } from './OrderTimeline'

export { OrderPrimaryAction } from './OrderPrimaryAction'
export type { OrderPrimaryActionProps } from './OrderPrimaryAction'

export { OrderCustomerView } from './OrderCustomerView'
export type { OrderCustomerViewProps } from './OrderCustomerView'

// =============================================================================
// CONTENT
// =============================================================================

export { OrderLineItems } from './OrderLineItems'
export type { OrderLineItemsProps } from './OrderLineItems'

export { OrderDeliveryDetails } from './OrderDeliveryDetails'
export type { OrderDeliveryDetailsProps } from './OrderDeliveryDetails'

export { OrderFinancialLedger } from './OrderFinancialLedger'
export type { OrderFinancialLedgerProps } from './OrderFinancialLedger'

// =============================================================================
// SIDEBAR
// =============================================================================

export { OrderActions } from './OrderActions'
export type { OrderActionsProps } from './OrderActions'

export { OrderNotes } from './OrderNotes'
export type { OrderNotesProps } from './OrderNotes'

export { OrderCustomerIntelligence } from './OrderCustomerIntelligence'
export type { OrderCustomerIntelligenceProps } from './OrderCustomerIntelligence'

export { OrderActivityFeed } from './OrderActivityFeed'
export type { OrderActivityFeedProps } from './OrderActivityFeed'

export { OrderSidebar } from './OrderSidebar'
export type { OrderSidebarProps } from './OrderSidebar'

// =============================================================================
// LOADING STATE
// =============================================================================

export { OrderDetailSkeleton } from './OrderDetailSkeleton'

// =============================================================================
// HOOKS (Re-exported for convenience)
// =============================================================================

export { useOrderDetails, useOrderActions, useOrderPermissions } from './hooks'
export type { UseOrderPermissionsReturn } from './hooks'
