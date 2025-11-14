/**
 * Image Transform Service
 * 
 * Client-side image transformation service for on-the-fly image processing.
 * Supports resize, crop, format conversion, and quality optimization.
 * 
 * **Features:**
 * - Client-side image transformations
 * - Format detection and conversion
 * - Quality optimization
 * - Resize and crop operations
 * - Transformation caching
 * 
 * **Use Cases:**
 * - On-the-fly image resizing
 * - Format conversion (JPEG → WebP)
 * - Quality optimization
 * - Thumbnail generation
 * - Image cropping
 * 
 * **Note:** For production, server-side transformations are recommended.
 * This service is useful for client-side previews and fallbacks.
 * 
 * @module ImageTransformService
 */

import { logger } from '@_utils/logger'

/**
 * Image transformation options.
 */
export interface TransformOptions {
	/** Target width in pixels */
	width?: number
	/** Target height in pixels */
	height?: number
	/** Image quality (1-100) */
	quality?: number
	/** Output format */
	format?: 'webp' | 'jpeg' | 'png'
	/** Maintain aspect ratio */
	maintainAspectRatio?: boolean
	/** Crop mode */
	crop?: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Image transformation result.
 */
export interface TransformResult {
	/** Transformed image as data URL */
	dataUrl: string
	/** Original dimensions */
	originalDimensions: { width: number; height: number }
	/** Transformed dimensions */
	transformedDimensions: { width: number; height: number }
	/** File size reduction percentage */
	sizeReduction?: number
}

/**
 * Image Transform Service Class
 * 
 * Provides client-side image transformation capabilities.
 * Uses HTML5 Canvas API for image processing.
 */
export class ImageTransformService {
	/**
	 * Transforms an image with the specified options.
	 * 
	 * @param {string | File} source - Image source (URL or File object)
	 * @param {TransformOptions} options - Transformation options
	 * @returns {Promise<TransformResult>} Transformation result
	 * 
	 * @example
	 * ```typescript
	 * // Resize image
	 * const result = await ImageTransformService.transform(imageUrl, {
	 *   width: 800,
 *   quality: 85,
	 *   format: 'webp'
	 * });
	 * 
	 * // Use transformed image
	 * const img = new Image();
	 * img.src = result.dataUrl;
	 * ```
	 */
	static async transform(
		source: string | File,
		options: TransformOptions = {}
	): Promise<TransformResult> {
		return new Promise((resolve, reject) => {
			const img = new Image()
			// Only set crossOrigin for external URLs to avoid CORS issues
			if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
				img.crossOrigin = 'anonymous'
			}

			img.onload = () => {
				try {
					const result = this.processImage(img, options)
					resolve(result)
				} catch (error) {
					reject(error)
				}
			}

			img.onerror = () => {
				reject(new Error('Failed to load image for transformation'))
			}

			// Load image from source
			if (typeof source === 'string') {
				img.src = source
			} else {
				const reader = new FileReader()
				reader.onload = (e) => {
					img.src = e.target?.result as string
				}
				reader.onerror = () => {
					reject(new Error('Failed to read file'))
				}
				reader.readAsDataURL(source)
			}
		})
	}

