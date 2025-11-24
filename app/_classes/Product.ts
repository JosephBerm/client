/**
 * Product Entity Class
 * 
 * Represents a medical supply product with full details including pricing, inventory,
 * categories, provider information, and image handling. Core entity for the product catalog.
 * 
 * **Features:**
 * - GUID-based unique identification
 * - SKU tracking for inventory management
 * - Multiple category support
 * - Provider/supplier association
 * - Image management with HtmlImage entities
 * - File upload support via UploadedFile
 * - Timestamp tracking (createdAt, updatedAt)
 * - Stock level tracking
 * - Manufacturer information
 * 
 * **Related Entities:**
 * - ProductsCategory: Product categories (medical, surgical, PPE, etc.)
 * - Provider: Supplier/provider information
 * - HtmlImage: Product image references
 * - UploadedFile: File upload entities
 * 
 * @example
 * ```typescript
 * // Create a new product
 * const product = new Product({
 *   name: 'Surgical Mask',
 *   sku: 'MASK-001',
 *   description: 'Disposable 3-layer surgical mask',
 *   price: 12.99,
 *   stock: 500,
 *   category: 'PPE',
 *   manufacturer: 'MedSupply Co',
 * });
 * 
 * // Check if product has images
 * import { logger } from '@_core';
 * 
 * if (product.hasImage()) {
 *   const fileName = product.getFileName();
 *   logger.debug('Product image found', { fileName, productId: product.id });
 * }
 * 
 * // Product with categories
 * const product2 = new Product({
 *   name: 'Surgical Gloves',
 *   price: 29.99,
 *   categories: [
 *     new ProductsCategory({ name: 'PPE' }),
 *     new ProductsCategory({ name: 'Surgical Supplies' })
 *   ],
 *   provider: new Provider({ name: 'MedCo Inc' })
 * });
 * ```
 * 
 * @module Product
 */

import { parseRequiredTimestamp, parseDateSafe } from '@_lib/dates'

import Guid from '@_classes/Base/Guid'
import HtmlImage from '@_classes/HtmlImage'
import ProductsCategory from '@_classes/ProductsCategory'
import type Provider from '@_classes/Provider'
import UploadedFile from '@_classes/UploadedFile'

// RichConstructor decorator not needed in modern Next.js

/**
 * Product Entity Class
 * 
 * Main product entity representing medical supply items in the catalog.
 * Handles product data, images, categories, provider relationships, and inventory.
 */
export class Product {
	/** Unique identifier (GUID) */
	id: string = ''

	/** Stock Keeping Unit (SKU) for inventory tracking */
	sku: string = ''
	
	/** Product name/title */
	name: string = ''
	
	/** Array of uploaded files (images, documents) */
	files: UploadedFile[] = []
	
	/** Product description (HTML or plain text) */
	description: string = ''
	
	/** Product price in USD */
	price: number = 0
	
	/** Available stock quantity */
	stock: number = 0  // Added for inventory tracking
	
	/** Primary category (simplified string reference) */
	category: string = ''  // Added for simplified category reference
	
	/** Manufacturer name */
	manufacturer: string = ''  // Added for manufacturer reference
	
	/** Array of category IDs (for legacy support) */
	categoryIds: number[] = []
	
	/** Array of category objects */
	categories: ProductsCategory[] = []
	
	/** Provider/supplier ID (foreign key) */
	providerId: number | null = null
	
	/** Provider/supplier object */
	provider: Provider | null = null
	
	/** Timestamp of creation */
	createdAt: Date = new Date()
	
	/** Timestamp of last update (null if never updated) */
	updatedAt: Date | null = null
	
	/** Array of product images */
	images: HtmlImage[] = []  // Added for image references

	/**
	 * Converts product to string representation.
	 * Useful for debugging and logging.
	 * 
	 * @returns {string} Product description string
	 */
	toString(): string {
		return `Product: ${this.name} - ${this.description} - ${this.price} - ${this.categories}`
	}

