/**
 * Image Service
 * 
 * Centralized service for image-related business logic.
 * Handles image preloading, caching, error recovery, and performance optimization.
 * 
 * **Features:**
 * - Image preloading for better UX
 * - Error recovery with retry logic
 * - Cache management
 * - Performance monitoring
 * 
 * **Use Cases:**
 * - Preload product images before navigation
 * - Retry failed image loads
 * - Manage image cache
 * - Track image performance
 * 
 * @module ImageService
 */

import { logger } from '@_core'

import { getProductImageUrl } from '../utils/imageUtils'

/**
 * Image Service Class
 * 
 * Provides static methods for image-related operations.
 * All methods are stateless for better performance and testability.
 */
export class ImageService {
	/**
	 * Preloads multiple image URLs.
	 * Returns a promise that resolves when all images are loaded or failed.
	 * 
	 * @param {string[]} urls - Array of image URLs to preload
	 * @returns {Promise<void[]>} Promise that resolves when all images are processed
	 * 
	 * @example
	 * ```typescript
	 * await ImageService.preload([
	 *   'https://example.com/image1.jpg',
	 *   'https://example.com/image2.jpg'
	 * ]);
	 * ```
	 */
	static async preload(urls: string[]): Promise<void[]> {
		const preloadPromises = urls.map((url) => {
			return new Promise<void>((resolve) => {
				if (!url) {
					resolve()
					return
				}

				const img = new Image()
				img.onload = () => resolve()
				img.onerror = () => resolve() // Resolve even on error to not block
				img.src = url
			})
		})

		return Promise.all(preloadPromises)
	}

	/**
	 * Preloads all images for a product.
	 * Uses the product's files array to construct image URLs.
	 * 
	 * @param {string} productId - Product ID
	 * @param {Array<{ name: string | null }>} files - Product files array
	 * @returns {Promise<void>} Promise that resolves when all images are preloaded
	 * 
	 * @example
	 * ```typescript
	 * await ImageService.preloadProduct(product.id, product.files);
	 * ```
	 */
	static async preloadProduct(
		productId: string,
		files: Array<{ name: string | null }>
	): Promise<void> {
		if (!productId || !files || files.length === 0) {
			return
		}

		const imageUrls = files
			.filter((file) => file.name)
			.map((file) => getProductImageUrl(productId, file.name!))
			.filter((url): url is string => url !== null)

		if (imageUrls.length > 0) {
			await this.preload(imageUrls)
		}
	}

	/**
	 * Retries loading an image URL with exponential backoff.
	 * 
	 * @param {string} url - Image URL to retry
	 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
	 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
	 * @returns {Promise<boolean>} True if image loaded successfully, false otherwise
	 * 
	 * @example
	 * ```typescript
 * import { logger } from '@_core';
 * 
 * const success = await ImageService.retryLoad(imageUrl, 3, 1000);
 * if (success) {
 *   logger.info('Image loaded successfully', { imageUrl });
 * }
	 * ```
	 */
	static async retryLoad(
		url: string,
		maxRetries: number = 3,
		initialDelay: number = 1000
	): Promise<boolean> {
		if (!url) {
			return false
		}

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				const success = await new Promise<boolean>((resolve) => {
					const img = new Image()
					img.onload = () => resolve(true)
					img.onerror = () => resolve(false)
					img.src = url
				})

				if (success) {
					return true
				}

				// Exponential backoff: wait before retrying
				if (attempt < maxRetries - 1) {
					const delay = initialDelay * Math.pow(2, attempt)
					await new Promise((resolve) => setTimeout(resolve, delay))
				}
			} catch (error) {
				logger.error('ImageService: Error during retry', { url, attempt, error })
			}
		}

		return false
	}

	/**
	 * Clears the image URL cache.
	 * Useful for memory management or testing.
	 * 
	 * @example
	 * ```typescript
	 * ImageService.clearCache();
	 * ```
	 */
	static clearCache(): void {
		// Import dynamically to avoid circular dependencies
		import('../utils/imageUtils').then((utils) => {
			utils.clearImageUrlCache()
		})
	}

	/**
	 * Gets the current image URL cache size.
	 * 
	 * @returns {Promise<number>} Number of cached URLs
	 * 
	 * @example
	 * ```typescript
 * import { logger } from '@_core';
 * 
 * const cacheSize = await ImageService.getCacheSize();
 * logger.debug('Image cache size', { cacheSize });
	 * ```
	 */
	static async getCacheSize(): Promise<number> {
		const utils = await import('../utils/imageUtils')
		return utils.getImageUrlCacheSize()
	}
}

