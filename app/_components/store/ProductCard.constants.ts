/**
 * ProductCard Constants - Shared Constants for ProductCard and ProductCardSkeleton
 * 
 * Single source of truth for all dimensions, styles, and spacing used in ProductCard components.
 * Follows FAANG best practices (Meta, Google, Netflix, Amazon, Shopify) for maintaining consistency
 * between skeleton loaders and real components.
 * 
 * **Key Principles:**
 * - Single source of truth: All constants in one file
 * - Type safety: TypeScript ensures consistency
 * - Easy maintenance: Change once, update everywhere
 * - Documentation: Constants serve as documentation
 * - Scalability: Easy to extend for new card types
 * 
 * **Usage:**
 * ```typescript
 * import { PRODUCT_CARD_CONSTANTS } from './ProductCard.constants'
 * 
 * // In ProductCard
 * <h3 style={PRODUCT_CARD_CONSTANTS.DIMENSIONS.PRODUCT_NAME}>
 *   {product.name}
 * </h3>
 * 
 * // In ProductCardSkeleton
 * <div style={PRODUCT_CARD_CONSTANTS.DIMENSIONS.PRODUCT_NAME}>
 *   <div className="skeleton-shimmer" />
 * </div>
 * ```
 * 
 * @module ProductCard.constants
 */

/**
 * ProductCard Constants
 * 
 * Contains all dimensions, styles, and spacing constants used by ProductCard and ProductCardSkeleton.
 * Both components import from this file to ensure perfect synchronization.
 */
