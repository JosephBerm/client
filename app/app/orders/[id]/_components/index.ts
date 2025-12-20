/**
 * Order Detail Components - Barrel Export
 * 
 * Components for the order detail page, organized by responsibility.
 * 
 * **ARCHITECTURE PATTERN:**
 * ```
 * page.tsx (Orchestrator)
 *   ├── OrderTimeline (compact)
 *   └── Layout Grid
 *       ├── Main Content
 *       │   ├── OrderHeader
 *       │   ├── OrderLineItems
 *       │   └── OrderDeliveryDetails
 *       └── OrderSidebar (Composition)
 *           ├── OrderActions
 *           ├── OrderTimeline (full)
 *           ├── OrderNotes
 *           └── OrderQuickInfo
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

// =============================================================================
// CONTENT
// =============================================================================

export { OrderLineItems } from './OrderLineItems'
export type { OrderLineItemsProps } from './OrderLineItems'

export { OrderDeliveryDetails } from './OrderDeliveryDetails'
export type { OrderDeliveryDetailsProps } from './OrderDeliveryDetails'

// =============================================================================
// SIDEBAR
// =============================================================================

export { OrderActions } from './OrderActions'
export type { OrderActionsProps } from './OrderActions'

export { OrderNotes } from './OrderNotes'
export type { OrderNotesProps } from './OrderNotes'

export { OrderQuickInfo } from './OrderQuickInfo'
export type { OrderQuickInfoProps } from './OrderQuickInfo'

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
