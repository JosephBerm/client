/**
 * Product Detail Page Constants
 * 
 * Centralized constants for product detail page components.
 * Eliminates magic strings and ensures consistency.
 * 
 * Note: UPPER_SNAKE_CASE is the standard naming convention for constants
 * (matches httpService.constants.ts and industry best practices).
 * 
 * @module ProductDetail/ProductDetail.constants
 */

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Animation delay values for staggered reveal animations
 * Values in milliseconds
 * 
 * Note: UPPER_SNAKE_CASE is standard for constants (matches httpService.constants.ts pattern)
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ANIMATION_DELAYS = {
	HEADER: '100ms',
	DESCRIPTION: '150ms',
	PRICING: '200ms',
	DOCUMENTS: '300ms',
	TRUST_SIGNALS: '300ms',
	SPECIFICATIONS: '400ms',
	HELP: '500ms',
} as const

/**
 * Section titles and labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SECTION_LABELS = {
	ABOUT_ITEM: 'About this item',
	TECHNICAL_RESOURCES: 'Technical Resources',
	SPECIFICATIONS: 'Specifications',
	PRICING: 'Pricing',
} as const

/**
 * Product status labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PRODUCT_STATUS = {
	IN_STOCK: 'In Stock',
	OUT_OF_STOCK: 'Out of Stock',
	SKU_NA: 'N/A',
} as const

/**
 * Pricing labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PRICING_LABELS = {
	QUOTE_BASED: 'Quote-Based',
	DESCRIPTION: 'Personalized pricing ensures you get the best market rate for your volume.',
	REQUEST_QUOTE: 'Request Quote',
	NO_COMMITMENT: 'No commitment required',
} as const

/**
 * Trust signal labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const TRUST_SIGNALS = {
	VERIFIED: 'Verified',
	FAST_SHIP: 'Fast Ship',
	BULK: 'Bulk',
} as const

/**
 * Document labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DOCUMENT_LABELS = {
	DOWNLOAD_PDF: 'Download PDF',
} as const

/**
 * Help section labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HELP_LABELS = {
	QUESTIONS: 'Have questions? Contact support',
} as const

/**
 * Specification table labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SPEC_LABELS = {
	CATEGORY: 'Category',
	PRODUCT_ID: 'Product ID',
	SKU: 'SKU',
	MANUFACTURER: 'Manufacturer',
} as const

/**
 * Fallback messages
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FALLBACK_MESSAGES = {
	NO_DESCRIPTION: 'No detailed description available for this product.',
} as const

/**
 * Breadcrumb labels
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const BREADCRUMB_LABELS = {
	STORE: 'Store',
	CATEGORY: 'Category',
} as const

