/**
 * Product Serialization Utilities
 * 
 * Handles serialization of Product class instances for Next.js Server/Client Component boundary.
 * Following FAANG-level best practices for React Server Components (RSC) architecture.
 * 
 * **Problem:**
 * Next.js Server Components can only pass plain objects to Client Components.
 * Class instances with methods cannot be serialized across this boundary.
 * 
 * **Solution:**
 * Convert Product class instances to plain objects (POJOs) that can be safely
 * serialized and passed to Client Components.
 * 
 * **Industry Pattern (Used by Google, Meta, Vercel):**
 * ```
 * Server Component → Serialize → Plain Object → Client Component
 * ```
 * 
 * **Benefits:**
 * - ✅ Type-safe serialization
 * - ✅ Preserves all data fields
 * - ✅ Works with Next.js RSC architecture
 * - ✅ No class methods in serialized data (as expected)
 * - ✅ Clean separation of concerns
 * 
 * @example
 * ```tsx
 * // In Server Component
 * const product = new Product(apiData);
 * const serializedProduct = serializeProduct(product);
 * 
 * // Pass to Client Component
 * <ProductImage product={serializedProduct} />
 * ```
 * 
 * @module productSerializer
 */

import { Product } from '@_classes/Product'

/**
 * Serialized product type for Client Components.
 * Contains all data fields but no class methods.
 * 
 * This is a plain object representation of Product that can be
 * safely passed across Server/Client Component boundary.
 */
export type SerializedProduct = {
	id: string
	sku: string
	name: string
	files: Array<{
		name: string | null
	}>
	description: string
	price: number
	stock: number
	category: string
	manufacturer: string
	categoryIds: number[]
	categories: Array<{
		id: number
		name: string
	}>
	providerId: number | null
	provider: {
		id: number
		name: string
		email: string | null
		phone: string | null
	} | null
	createdAt: string // ISO string
	updatedAt: string // ISO string
	images: Array<{
		src: string
		alt: string
	}>
}

/**
 * Serializes a Product class instance to a plain object.
 * 
 * Converts all nested class instances and Date objects to serializable formats:
 * - Dates → ISO strings
 * - Nested classes → Plain objects
 * - Methods → Removed (not serializable)
 * 
 * **Usage:**
 * Use this in Server Components before passing product data to Client Components.
 * 
 * @param product - Product class instance to serialize
 * @returns Plain object representation of product
 * 
 * @example
 * ```tsx
 * // Server Component
 * export default async function ProductPage({ params }) {
 *   const apiResponse = await API.Store.Products.get(params.id);
 *   const product = new Product(apiResponse.data.payload);
 *   
 *   // Serialize before passing to Client Component
 *   const serializedProduct = serializeProduct(product);
 *   
 *   return <ProductImageGallery product={serializedProduct} />;
 * }
 * ```
 */
export function serializeProduct(product: Product): SerializedProduct {
	return {
		id: product.id,
		sku: product.sku,
		name: product.name,
		files: product.files.map((file) => ({
			name: file.name,
		})),
		description: product.description,
		price: product.price,
		stock: product.stock,
		category: product.category,
		manufacturer: product.manufacturer,
		categoryIds: product.categoryIds,
		categories: product.categories.map((cat) => ({
			id: cat.id,
			name: cat.name || '',
		})),
		providerId: product.providerId,
		provider: product.provider
			? {
					id: product.provider.id,
					name: product.provider.name,
					email: product.provider.email,
					phone: product.provider.phone,
			  }
			: null,
		createdAt: product.createdAt.toISOString(),
		updatedAt: product.updatedAt.toISOString(),
		images: product.images.map((img) => ({
			src: img.src,
			alt: img.alt,
		})),
	}
}

/**
 * Type guard to check if product has image files.
 * Equivalent to Product.hasImage() but works with serialized products.
 * 
 * @param product - Serialized product data
 * @returns True if product has at least one image file
 * 
 * @example
 * ```tsx
 * if (productHasImage(serializedProduct)) {
 *   return <ProductImage product={serializedProduct} />;
 * } else {
 *   return <ImagePlaceholder />;
 * }
 * ```
 */
export function productHasImage(product: SerializedProduct): boolean {
	return product.files.length > 0 && product.files[0].name !== null
}

/**
 * Gets the filename of the first uploaded file.
 * Equivalent to Product.getFileName() but works with serialized products.
 * 
 * @param product - Serialized product data
 * @returns Filename or empty string if no files
 * 
 * @example
 * ```tsx
 * const fileName = getProductFileName(serializedProduct);
 * const imageUrl = getProductImageUrl(serializedProduct.id, fileName);
 * ```
 */
export function getProductFileName(product: SerializedProduct): string {
	return product.files[0]?.name ?? ''
}

