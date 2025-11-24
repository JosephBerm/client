/**
 * Product Service - Product Business Logic Layer
 * 
 * Service layer for product-related operations.
 * Provides a clean abstraction over the API client for product operations.
 * 
 * **Architecture:**
 * - Wraps API.Store.Products methods
 * - Provides type-safe product operations
 * - Handles product-specific business logic
 * - Can be extended with caching, validation, etc.
 * 
 * **Benefits:**
 * - Single source of truth for product operations
 * - Easy to add product-specific logic (validation, transformation)
 * - Can be extended with caching, optimistic updates, etc.
 * - Better testability (can mock service instead of API)
 * 
 * @example
 * ```typescript
 * import { ProductService } from '@_features/products';
 * 
 * // Get a product
 * const product = await ProductService.get(productId);
 * 
 * // Search products
 * const results = await ProductService.searchPublic(searchFilter);
 * 
 * // Create product with images
 * const newProduct = await ProductService.create(formData);
 * ```
 * 
 * @module products/services
 */

import { API } from '@_shared'

import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { PagedResult } from '@_classes/Base/PagedResult'
import { Product } from '@_classes/Product'
import ProductsCategory from '@_classes/ProductsCategory'
import UploadedFile from '@_classes/UploadedFile'

/**
 * Product Service
 * 
 * Provides methods for all product-related operations.
 * Acts as a business logic layer over the API client.
 */
export class ProductService {
	/**
	 * Gets a single product by ID.
	 * 
	 * @param {string} productId - Product ID (GUID)
	 * @returns {Promise<Product>} Product instance
	 * 
	 * @example
	 * ```typescript
	 * const product = await ProductService.get('123e4567-e89b-12d3-a456-426614174000');
	 * ```
	 */
	static async get(productId: string): Promise<Product> {
		const response = await API.Store.Products.get(productId)
		const payload = response.data.payload
		if (!payload) {
			throw new Error(`Product with ID ${productId} not found`)
		}
		return new Product(payload)
	}

	/**
	 * Gets all products.
	 * 
	 * @returns {Promise<Product[]>} Array of products
	 */
	static async getAll(): Promise<Product[]> {
		const response = await API.Store.Products.getAllProducts()
		return (response.data.payload || []).map((p: Partial<Product>) => new Product(p))
	}

	/**
	 * Creates a new product with optional image upload.
	 * 
	 * @param {FormData} formData - FormData containing product data and images
	 * @returns {Promise<Product>} Created product instance
	 * 
	 * @example
	 * ```typescript
	 * const formData = new FormData();
	 * formData.append('product.name', 'Surgical Mask');
	 * formData.append('product.price', '9.99');
	 * formData.append('files', imageFile);
	 * 
	 * const product = await ProductService.create(formData);
	 * ```
	 */
	static async create(formData: FormData): Promise<Product> {
		const response = await API.Store.Products.create(formData)
		const payload = response.data.payload
		if (!payload) {
			throw new Error('Failed to create product')
		}
		return new Product(payload)
	}

	/**
	 * Updates an existing product.
	 * 
	 * @param {Product} product - Product instance with updated data
	 * @returns {Promise<Product>} Updated product instance
	 */
	static async update(product: Product): Promise<Product> {
		const response = await API.Store.Products.update<Product>(product)
		const payload = response.data.payload
		if (!payload) {
			throw new Error('Failed to update product')
		}
		return new Product(payload)
	}

	/**
	 * Deletes a product.
	 * 
	 * @param {string} productId - Product ID to delete
	 * @returns {Promise<void>}
	 */
	static async delete(productId: string): Promise<void> {
		await API.Store.Products.delete(productId)
	}

	/**
	 * Gets latest products for home page display.
	 * 
	 * @param {number} quantity - Number of products to return (default: 6)
	 * @returns {Promise<Product[]>} Array of latest products
	 */
	static async getLatest(quantity: number = 6): Promise<Product[]> {
		const response = await API.Store.Products.getLatest(quantity)
		return (response.data.payload || []).map((p) => new Product(p))
	}

	/**
	 * Searches products with pagination and filtering (public).
	 * No authentication required.
	 * 
	 * @param {GenericSearchFilter} searchFilter - Search filter with pagination, sorting, etc.
	 * @returns {Promise<PagedResult<Product>>} Paginated product results
	 * 
	 * @example
	 * ```typescript
	 * const filter = new GenericSearchFilter({
	 *   page: 1,
	 *   pageSize: 20,
	 *   sortBy: 'name',
	 *   sortOrder: 'asc'
	 * });
	 * 
	 * const results = await ProductService.searchPublic(filter);
	 * ```
	 */
	static async searchPublic(searchFilter: GenericSearchFilter): Promise<PagedResult<Product>> {
		const response = await API.Store.Products.searchPublic(searchFilter)
		const pagedResult = response.data.payload
		
		if (!pagedResult) {
			throw new Error('Failed to search products')
		}
		
		// Transform products to Product instances and create new PagedResult
		return new PagedResult<Product>({
			...pagedResult,
			data: pagedResult.data.map((p: Partial<Product>) => new Product(p)),
		})
	}

	/**
	 * Searches products with pagination and filtering (admin).
	 * Requires authentication.
	 * 
	 * @param {GenericSearchFilter} searchFilter - Search filter
	 * @returns {Promise<PagedResult<Product>>} Paginated product results
	 */
	static async search(searchFilter: GenericSearchFilter): Promise<PagedResult<Product>> {
		const response = await API.Store.Products.search(searchFilter)
		const pagedResult = response.data.payload
		
		if (!pagedResult) {
			throw new Error('Failed to search products')
		}
		
		// Transform products to Product instances and create new PagedResult
		return new PagedResult<Product>({
			...pagedResult,
			data: pagedResult.data.map((p: Partial<Product>) => new Product(p)),
		})
	}

	/**
	 * Gets all product categories.
	 * 
	 * @returns {Promise<ProductsCategory[]>} Array of product categories
	 */
	static async getAllCategories(): Promise<ProductsCategory[]> {
		const response = await API.Store.Products.getAllCategories()
		return (response.data.payload || []).map((c: Partial<ProductsCategory>) => new ProductsCategory(c))
	}

	/**
	 * Uploads additional images to an existing product.
	 * 
	 * @param {string} productId - Product ID
	 * @param {FormData} formData - FormData containing image files
	 * @returns {Promise<UploadedFile[]>} Array of uploaded file entities
	 */
	static async uploadImage(productId: string, formData: FormData): Promise<UploadedFile[]> {
		const response = await API.Store.Products.uploadImage(productId, formData)
		return (response.data.payload || []).map((f: Partial<UploadedFile>) => new UploadedFile(f))
	}

	/**
	 * Deletes a product image.
	 * 
	 * @param {string} productId - Product ID
	 * @param {string} imageName - Image filename to delete
	 * @returns {Promise<boolean>} Success status
	 */
	static async deleteImage(productId: string, imageName: string): Promise<boolean> {
		const response = await API.Store.Products.deleteImage(productId, imageName)
		return response.data.payload ?? false
	}

	/**
	 * Gets all images for a product.
	 * 
	 * @param {string} productId - Product ID
	 * @returns {Promise<File[]>} Array of image files
	 */
	static async getImages(productId: string): Promise<File[]> {
		const response = await API.Store.Products.images(productId)
		return response.data.payload || []
	}
}

