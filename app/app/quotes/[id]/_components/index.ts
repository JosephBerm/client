/**
 * Quote Details Components - Barrel Export (Optimized for Tree-Shaking)
 *
 * Centralized export point for all quote detail page components.
 * Provides clean imports following FAANG-level organization.
 *
 * **Architecture:**
 * - Named exports enable optimal tree-shaking
 * - Types exported alongside implementations
 * - Organized by component purpose
 *
 * **Import Pattern:**
 * ```tsx
 * // ✅ GOOD: Import from barrel
 * import { QuoteHeader, QuoteContactInfo, QuotePricingEditor } from './_components'
 *
 * // ❌ BAD: Direct file imports
 * import QuoteHeader from './_components/QuoteHeader'
 * ```
 *
 * @module app/quotes/[id]/_components
 */

// ============================================================================
// TYPES
// ============================================================================

export type { QuoteComponentProps, QuoteWithPermissionsProps } from './types'

// ============================================================================
// COMPONENTS
// ============================================================================

export { default as QuoteHeader } from './QuoteHeader'
export type { QuoteHeaderProps } from './QuoteHeader'

export { default as QuoteContactInfo } from './QuoteContactInfo'
export type { QuoteContactInfoProps } from './QuoteContactInfo'

export { default as QuoteProducts } from './QuoteProducts'
export type { QuoteProductsProps } from './QuoteProducts'

export { default as QuoteActions } from './QuoteActions'
export type { QuoteActionsProps } from './QuoteActions'

export { default as QuoteAssignment } from './QuoteAssignment'
export type { QuoteAssignmentProps } from './QuoteAssignment'

export { default as QuotePricingEditor } from './QuotePricingEditor'
export type { QuotePricingEditorProps } from './QuotePricingEditor'

export { default as QuoteApprovalHistory } from './QuoteApprovalHistory'
export type { QuoteApprovalHistoryProps } from './QuoteApprovalHistory'

// ============================================================================
// HOOKS (Re-export from hooks barrel)
// ============================================================================

export {
	useQuoteDetails,
	useQuoteActivity,
	useQuotePermissions,
	useQuoteActions,
	useQuoteAssignment,
	useAutoMarkQuoteAsRead,
	useQuotePricing,
	type UseQuoteDetailsReturn,
	type QuoteActivityLogItem,
	type UseQuotePermissionsReturn,
	type UseQuoteActionsReturn,
	type UseQuoteAssignmentReturn,
	type UseAutoMarkQuoteAsReadConfig,
	type UseQuotePricingReturn,
} from './hooks'