	/**
	 * Processes image using Canvas API.
	 */
	private static processImage(img: HTMLImageElement, options: TransformOptions): TransformResult {
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')

		if (!ctx) {
			throw new Error('Canvas context not available')
		}

		const originalWidth = img.width
		const originalHeight = img.height

		// Calculate dimensions
		let targetWidth = options.width || originalWidth
		let targetHeight = options.height || originalHeight

		// Maintain aspect ratio if requested
		if (options.maintainAspectRatio && (options.width || options.height)) {
			const aspectRatio = originalWidth / originalHeight

			if (options.width && !options.height) {
				targetHeight = Math.round(targetWidth / aspectRatio)
			} else if (options.height && !options.width) {
				targetWidth = Math.round(targetHeight * aspectRatio)
			} else if (options.width && options.height) {
				// Fit within bounds while maintaining aspect ratio
				const widthRatio = targetWidth / originalWidth
				const heightRatio = targetHeight / originalHeight
				const ratio = Math.min(widthRatio, heightRatio)

				targetWidth = Math.round(originalWidth * ratio)
				targetHeight = Math.round(originalHeight * ratio)
			}
		}

		// Set canvas dimensions
		canvas.width = targetWidth
		canvas.height = targetHeight

		// Calculate crop position if needed
		let sx = 0
		let sy = 0
		let sw = originalWidth
		let sh = originalHeight

		if (options.crop && options.width && options.height) {
			// Calculate crop area
			const cropAspectRatio = targetWidth / targetHeight
			const imageAspectRatio = originalWidth / originalHeight

			if (imageAspectRatio > cropAspectRatio) {
				// Image is wider, crop width
				sw = Math.round(originalHeight * cropAspectRatio)
				sx = this.getCropOffset(originalWidth, sw, options.crop)
			} else {
				// Image is taller, crop height
				sh = Math.round(originalWidth / cropAspectRatio)
				sy = this.getCropOffset(originalHeight, sh, options.crop)
			}
		}

		// Draw image to canvas
		ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight)

		// Get image data URL with format and quality
		const format = options.format || 'jpeg'
		const quality = options.quality ? options.quality / 100 : 0.92

		let mimeType = 'image/jpeg'
		if (format === 'webp') {
			mimeType = 'image/webp'
		} else if (format === 'png') {
			mimeType = 'image/png'
		}

		const dataUrl = canvas.toDataURL(mimeType, quality)

		// Calculate size reduction (approximate)
		const originalSize = originalWidth * originalHeight * 4 // RGBA
		const transformedSize = targetWidth * targetHeight * 4
		const sizeReduction = ((originalSize - transformedSize) / originalSize) * 100

		return {
			dataUrl,
			originalDimensions: { width: originalWidth, height: originalHeight },
			transformedDimensions: { width: targetWidth, height: targetHeight },
			sizeReduction: Math.max(0, sizeReduction),
		}
	}

	/**
	 * Gets crop offset based on crop mode.
	 */
	private static getCropOffset(totalSize: number, cropSize: number, crop: string): number {
		switch (crop) {
			case 'center':
				return Math.round((totalSize - cropSize) / 2)
			case 'top':
			case 'left':
				return 0
			case 'bottom':
			case 'right':
				return totalSize - cropSize
			default:
				return 0
		}
	}

	/**
	 * Detects image format from URL or File.
	 * 
	 * @param {string | File} source - Image source
	 * @returns {Promise<string>} Detected format (webp, jpeg, png, etc.)
	 */
	static async detectFormat(source: string | File): Promise<string> {
		if (typeof source === 'string') {
			// Detect from URL extension
			const extension = source.split('.').pop()?.toLowerCase()
			return extension || 'jpeg'
		} else {
			// Detect from File type
			const mimeType = source.type
			if (mimeType.includes('webp')) return 'webp'
			if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpeg'
			if (mimeType.includes('png')) return 'png'
			return 'jpeg'
		}
	}

	/**
	 * Checks if browser supports WebP format.
	 * 
	 * @returns {boolean} True if WebP is supported
	 */
	static supportsWebP(): boolean {
		if (typeof window === 'undefined') {
			return false
		}

		const canvas = document.createElement('canvas')
		canvas.width = 1
		canvas.height = 1
		return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
	}

	/**
	 * Checks if browser supports AVIF format.
	 * 
	 * @returns {Promise<boolean>} True if AVIF is supported
	 */
	static async supportsAVIF(): Promise<boolean> {
		if (typeof window === 'undefined') {
			return false
		}

		return new Promise((resolve) => {
			const img = new Image()
			img.onload = () => resolve(true)
			img.onerror = () => resolve(false)
			img.src =
				'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
		})
	}

	/**
	 * Gets the best format for the current browser.
	 * 
	 * @returns {Promise<'avif' | 'webp' | 'jpeg'>} Best supported format
	 */
	static async getBestFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
		if (await this.supportsAVIF()) {
			return 'avif'
		}
		if (this.supportsWebP()) {
			return 'webp'
		}
		return 'jpeg'
	}
}

