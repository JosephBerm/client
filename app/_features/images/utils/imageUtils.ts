/**
 * Image URL Utility Functions
 * 
 * Centralized utility functions for constructing product image URLs.
 * Works in both server and client components.
 * 
 * **Features:**
 * - URL construction with proper encoding
 * - Image size/transformation parameters
 * - URL validation and sanitization
 * - Memoization for performance
 * - Error recovery utilities
 * - Blur placeholder generation
 * 
 * @module imageUtils
 */

import { logger } from '@_core'

/**
 * Generates a blur placeholder data URL for progressive image loading.
 * Creates a tiny base64-encoded image for Next.js Image placeholder.
 * 
 * This is a minimal 1x1px transparent PNG that Next.js will blur.
 * Using a shared function ensures consistency across all components.
 * 
 * @returns {string} Base64-encoded data URL for blur placeholder
 * 
 * @example
 * ```typescript
 * const blurDataUrl = getBlurDataUrl();
 * <Image src={imageUrl} placeholder="blur" blurDataURL={blurDataUrl} />
 * ```
 */
export function getBlurDataUrl(): string {
	// 1x1px base64 encoded transparent PNG with blur effect
	// This is a minimal placeholder that Next.js will blur
	return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
}

/**
 * Image size configuration for URL generation.
 */
export interface ImageSize {
	/** Image width in pixels */
	width?: number
	/** Image height in pixels */
	height?: number
	/** Image quality (1-100, default: 85) */
	quality?: number
}

/**
 * Gets the API base URL for image requests.
 * Returns the full API URL including '/api' path, as image endpoints are under /api/products/image.
 * 
 * **Industry Best Practice (FAANG-level):**
 * - Use environment variables for base URL configuration
 * - Support both server-side and client-side execution
 * - Provide clear error messages for debugging
 * - Follow Next.js Image optimization patterns (Vercel/Shopify/Amazon)
 * 
 * @returns {string} Full API base URL (e.g., 'https://api.example.com/api')
 * 
 * @example
 * ```typescript
 * const baseUrl = getImageBaseUrl();
 * // Returns: 'https://prod-server20241205193558.azurewebsites.net/api'
 * ```
 */
