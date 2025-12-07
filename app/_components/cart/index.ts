/**
 * Cart Components - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Reusable cart-related components for shopping cart functionality.
 * 
 * @example
 * ```typescript
 * import { CartPageContainer, CartItem } from '@_components/cart'
 * ```
 * 
 * @module CartComponents
 */

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

export { default as CartPageContainer } from './CartPageContainer'

// ============================================================================
// CART ITEM COMPONENTS
// ============================================================================

export { default as CartItem } from './CartItem'
export type { CartItemProps } from './CartItem'

// ============================================================================
// CART PAGE COMPONENTS
// ============================================================================

export { default as CartHeader } from './CartHeader'
export type { CartHeaderProps } from './CartHeader'

export { default as CartEmptyState } from './CartEmptyState'
export type { CartEmptyStateProps } from './CartEmptyState'

export { default as CartSuccessState } from './CartSuccessState'
export type { CartSuccessStateProps } from './CartSuccessState'

export { default as CartItemsSection } from './CartItemsSection'
export type { CartItemsSectionProps } from './CartItemsSection'

export { default as CartItemsList } from './CartItemsList'
export type { CartItemsListProps } from './CartItemsList'

export { default as CartSummary } from './CartSummary'
export type { CartSummaryProps } from './CartSummary'

// ============================================================================
// QUOTE COMPONENTS
// ============================================================================

export { default as QuoteInfoCard } from './QuoteInfoCard'
export type { QuoteInfoCardProps } from './QuoteInfoCard'

export { default as QuoteSummaryCard } from './QuoteSummaryCard'
export type { QuoteSummaryCardProps } from './QuoteSummaryCard'

export { default as QuoteRequestForm } from './QuoteRequestForm'
export type { QuoteRequestFormProps } from './QuoteRequestForm'

