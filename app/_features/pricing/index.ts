/**
 * Pricing Feature Module
 *
 * Advanced Pricing Engine for B2B e-commerce.
 * Provides price lists, volume tiers, margin protection, and pricing explainability.
 *
 * **Features:**
 * - Contract pricing (customer-specific price lists)
 * - Volume/quantity pricing tiers
 * - Margin protection (prevent below-threshold sales)
 * - Pricing explainability (applied rules breakdown)
 *
 * **PRD Reference:** prd_pricing_engine.md
 *
 * @module pricing
 */

// ============================================================================
// HOOKS
// ============================================================================

export {
	// Query key factory
	pricingKeys,
	// Price calculation hooks
	useCalculatePrice,
	useCalculatePricesMutation,
	// Price list hooks
	usePriceLists,
	usePriceList,
	useCreatePriceList,
	useUpdatePriceList,
	useDeletePriceList,
	// Price list item hooks
	useAddPriceListItem,
	useUpdatePriceListItem,
	useRemovePriceListItem,
	// Customer assignment hooks
	useCustomerPriceLists,
	useAssignCustomerPriceList,
	useRemoveCustomerPriceList,
	// Volume tier hooks
	useVolumeTiers,
	useSetVolumeTiers,
	useClearVolumeTiers,
	// Customer pricing hooks (for product detail page)
	useCustomerPricing,
	useBulkCustomerPricing,
} from './hooks'

// ============================================================================
// COMPONENTS
// ============================================================================

export {
	PriceBreakdown,
	type PriceBreakdownProps,
	MarginIndicator,
	MarginDot,
	MarginBadge,
	type MarginIndicatorProps,
} from './components'
