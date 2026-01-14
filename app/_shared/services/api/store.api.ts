/**
 * Store API Module
 *
 * Product catalog management, images, categories, and search operations.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/store
 */

import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type { PagedData } from '@_classes/PagedData'
import type { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'
import type UploadedFile from '@_classes/UploadedFile'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

import { HttpService } from '../httpService'

// =========================================================================
// PRODUCTS API
// =========================================================================

/**
 * Product Management API
 * CRUD operations for medical supply products.
 */
export const ProductsApi = {
	/**
	 * Gets all products (no pagination).
	 * Use search() for paginated results.
	 */
	getAllProducts: async () => HttpService.get<Product[]>('/products'),

	/**
	 * Gets paginated product list.
	 */
	getList: async (pagedData: PagedData) => HttpService.post<Product[]>('/products/paged', pagedData),

	/**
	 * Gets a single product by ID.
	 */
	get: async (productId: string) => HttpService.get<Product>(`/products/${productId}`),

	/**
	 * Creates a new product with image upload.
	 */
	create: async (product: FormData) =>
		HttpService.post<Product>(`/products`, product, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	/**
	 * Updates an existing product.
	 */
	update: async <T>(product: T) => HttpService.put<T>(`/products`, product),

	/**
	 * Deletes a product (hard delete).
	 */
	delete: async <T>(productId: string) => HttpService.delete<T>(`/products/${productId}`),

	/**
	 * Archives a product (soft delete).
	 */
	archive: async (productId: string) => HttpService.post<boolean>(`/products/${productId}/archive`, null),

	/**
	 * Restores an archived product.
	 */
	restore: async (productId: string) => HttpService.put<boolean>(`/products/${productId}/restore`, {}),

	/**
	 * Gets product statistics for admin dashboard.
	 */
	getStats: async () =>
		HttpService.get<{
			totalProducts: number
			activeProducts: number
			archivedProducts: number
			lowStockProducts: number
			outOfStockProducts: number
			totalInventoryValue: number
			categoryCount: number
		}>('/products/stats'),

	/**
	 * Gets latest products for home page display.
	 */
	getLatest: async (quantity: number = 6) => HttpService.get<Product[]>(`/products/latest?quantity=${quantity}`),

	/**
	 * Gets a product image by ID and filename.
	 */
	image: async (id: string, name: string) => HttpService.get(`/products/image?productId=${id}&image=${name}`),

	/**
	 * Uploads additional images to an existing product.
	 */
	uploadImage: async (productId: string, formData: FormData) =>
		HttpService.post<UploadedFile[]>(`/products/${productId}/images`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	/**
	 * Deletes a product image.
	 */
	deleteImage: async (id: string, name: string) => HttpService.delete<boolean>(`/products/${id}/image/${name}`),

	/**
	 * Gets all images for a product.
	 */
	images: async (id: string) => HttpService.get<File[]>(`/products/images?productId=${id}`),

	/**
	 * Searches products with pagination and filtering (admin).
	 */
	search: async (search: GenericSearchFilter) => HttpService.post<PagedResult<Product>>(`/Products/search`, search),

	/**
	 * Rich search for products with advanced filtering, sorting, and facets.
	 */
	richSearch: async (filter: RichSearchFilter) =>
		HttpService.post<RichPagedResult<Product>>(`/Products/search/rich`, filter),

	/**
	 * Searches products with pagination and filtering (public).
	 * No authentication required.
	 */
	searchPublic: async (search: GenericSearchFilter) =>
		HttpService.post<PagedResult<Product>>(`/Products/search/public`, search),

	/**
	 * Searches products (public, cacheable).
	 * NO AUTHENTICATION - Does not access cookies().
	 * **SERVER COMPONENTS ONLY - Use with "use cache".**
	 */
	searchPublicCacheable: async (search: GenericSearchFilter) =>
		HttpService.postPublic<PagedResult<Product>>(`/Products/search/public`, search),

	/**
	 * Gets all product categories.
	 */
	getAllCategories: async () => HttpService.get<ProductsCategory[]>('/Products/categories/clean'),

	/**
	 * Gets all product categories (public, cacheable).
	 * NO AUTHENTICATION - Does not access cookies().
	 * **SERVER COMPONENTS ONLY - Use with "use cache".**
	 */
	getCategoriesCacheable: async () => HttpService.getPublic<ProductsCategory[]>('/Products/categories/clean'),

	/**
	 * Gets a single product by ID (public, cacheable).
	 * NO AUTHENTICATION - Does not access cookies().
	 * **USE THIS WITH "use cache" for maximum performance.**
	 */
	getPublicCacheable: async (productId: string) => HttpService.getPublic<Product>(`/products/${productId}`),
}

// =========================================================================
// STORE API (NAMESPACE)
// =========================================================================

/**
 * Store Management API
 * Contains product catalog and inventory management.
 */
export const StoreApi = {
	Products: ProductsApi,
}
