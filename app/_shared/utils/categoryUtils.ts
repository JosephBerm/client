/**
 * Category Utility Functions
 * 
 * Shared utilities for working with hierarchical product categories.
 * DRY principle - single source of truth for category operations.
 * 
 * @module utils/categoryUtils
 */

import type ProductsCategory from '@_classes/ProductsCategory'

/**
 * Flattened category representation for dropdown displays.
 */
export interface FlattenedCategory {
	/** Category ID */
	id: number
	/** Category name */
	name: string
	/** Nesting depth (0 = root, 1 = child, etc.) */
	depth: number
}

/**
 * Flattens a hierarchical category tree into a flat array.
 * Preserves depth information for indented dropdown displays.
 * 
 * **Use Cases:**
 * - Category filter dropdowns
 * - Multi-select category inputs
 * - Breadcrumb generation
 * 
 * @param categories - Array of categories (may contain nested subCategories)
 * @param depth - Current nesting depth (internal, defaults to 0)
 * @returns Flat array of categories with depth metadata
 * 
 * @example
 * ```typescript
 * const categories = await API.Store.Products.getAllCategories()
 * const flatCategories = flattenCategories(categories.data.payload ?? [])
 * 
 * // Use in Select component
 * <Select
 *   options={flatCategories.map(cat => ({
 *     value: cat.id,
 *     label: `${'—'.repeat(cat.depth)} ${cat.name}`
 *   }))}
 * />
 * ```
 */
export function flattenCategories(
	categories: ProductsCategory[],
	depth = 0
): FlattenedCategory[] {
	const result: FlattenedCategory[] = []
	
	for (const cat of categories) {
		result.push({
			id: cat.id,
			name: cat.name ?? 'Unknown',
			depth,
		})
		
		// Recursively flatten subcategories
		if (cat.subCategories && cat.subCategories.length > 0) {
			result.push(...flattenCategories(cat.subCategories, depth + 1))
		}
	}
	
	return result
}

/**
 * Formats a category name with indentation based on depth.
 * Useful for displaying hierarchical categories in dropdowns.
 * 
 * @param category - Flattened category object
 * @param indentChar - Character to use for indentation (default: '—')
 * @returns Formatted category name with indentation
 * 
 * @example
 * ```typescript
 * formatCategoryLabel({ id: 1, name: 'Surgical', depth: 2 })
 * // Returns: "—— Surgical"
 * ```
 */
export function formatCategoryLabel(
	category: FlattenedCategory,
	indentChar = '—'
): string {
	const indent = indentChar.repeat(category.depth)
	return indent ? `${indent} ${category.name}` : category.name
}

