/**
 * Quote Detail Hooks - Barrel Export (Optimized for Tree-Shaking)
 *
 * Custom hooks for quote detail page functionality.
 * Each hook handles a specific concern (data, actions, permissions, pricing).
 *
 * **Architecture:**
 * - Named exports enable optimal tree-shaking
 * - Types exported alongside implementations
 * - Organized by concern (data, actions, permissions, pricing)
 *
 * **Import Pattern:**
 * ```tsx
 * // ✅ GOOD: Import from barrel
 * import { useQuoteDetails, useQuotePermissions, useQuotePricing } from './hooks'
 *
 * // ❌ BAD: Direct file imports
 * import { useQuoteDetails } from './hooks/useQuoteDetails'
 * ```
 *
 * @module app/quotes/[id]/_components/hooks
 */

// ============================================================================
// DATA HOOKS
// ============================================================================

export { useQuoteDetails } from './useQuoteDetails'
export type { UseQuoteDetailsReturn } from './useQuoteDetails'

// ============================================================================
// PERMISSION HOOKS
// ============================================================================

export { useQuotePermissions } from './useQuotePermissions'
export type { UseQuotePermissionsReturn } from './useQuotePermissions'

// ============================================================================
// ACTION HOOKS
// ============================================================================

export { useQuoteActions } from './useQuoteActions'
export type { UseQuoteActionsReturn } from './useQuoteActions'

export { useAutoMarkQuoteAsRead } from './useAutoMarkQuoteAsRead'
export type { UseAutoMarkQuoteAsReadConfig } from './useAutoMarkQuoteAsRead'

// ============================================================================
// ASSIGNMENT HOOKS
// ============================================================================

export { useQuoteAssignment } from './useQuoteAssignment'
export type { UseQuoteAssignmentReturn } from './useQuoteAssignment'

// ============================================================================
// PRICING HOOKS
// @see prd_quotes_pricing.md
// @see prd_pricing_engine.md (Advanced Pricing Engine Integration)
// ============================================================================

export { useQuotePricing } from './useQuotePricing'
export type { UseQuotePricingReturn } from './useQuotePricing'

export { useQuoteSuggestedPricing } from './useQuoteSuggestedPricing'
export type { UseQuoteSuggestedPricingReturn, SuggestedPriceData } from './useQuoteSuggestedPricing'
