/**
 * @fileoverview Store Feature Constants
 * 
 * Centralized constants for the store/catalog feature.
 * Following FAANG best practice of extracting magic numbers and strings.
 * 
 * @module features/store/constants
 * @category Configuration
 */

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'

/**
 * Default number of products to display per page
 * Industry standard for e-commerce catalog pages
 */
export const INITIAL_PAGE_SIZE = 20

/**
 * API includes for product search requests
 * Ensures related entities are loaded in single request
 */
export const PRODUCT_API_INCLUDES = ['Categories', 'Files'] as const

/**
 * Creates initial search filter with default configuration
 * Factory function ensures fresh instance on each call
 * 
 * @returns New GenericSearchFilter instance
 */
export function createInitialFilter(): GenericSearchFilter {
	return new GenericSearchFilter({
		pageSize: INITIAL_PAGE_SIZE,
		includes: [...PRODUCT_API_INCLUDES],
	})
}

/**
 * Debounce delay for search input (milliseconds)
 * Industry standard: 300-500ms provides good balance between
 * responsiveness and reducing API calls
 */
export const SEARCH_DEBOUNCE_MS = 400

/**
 * Minimum characters required before triggering search
 * Prevents excessive API calls and improves UX
 */
export const MIN_SEARCH_LENGTH = 3

/**
 * Number of products to prioritize for image loading
 * Matches typical "above the fold" count on desktop
 */
export const PRIORITY_IMAGE_COUNT = 8

