/**
 * Order Detail Hooks - Barrel Export
 * 
 * Custom hooks for order detail page functionality.
 * 
 * **Available Hooks:**
 * - useOrderActions: Workflow operations (confirm, update status, etc.)
 * - useOrderDetails: Data fetching and state management
 * - useOrderPermissions: Role-based permission checks (DRY pattern)
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/hooks
 */

// =============================================================================
// DATA HOOKS
// =============================================================================

export { useOrderDetails } from './useOrderDetails'

// =============================================================================
// ACTION HOOKS
// =============================================================================

export { useOrderActions } from './useOrderActions'

// =============================================================================
// PERMISSION HOOKS
// =============================================================================

export { useOrderPermissions } from './useOrderPermissions'
export type { UseOrderPermissionsReturn } from './useOrderPermissions'
