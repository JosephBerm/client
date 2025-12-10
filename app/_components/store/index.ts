/**
 * Store Components - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Public store catalog components.
 * Most components are client-side ('use client'), except ProductDetail components which are server components.
 * 
 * @example
 * ```typescript
 * import { ProductCard, StorePageContainer } from '@_components/store'
 * ```
 * 
 * @module components/store
 */

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

export { default as StorePageContainer } from './StorePageContainer'
export { default as StoreHeader } from './StoreHeader'
export { default as StoreFilters } from './StoreFilters'
export { default as StoreProductGrid } from './StoreProductGrid'

// ============================================================================
// PRODUCT COMPONENTS
// ============================================================================

export { default as ProductCard } from './ProductCard'
export { default as ProductCardSkeleton } from './ProductCardSkeleton'
export { default as ProductImage } from './ProductImage'
export { default as ProductImageGallery } from './ProductImageGallery'
export { default as ImageGallery } from './ImageGallery'
export { default as RelatedProducts } from './RelatedProducts'

// ============================================================================
// PRODUCT DETAIL COMPONENTS
// ============================================================================

export {
	ProductDescriptionSection,
	ProductDocumentsSection,
	ProductHeaderInfo,
	ProductPricingCard,
	ProductTrustSignals,
	ProductSpecifications,
	ProductHelpSection,
	filterNonImageDocuments,
	buildProductBreadcrumbs,
} from './ProductDetail'

export type {
	ProductDescriptionSectionProps,
	ProductDocumentsSectionProps,
	ProductHeaderInfoProps,
	ProductPricingCardProps,
	ProductSpecificationsProps,
} from './ProductDetail'

// ============================================================================
// UI COMPONENTS
// ============================================================================

export { default as AddToCartButton } from './AddToCartButton'
export { default as ScrollRevealCard } from './ScrollRevealCard'
export { default as PaginationControls } from './PaginationControls'
export { default as UnifiedStoreToolbar } from './UnifiedStoreToolbar'

// ============================================================================
// TOOLBAR COMPONENTS & CONSTANTS
// ============================================================================

export { default as ProductsToolbar, SORT_OPTIONS, PAGE_SIZE_OPTIONS } from './ProductsToolbar'

// ============================================================================
// HOOKS
// ============================================================================

export { useCategoryNavigation } from './useCategoryNavigation'

// ============================================================================
// TYPES
// ============================================================================

export type { StoreHeaderProps } from './StoreHeader'
export type { StoreFiltersProps } from './StoreFilters'
export type { StoreProductGridProps } from './StoreProductGrid'
export type { UnifiedStoreToolbarProps } from './UnifiedStoreToolbar'