export function getImageBaseUrl(): string {
	// Try to get API URL from environment variables
	// NEXT_PUBLIC_API_URL is available in both server and client components
	// API_URL is fallback for server-side only
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ''
	
	if (!apiUrl) {
		logger.error('ImageUtils: No API URL found in environment variables', {
			NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
			API_URL: process.env.API_URL,
			tip: 'Check next.config.mjs env property or .env.local file',
		})
		return ''
	}
	
	// Ensure URL ends with '/api' for consistency
	// Image endpoint is /api/products/image, so we need the full API URL
	const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`
	
	if (!baseUrl) {
		logger.error('ImageUtils: Base URL is empty after processing', {
			originalApiUrl: apiUrl,
			processedBaseUrl: baseUrl,
		})
		return ''
	}
	
	return baseUrl
}

// URL cache for memoization
const urlCache = new Map<string, string>()

/**
 * Constructs a product image URL with optional size parameters.
 * Encodes URL parameters to handle special characters safely.
 * Results are memoized for performance.
 * 
 * @param {string} productId - Product ID (GUID)
 * @param {string} imageName - Image filename from product.files[0].name
 * @param {ImageSize} options - Optional size and quality parameters
 * @returns {string | null} Full image URL or null if parameters are invalid
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const imageUrl = getProductImageUrl(product.id, product.files[0]?.name ?? '');
 * 
 * // With size parameters
 * const thumbnailUrl = getProductImageUrl(product.id, imageName, { width: 300, height: 300 });
 * 
 * // With quality
 * const highQualityUrl = getProductImageUrl(product.id, imageName, { quality: 95 });
 * ```
 */
export function getProductImageUrl(
	productId: string,
	imageName: string,
	options?: ImageSize
): string | null {
	if (!productId || !imageName) {
		logger.warn('ImageUtils: Missing required parameters', {
			hasProductId: !!productId,
			hasImageName: !!imageName,
		})
		return null
	}

	const baseUrl = getImageBaseUrl()
	if (!baseUrl) {
		logger.warn('ImageUtils: Image base URL not configured')
		return null
	}

	// Create cache key
	const cacheKey = `${productId}-${imageName}-${options?.width || ''}-${options?.height || ''}-${options?.quality || ''}`
	
	// Check cache
	if (urlCache.has(cacheKey)) {
		return urlCache.get(cacheKey)!
	}

	// Build query parameters - URLSearchParams handles encoding automatically
	// DO NOT manually encode before passing to URLSearchParams to avoid double encoding
	const params = new URLSearchParams({
		productId: productId,
		image: imageName,
	})

	// Add optional size parameters
	if (options?.width) {
		params.append('width', options.width.toString())
	}
	if (options?.height) {
		params.append('height', options.height.toString())
	}
	if (options?.quality) {
		params.append('quality', Math.min(100, Math.max(1, options.quality)).toString())
	}

	// Construct full image URL
	// Format: {baseUrl}/products/image?productId={id}&image={name}
	// Example: https://prod-server20241205193558.azurewebsites.net/api/products/image?productId=123&image=photo.jpg
	// This matches the API endpoint structure defined in app/_services/api.ts
	const finalUrl = `${baseUrl}/products/image?${params.toString()}`

	// Cache the URL (limit cache size to prevent memory issues)
	if (urlCache.size > 1000) {
		// Clear oldest entries (simple FIFO)
		const firstKey = urlCache.keys().next().value
		if (firstKey) {
			urlCache.delete(firstKey)
		}
	}
	urlCache.set(cacheKey, finalUrl)

	return finalUrl
}

/**
 * Validates an image URL format.
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL appears valid
 */
export function validateImageUrl(url: string): boolean {
	if (!url || typeof url !== 'string') {
		return false
	}

	try {
		const parsedUrl = new URL(url)
		return ['http:', 'https:'].includes(parsedUrl.protocol)
	} catch {
		// Relative URLs are also valid
		return url.startsWith('/') || url.startsWith('./')
	}
}

/**
 * Gets a fallback image URL for a product.
 * Can be used when primary image fails to load.
 * 
 * @param {string} productId - Product ID
 * @returns {string} Fallback URL (placeholder or default image)
 */
export function getImageFallbackUrl(_productId: string): string {
	// For now, return empty string (placeholder will be handled by component)
	// Future: Could return a default placeholder image URL
	return ''
}

/**
 * Clears the URL cache.
 * Useful for testing or memory management.
 */
export function clearImageUrlCache(): void {
	urlCache.clear()
}

/**
 * Gets the current cache size.
 * 
 * @returns {number} Number of cached URLs
 */
export function getImageUrlCacheSize(): number {
	return urlCache.size
}

/**
 * Responsive image breakpoints for srcset generation.
 * Industry-standard breakpoints following Next.js and modern e-commerce patterns.
 */
export const RESPONSIVE_BREAKPOINTS = {
	sm: 640,   // Mobile
	md: 768,   // Tablet
	lg: 1024,  // Desktop
	xl: 1280,  // Large desktop
	'2xl': 1536, // Extra large desktop
} as const

/**
 * Generates responsive srcset for an image URL.
 * Creates multiple size variants for different screen densities.
 * 
 * @param {string} baseUrl - Base image URL
 * @param {number[]} widths - Array of widths to generate (default: [640, 768, 1024, 1280, 1536])
 * @param {number[]} densities - Array of pixel densities (default: [1, 2])
 * @returns {string} Srcset string for use in img/srcset attribute
 * 
 * @example
 * ```typescript
 * const srcset = generateSrcset(imageUrl);
 * // Returns: "url?w=640 640w, url?w=768 768w, url?w=1024 1024w, url?w=1280 1280w, url?w=1536 1536w"
 * 
 * // With custom widths
 * const srcset = generateSrcset(imageUrl, [400, 800, 1200]);
 * ```
 */
export function generateSrcset(
	baseUrl: string,
	widths: number[] = [640, 768, 1024, 1280, 1536],
	densities: number[] = [1, 2]
): string {
	if (!baseUrl) {
		return ''
	}

	const srcsetEntries: string[] = []

	// Parse URL (handles both absolute and relative URLs)
	let baseUrlObj: URL
	try {
		baseUrlObj = new URL(baseUrl)
	} catch {
		// Relative URL - create a temporary URL for parsing
		baseUrlObj = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'https://example.com')
	}

	widths.forEach((width) => {
		densities.forEach((density) => {
			const actualWidth = width * density
			// Create a new URL object from the base URL
			const srcsetUrl = new URL(baseUrlObj.toString())
			// Set or update the width parameter
			srcsetUrl.searchParams.set('w', actualWidth.toString())
			// Use the full URL string for absolute URLs, or pathname+search for relative
			const urlString = baseUrl.startsWith('http') 
				? srcsetUrl.toString() 
				: `${srcsetUrl.pathname}${srcsetUrl.search}`
			srcsetEntries.push(`${urlString} ${actualWidth}w`)
		})
	})

	return srcsetEntries.join(', ')
}