export const PRODUCT_CARD_CONSTANTS = {
	/**
	 * Dimensions - Font sizes, line heights, min heights
	 * Used for consistent sizing across ProductCard and ProductCardSkeleton
	 */
	DIMENSIONS: {
		/**
		 * Product Name - 2 lines, prominent heading
		 * fontSize: 1.125rem (18px), minHeight: 2.25rem, lineHeight: 1.25
		 */
		PRODUCT_NAME: {
			fontSize: '1.125rem',
			fontWeight: 600,
			minHeight: '2.25rem',
			lineHeight: 1.25,
		} as const,

		/**
		 * Manufacturer - 1 line, secondary text
		 * fontSize: 0.875rem (14px), minHeight: 1.25rem, lineHeight: 1.43
		 */
		MANUFACTURER: {
			fontSize: '0.875rem',
			minHeight: '1.25rem',
			lineHeight: 1.43,
		} as const,

		/**
		 * Price - Prominent display, large text
		 * fontSize: 1.875rem (30px), minHeight: 2.25rem, lineHeight: 1.2
		 */
		PRICE: {
			fontSize: '1.875rem',
			minHeight: '2.25rem',
			lineHeight: 1.2,
		} as const,

		/**
		 * Metadata - SKU, Stock (icons + text)
		 * fontSize: 0.875rem (14px), minHeight: 1.25rem
		 */
		METADATA: {
			fontSize: '0.875rem',
			minHeight: '1.25rem',
		} as const,

		/**
		 * Category - Badge-style tags
		 * minHeight: 1.5rem (badge height)
		 */
		CATEGORY: {
			minHeight: '1.5rem',
		} as const,

		/**
		 * Button - Call to action button
		 * fontSize: 0.875rem (14px), padding: 0.625rem 1rem, minHeight: 2.5rem
		 */
		BUTTON: {
			fontSize: '0.875rem',
			padding: '0.625rem 1rem',
			minHeight: '2.5rem',
		} as const,

		/**
		 * Spacer - Flexible spacer that pushes button to bottom
		 * minHeight: 0.5rem
		 */
		SPACER: {
			minHeight: '0.5rem',
		} as const,
	} as const,

	/**
	 * Styles - CSS classes and style objects
	 * Used for consistent styling across ProductCard and ProductCardSkeleton
	 */
	STYLES: {
		/**
		 * Container - Main card container
		 * Base styles: flex, flex-col, overflow-hidden, rounded-xl, border, bg, shadow
		 */
		CONTAINER: 'flex flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition-all duration-300',

		/**
		 * Container Hover - Hover effects for interactive cards
		 * Only used in ProductCard (not skeleton)
		 */
		CONTAINER_HOVER: 'hover:border-primary/30 hover:shadow-xl',

		/**
		 * Image Container - Product image container
		 * Fixed aspect-square, full width, shrink-0
		 */
		IMAGE_CONTAINER: 'relative aspect-square w-full shrink-0 overflow-hidden bg-base-200',

		/**
		 * Content Container - Product content container
		 * Flex column, grows to fill space, padding: p-4 sm:p-5
		 */
		CONTENT_CONTAINER: 'flex flex-1 flex-col p-4 sm:p-5',

		/**
		 * Product Name - Product name heading
		 * 2-line clamp, leading-tight, transitions
		 */
		PRODUCT_NAME: 'line-clamp-2 leading-tight transition-colors group-hover:text-primary',

		/**
		 * Manufacturer - Manufacturer text
		 * 1-line clamp, secondary text color
		 */
		MANUFACTURER: 'line-clamp-1 text-base-content/70',

		/**
		 * Price Container - Price display container
		 * Flex items-baseline, gap-2
		 */
		PRICE_CONTAINER: 'flex items-baseline gap-2',

		/**
		 * Price - Price text
		 * Bold, primary color
		 */
		PRICE: 'font-bold text-primary',

		/**
		 * Metadata Container - SKU, Stock metadata
		 * Flex wrap, gap-x-3 gap-y-1.5, secondary text color
		 */
		METADATA_CONTAINER: 'flex flex-wrap gap-x-3 gap-y-1.5 text-base-content/60',

		/**
		 * Icon - Metadata icons (Package, Warehouse)
		 * Tailwind classes: h-4 w-4 (1rem / 16px)
		 */
		ICON: 'h-4 w-4',

		/**
		 * Metadata Item - Individual metadata item (SKU, Stock)
		 * Flex items-center, gap-1, whitespace-nowrap
		 */
		METADATA_ITEM: 'flex items-center gap-1 whitespace-nowrap',

		/**
		 * Category Container - Category tags container
		 * Overflow-hidden to prevent tags from going outside bounds
		 */
		CATEGORY_CONTAINER: 'overflow-hidden',

		/**
		 * Category Tags - Category tags wrapper
		 * Flex items-center, gap-2, min-w-0
		 */
		CATEGORY_TAGS: 'flex items-center gap-2 min-w-0',

		/**
		 * Category Badge - Individual category badge
		 * Badge secondary outline, inline-flex, items-center, gap-1, whitespace-nowrap
		 */
		CATEGORY_BADGE: 'badge badge-secondary badge-outline inline-flex items-center gap-1 whitespace-nowrap shrink min-w-0',

		/**
		 * Category Badge Icon - Hashtag icon in category badge
		 * Small text, opacity-70, shrink-0
		 */
		CATEGORY_BADGE_ICON: 'text-[0.65rem] opacity-70 shrink-0',

		/**
		 * Category Badge Text - Category name in badge
		 * Truncate to prevent overflow
		 */
		CATEGORY_BADGE_TEXT: 'truncate',

		/**
		 * Category Count Badge - "+X" badge for additional categories
		 * Badge neutral, small size, shrink-0
		 */
		CATEGORY_COUNT_BADGE: 'badge badge-neutral badge-sm shrink-0',

		/**
		 * Category Empty - Empty state for no categories
		 * Small text, secondary color
		 */
		CATEGORY_EMPTY: 'text-base-content/40',

		/**
		 * Button Container - Button wrapper
		 * Flex justify-center
		 */
		BUTTON_CONTAINER: 'flex justify-center',

		/**
		 * Button - Call to action button
		 * Full width, transition-transform, hover scale
		 */
		BUTTON: 'w-full transition-transform group-hover:scale-[1.02]',

		/**
		 * Spacer - Flexible spacer
		 * Flex-1, pushes button to bottom
		 */
		SPACER: 'flex-1',
	} as const,

	/**
	 * Spacing - Margin and padding values
	 * Used for consistent spacing across ProductCard and ProductCardSkeleton
	 */
	SPACING: {
		/**
		 * Product Name Margin - Margin top for product name
		 * mt-0 (no margin, first element)
		 */
		PRODUCT_NAME_MARGIN: 'mt-0',

		/**
		 * Manufacturer Margin - Margin top for manufacturer
		 * mt-2 (0.5rem)
		 */
		MANUFACTURER_MARGIN: 'mt-2',

		/**
		 * Price Margin - Margin top for price
		 * mt-3 (0.75rem)
		 */
		PRICE_MARGIN: 'mt-3',

		/**
		 * Metadata Margin - Margin top for metadata
		 * mt-3 (0.75rem)
		 */
		METADATA_MARGIN: 'mt-3',

		/**
		 * Category Margin - Margin top for categories
		 * mt-3 (0.75rem)
		 */
		CATEGORY_MARGIN: 'mt-3',

		/**
		 * Button Margin - Margin top for button
		 * mt-4 (1rem)
		 */
		BUTTON_MARGIN: 'mt-4',

		/**
		 * Product Name Lines - Gap between product name lines
		 * space-y-1.5 (0.375rem)
		 */
		PRODUCT_NAME_LINES: 'space-y-1.5',

		/**
		 * Metadata Gap - Gap between metadata items
		 * gap-3 (0.75rem)
		 */
		METADATA_GAP: 'gap-3',

		/**
		 * Category Gap - Gap between category badges
		 * gap-2 (0.5rem)
		 */
		CATEGORY_GAP: 'gap-2',
	} as const,

	/**
	 * Skeleton - Skeleton-specific constants
	 * Used for skeleton loading states
	 */
	SKELETON: {
		/**
		 * Product Name - Skeleton product name dimensions
		 * Height: 1.125rem, Width: 100% (first line), 70% (second line)
		 */
		PRODUCT_NAME: {
			height: '1.125rem',
			width: { first: '100%', second: '70%' },
		} as const,

		/**
		 * Manufacturer - Skeleton manufacturer dimensions
		 * Height: 0.875rem, Width: 45%
		 */
		MANUFACTURER: {
			height: '0.875rem',
			width: '45%',
		} as const,

		/**
		 * Price - Skeleton price dimensions
		 * Height: 1.875rem, Width: 40%
		 */
		PRICE: {
			height: '1.875rem',
			width: '40%',
		} as const,

		/**
		 * Metadata Icon - Skeleton metadata icon dimensions
		 * Height: 1rem, Width: 1rem
		 */
		METADATA_ICON: {
			height: '1rem',
			width: '1rem',
		} as const,

		/**
		 * Metadata Text - Skeleton metadata text dimensions
		 * Height: 0.875rem, Width: 4rem (SKU), 3.5rem (Stock)
		 */
		METADATA_TEXT: {
			height: '0.875rem',
			width: { sku: '4rem', stock: '3.5rem' },
		} as const,

		/**
		 * Category Badge - Skeleton category badge dimensions
		 * Height: 1.5rem, Width: 6rem (first), 7rem (second), maxWidth: 8rem
		 */
		CATEGORY_BADGE: {
			height: '1.5rem',
			width: { first: '6rem', second: '7rem' },
			maxWidth: '8rem',
		} as const,

		/**
		 * Button - Skeleton button dimensions
		 * Height: 2.5rem, Width: 100%
		 */
		BUTTON: {
			height: '2.5rem',
			width: '100%',
		} as const,
	} as const,
} as const

/**
 * Export individual constants for easier imports
 * Allows destructuring: import { DIMENSIONS, STYLES } from './ProductCard.constants'
 */
export const {
	DIMENSIONS,
	STYLES,
	SPACING,
	SKELETON,
} = PRODUCT_CARD_CONSTANTS

/**
 * Type exports for TypeScript type safety
 */
export type ProductCardDimensions = typeof PRODUCT_CARD_CONSTANTS.DIMENSIONS
export type ProductCardStyles = typeof PRODUCT_CARD_CONSTANTS.STYLES
export type ProductCardSpacing = typeof PRODUCT_CARD_CONSTANTS.SPACING
export type ProductCardSkeleton = typeof PRODUCT_CARD_CONSTANTS.SKELETON

