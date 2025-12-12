/**
 * @fileoverview Serialized Store Data Types
 * 
 * Shared type definitions for serialized store data.
 * These types are used for Server→Client data transfer.
 * 
 * **Why Serialized Types?**
 * - React Server Components can only pass plain objects to Client Components
 * - Class instances (Product, ProductsCategory) can't cross the boundary
 * - These types represent the "wire format" of the data
 * 
 * **Usage:**
 * - Server Components: Return these types from fetch functions
 * - Client Components: Accept these types as props, convert to class instances
 * 
 * @module features/store/types
 */

/**
 * Serialized product data (plain object, not class instance)
 * Safe to pass from Server Component to Client Component
 * Matches the API response structure
 */
export interface SerializedProduct {
	id: string
	name: string
	description?: string
	price: number
	sku?: string
	stock?: number
	category?: string
	categoryIds?: number[]
	manufacturer?: string
	providerId?: string | null
	createdAt?: string
	updatedAt?: string | null
	/** Images as plain objects - will be converted to HtmlImage on client */
	images?: Array<Record<string, unknown>>
	/** Files as plain objects - will be converted to UploadedFile on client */
	files?: Array<Record<string, unknown>>
	/** Categories as plain objects - will be converted to ProductsCategory on client */
	categories?: Array<Record<string, unknown>>
	/** Allow additional properties from API */
	[key: string]: unknown
}

/**
 * Serialized pagination result (plain object, not class instance)
 */
export interface SerializedPagedResult {
	page: number
	pageSize: number
	total: number
	totalPages: number
	hasNext: boolean
	hasPrevious: boolean
	data: SerializedProduct[]
}

/**
 * Serialized category (plain object, not class instance)
 */
export interface SerializedCategory {
	id: number
	name?: string
	parentCategoryId?: number
	subCategories?: SerializedCategory[]
	[key: string]: unknown
}

/**
 * Initial store data for hydration
 * All data is serialized (plain objects) for safe Server→Client transfer
 */
export interface InitialStoreData {
	products: SerializedProduct[]
	productsResult: SerializedPagedResult
	categories: SerializedCategory[]
	searchParams: {
		search: string
		categoryIds: string[]
		sort: string
		page: number
		pageSize: number
	}
}

/**
 * Search parameters for store page
 * These come from URL searchParams in Server Components
 */
export interface StoreSearchParams {
	search?: string
	categories?: string // Comma-separated category IDs
	sort?: string
	page?: string
	pageSize?: string
}

