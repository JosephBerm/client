/**
 * Pricing Components - Barrel Export
 *
 * Components and hooks for the Pricing Dashboard and management pages.
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 5.2 Frontend
 *
 * @module app/pricing/_components
 */

// ============================================================================
// TYPES
// ============================================================================

/** Tab identifiers for the pricing dashboard */
export type PricingTabId = 'price-lists' | 'volume-tiers' | 'customers' | 'audit-logs' | 'analytics'

// ============================================================================
// HOOKS
// ============================================================================

export { usePricingOverview } from './hooks'
export type { PricingStats, UsePricingOverviewReturn } from './hooks'

// ============================================================================
// COMPONENTS
// ============================================================================

export { default as PricingStatsCards } from './PricingStatsCards'
export { default as PriceListTable } from './PriceListTable'
export { default as PriceListForm } from './PriceListForm'
export { default as PriceListItemEditor } from './PriceListItemEditor'
export { default as CustomerAssignmentEditor } from './CustomerAssignmentEditor'
export { default as VolumeTierEditor } from './VolumeTierEditor'
export { default as PricingAuditLogViewer } from './PricingAuditLogViewer'
export { default as CustomerAssignmentMatrix } from './CustomerAssignmentMatrix'
export { default as PricingAnalytics } from './PricingAnalytics'
// Note: Analytics types are now in @_classes/Pricing - use them directly from there
