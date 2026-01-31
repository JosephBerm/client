/**
 * Product Detail Page Utilities
 * 
 * Shared utility functions for product detail page components.
 * 
 * @module ProductDetail/utils
 */

import type { SerializedProduct } from '@_lib/serializers/productSerializer'
import type { BreadcrumbItem } from '@_components/ui/Breadcrumb'

import { Routes } from '@_features/navigation'

import { Product } from '@_classes/Product'

import { BREADCRUMB_LABELS } from './ProductDetail.constants'

/**
 * Filters product files to get only non-image documents (PDFs, Specs, etc.)
 * 
 * @param files - Array of product files
 * @returns Array of non-image document files
 */
export function filterNonImageDocuments(files: SerializedProduct['files']) {
	return files.filter((file) => {
		if (!file.name) {
			return false
		}
		// Check if file is an image by extension or content type
		const hasImageExtension = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null
		const hasImageContentType = file.contentType?.startsWith('image/') ?? false
		const isImage = hasImageExtension || hasImageContentType
		return !isImage
	})
}

/**
 * Builds breadcrumb trail for product detail page
 * 
 * @param product - Product instance
 * @returns Array of breadcrumb items
 */
export function buildProductBreadcrumbs(product: Product): BreadcrumbItem[] {
	return [
		{ label: BREADCRUMB_LABELS.STORE, href: Routes.Store.location },
		// Use first category if available, with proper route builder
		...(product.categories.length > 0 && product.categories[0].id
			? [
					{
						label: product.categories[0].name ?? product.category ?? BREADCRUMB_LABELS.CATEGORY,
						href: Routes.Store.withCategory(product.categories[0].id),
					},
				]
			: product.category
				? [{ label: product.category, href: Routes.Store.location }]
				: []),
		{ label: product.name, href: Routes.Store.product(product.id), isCurrent: true },
	]
}

