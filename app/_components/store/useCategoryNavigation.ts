/**
 * useCategoryNavigation Hook
 * 
 * Hook for handling category tag clicks with smart navigation.
 * If on /store route, applies filter directly. Otherwise, navigates to /store with category filter.
 * 
 * **Features:**
 * - Detects current route
 * - Applies category filter if on store page
 * - Navigates to store page with filter if not on store page
 * - Supports callback for custom category filter handlers
 * 
 * @module useCategoryNavigation
 */

'use client'

import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import ProductsCategory from '@_classes/ProductsCategory'
import { Routes } from '@_features/navigation'
import { logger } from '@_core'

export interface UseCategoryNavigationOptions {
	/** Optional: Custom handler for category filter (used when on /store route) */
	onCategoryFilter?: (category: ProductsCategory) => void
}

/**
 * Hook for handling category navigation
 * 
 * @param options - Configuration options
 * @returns Handler function for category clicks
 * 
 * @example
 * ```tsx
 * const handleCategoryClick = useCategoryNavigation({
 *   onCategoryFilter: (category) => {
 *     // Custom filter logic when on /store route
 *     setSelectedCategories([category])
 *   }
 * })
 * 
 * <CategoryTag onClick={() => handleCategoryClick(category)} />
 * ```
 */
export function useCategoryNavigation(options?: UseCategoryNavigationOptions) {
	const router = useRouter()
	const pathname = usePathname()
	const isOnStorePage = pathname === Routes.Store.location

	return useCallback((category: ProductsCategory) => {
		if (!category || !category.id) {
			logger.warn('Invalid category provided to useCategoryNavigation', {
				category,
				component: 'useCategoryNavigation',
			})
			return
		}

		// If on store page and custom handler provided, use it
		if (isOnStorePage && options?.onCategoryFilter) {
			logger.debug('Applying category filter on store page', {
				categoryId: category.id,
				categoryName: category.name,
				component: 'useCategoryNavigation',
			})
			options.onCategoryFilter(category)
			return
		}

		// If not on store page, navigate to store with category filter
		if (!isOnStorePage) {
			logger.debug('Navigating to store page with category filter', {
				categoryId: category.id,
				categoryName: category.name,
				currentPath: pathname,
				component: 'useCategoryNavigation',
			})

			// Navigate to store with category ID in URL
			// The store page will read this and apply the filter
			router.push(Routes.Store.withCategory(category.id))
			return
		}

		// Fallback: if on store page but no handler, navigate with query param
		// This ensures the filter is applied even without custom handler
		router.push(Routes.Store.withCategory(category.id))
	}, [router, pathname, isOnStorePage, options])
}