	/**
	 * Creates a new Product instance.
	 * Generates new GUID if not provided.
	 * Deeply copies nested objects (files, categories, images).
	 * 
	 * @param {Partial<Product>} product - Partial product data to initialize
	 * 
	 * @example
	 * ```typescript
	 * const product = new Product({
	 *   name: 'Surgical Gloves',
	 *   price: 29.99,
	 *   stock: 100,
	 *   category: 'PPE'
	 * });
	 * ```
	 */
	constructor(product: Partial<Product>) {
		// Generate new GUID if not provided
		this.id = product?.id || Guid.newGuid()
		
		// Deep copy files array
		this.files = product?.files?.length ? product.files.map((x) => new UploadedFile(x)) : []
		
		// Assign basic properties with defaults
		this.sku = product?.sku || ''
		this.name = product?.name || ''
		this.description = product?.description || ''
		this.price = product?.price || 0
		this.stock = product?.stock || 0
		this.category = product?.category || ''
		this.manufacturer = product?.manufacturer || ''
		
		// Deep copy categories array
		this.categories = product?.categories?.length ? product.categories.map((x) => new ProductsCategory(x)) : []
		this.categoryIds = product?.categoryIds || []
		
		// Assign provider relationship
		this.providerId = product?.providerId || null
		this.provider = product?.provider || null
		
		// Deep copy images array
		this.images = product?.images?.length ? product.images.map((x) => new HtmlImage(x)) : []
		
		// Parse dates from strings if needed
		this.createdAt = parseRequiredTimestamp(product?.createdAt, 'Product', 'createdAt')
		
		// UpdatedAt is nullable (null until first update) - use safe parsing
		this.updatedAt = parseDateSafe(product?.updatedAt)
	}

	/**
	 * Gets the filename of the first uploaded file.
	 * Useful for displaying primary product image.
	 * 
	 * @returns {string} Filename or empty string if no files
	 * 
	 * @example
	 * ```typescript
	 * const imageName = product.getFileName();
	 * if (imageName) {
	 *   const imageUrl = `/api/products/image?productId=${product.id}&image=${imageName}`;
	 * }
	 * ```
	 */
	getFileName(): string {
		return this.files[0]?.name ?? ''
	}

	/**
	 * Checks if product has at least one image.
	 * 
	 * @returns {boolean} True if product has image files
	 * 
	 * @example
	 * ```typescript
	 * if (product.hasImage()) {
	 *   return <img src={product.getFileName()} alt={product.name} />;
	 * } else {
	 *   return <PlaceholderImage />;
	 * }
	 * ```
	 */
	hasImage(): boolean {
		return this.files.length > 0 && this.files[0].name !== null
	}
}

/**
 * Cart Product Entity Class
 * 
 * Represents a product in a shopping cart with quantity information.
 * Used for cart management and quote/order creation.
 * 
 * **Features:**
 * - Product reference (full object or ID)
 * - Quantity tracking
 * - Flexible initialization
 * 
 * @example
 * ```typescript
 * // Add product to cart
 * const cartItem = new CartProduct({
 *   product: product,
 *   productId: product.id,
 *   quantity: 2
 * });
 * 
 * // Calculate line item total
 * const lineTotal = cartItem.product.price * cartItem.quantity;
 * ```
 */
export class CartProduct {
	/** Full product object (populated from API) */
	product: IProduct | null = null
	
	/** Quantity of this product in cart */
	quantity: number = 0
	
	/** Product ID (for lightweight cart storage) */
	productId: string | null = null

	/**
	 * Creates a new CartProduct instance.
	 * 
	 * @param {Partial<CartProduct>} param - Partial cart product data
	 * 
	 * @example
	 * ```typescript
	 * const cartItem = new CartProduct({
	 *   productId: 'prod-123',
	 *   quantity: 3
	 * });
	 * ```
	 */
	constructor(param?: Partial<CartProduct>) {
		if (param) {
			Object.assign(this, param)
			// Note: Deep copying for product object is handled by context
			// Avoid overriding product methods (getFileName, hasImage)
		}
	}
}

/**
 * Product type alias for type safety.
 * Provides type compatibility with Product class.
 */
export type IProduct = Product