/**
 * Generates responsive sizes attribute for images.
 * Provides browser hints about image display size at different viewport widths.
 * 
 * @param {string} variant - Image variant (product, thumbnail, gallery, hero)
 * @param {string} size - Image size preset (sm, md, lg, xl)
 * @returns {string} Sizes attribute string
 * 
 * @example
 * ```typescript
 * const sizes = generateSizes('product', 'md');
 * // Returns: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
 * ```
 */
export function generateSizes(variant: 'product' | 'thumbnail' | 'gallery' | 'hero', size: 'sm' | 'md' | 'lg' | 'xl'): string {
	const sizeMap = {
		product: {
			sm: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
			md: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw',
			lg: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 30vw',
			xl: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 40vw, 35vw',
		},
		thumbnail: {
			sm: '80px',
			md: '120px',
			lg: '160px',
			xl: '200px',
		},
		gallery: {
			sm: '(max-width: 640px) 100vw, 50vw',
			md: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw',
			lg: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw',
			xl: '(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 60vw',
		},
		hero: {
			sm: '100vw',
			md: '100vw',
			lg: '100vw',
			xl: '100vw',
		},
	}

	return sizeMap[variant]?.[size] || sizeMap.product.md
}

/**
 * Generates a complete responsive image configuration.
 * Combines srcset and sizes for optimal responsive image delivery.
 * 
 * @param {string} productId - Product ID
 * @param {string} imageName - Image filename
 * @param {string} variant - Image variant
 * @param {string} size - Image size preset
 * @param {ImageSize} options - Optional size/quality parameters
 * @returns {Object} Responsive image configuration
 * 
 * @example
 * ```typescript
 * const config = generateResponsiveImage(
 *   product.id,
 *   product.files[0].name,
 *   'product',
 *   'md'
 * );
 * // Returns: { src, srcset, sizes }
 * ```
 */
export function generateResponsiveImage(
	productId: string,
	imageName: string,
	variant: 'product' | 'thumbnail' | 'gallery' | 'hero' = 'product',
	size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
	options?: ImageSize
): {
	src: string | null
	srcset: string
	sizes: string
} {
	const baseUrl = getProductImageUrl(productId, imageName, options)
	if (!baseUrl) {
		return {
			src: null,
			srcset: '',
			sizes: '',
		}
	}

	const srcset = generateSrcset(baseUrl)
	const sizes = generateSizes(variant, size)

	return {
		src: baseUrl,
		srcset,
		sizes,
	}
}

