/**
 * Product Detail Components - Barrel Export (Optimized for Tree-Shaking)
 *
 * Components for product detail page.
 * All components are server components (no 'use client').
 *
 * @example
 * ```typescript
 * import {
 *   ProductDescriptionSection,
 *   ProductHeaderInfo,
 *   ANIMATION_DELAYS,
 *   SECTION_LABELS,
 * } from '@_components/store'
 * ```
 *
 * @module ProductDetail
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { default as ProductDescriptionSection } from './ProductDescriptionSection'
export { default as ProductDocumentsSection } from './ProductDocumentsSection'
export { default as ProductHeaderInfo } from './ProductHeaderInfo'
export { default as ProductPricingCard } from './ProductPricingCard'
export { default as ProductTrustSignals } from './ProductTrustSignals'
export { default as ProductSpecifications } from './ProductSpecifications'
export { default as ProductHelpSection } from './ProductHelpSection'
export { default as VolumeTierTable } from './VolumeTierTable'
export { default as CustomerPricingCard } from './CustomerPricingCard'
export { default as ProductPricingWrapper } from './ProductPricingWrapper'

// ============================================================================
// TYPES
// ============================================================================

export type { ProductDescriptionSectionProps } from './ProductDescriptionSection'
export type { ProductDocumentsSectionProps } from './ProductDocumentsSection'
export type { ProductHeaderInfoProps } from './ProductHeaderInfo'
export type { ProductPricingCardProps } from './ProductPricingCard'
export type { ProductSpecificationsProps } from './ProductSpecifications'
export type { VolumeTierTableProps } from './VolumeTierTable'
export type { CustomerPricingCardProps } from './CustomerPricingCard'
export type { ProductPricingWrapperProps } from './ProductPricingWrapper'

// ============================================================================
// UTILITIES
// ============================================================================

export { filterNonImageDocuments, buildProductBreadcrumbs } from './utils'

// ============================================================================
// CONSTANTS
// ============================================================================

export {
	ANIMATION_DELAYS,
	SECTION_LABELS,
	PRODUCT_STATUS,
	PRICING_LABELS,
	TRUST_SIGNALS,
	DOCUMENT_LABELS,
	HELP_LABELS,
	SPEC_LABELS,
	FALLBACK_MESSAGES,
	BREADCRUMB_LABELS,
} from './ProductDetail.constants'

