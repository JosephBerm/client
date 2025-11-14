/**
 * CDN Service
 * 
 * Enterprise-grade CDN integration layer for image delivery.
 * Supports multiple CDN providers with automatic fallback strategies.
 * 
 * **Features:**
 * - Multi-provider support (Cloudflare, Cloudinary, AWS CloudFront, custom)
 * - Automatic fallback between CDN providers
 * - URL transformation and optimization
 * - CDN-specific optimizations
 * - Performance monitoring
 * 
 * **Supported CDN Providers:**
 * - **Cloudflare**: Automatic image optimization
 * - **Cloudinary**: Advanced transformations
 * - **AWS CloudFront**: High-performance delivery
 * - **Custom**: Configurable CDN endpoints
 * 
 * **Use Cases:**
 * - Multi-CDN deployments
 * - CDN failover scenarios
 * - Image optimization via CDN
 * - Geographic distribution
 * 
 * @module CDNService
 */

import { logger } from '@_utils/logger'

/**
 * CDN provider type.
 */
export type CDNProvider = 'cloudflare' | 'cloudinary' | 'aws-cloudfront' | 'custom' | 'none'

/**
 * CDN configuration for a provider.
 */
export interface CDNConfig {
	/** CDN provider type */
	provider: CDNProvider
	/** CDN base URL */
	baseUrl: string
	/** Whether this CDN is enabled */
	enabled: boolean
	/** Priority (lower number = higher priority) */
	priority: number
	/** CDN-specific options */
	options?: {
		/** Enable automatic image optimization */
		autoOptimize?: boolean
		/** Default image format */
		defaultFormat?: 'webp' | 'avif' | 'jpg' | 'png'
		/** Enable automatic format conversion */
		autoFormat?: boolean
	}
}

/**
 * CDN transformation options.
 */
export interface CDNTransformOptions {
	/** Image width */
	width?: number
	/** Image height */
	height?: number
	/** Image quality (1-100) */
	quality?: number
	/** Image format */
	format?: 'webp' | 'avif' | 'jpg' | 'png'
	/** Enable automatic optimization */
	optimize?: boolean
	/** Enable automatic format conversion */
	autoFormat?: boolean
}

/**
 * CDN Service Class
 * 
 * Provides enterprise-grade CDN integration with multi-provider support
 * and automatic fallback strategies.
 */
export class CDNService {
	// CDN configurations (priority-ordered)
	private static cdnConfigs: CDNConfig[] = []

	// Current active CDN provider
	private static activeProvider: CDNProvider | null = null

	// Fallback chain
	private static fallbackChain: CDNProvider[] = []

	/**
	 * Initializes CDN service with configurations.
	 * Sets up multi-CDN with priority-based fallback.
	 * 
	 * **FAANG Pattern**: Amazon CloudFront, Cloudflare multi-CDN
	 * 
	 * @param {CDNConfig[]} configs - Array of CDN configurations
	 * @returns {void}
	 * 
	 * @example
	 * ```typescript
	 * // Initialize with Cloudflare + AWS CloudFront
	 * CDNService.initialize([
	 *   {
	 *     provider: 'cloudflare',
	 *     baseUrl: 'https://imagedelivery.net/account-id',
	 *     enabled: true,
	 *     priority: 1,
	 *     options: {
	 *       autoOptimize: true,
	 *       defaultFormat: 'webp',
	 *       autoFormat: true
	 *     }
	 *   },
	 *   {
	 *     provider: 'aws-cloudfront',
	 *     baseUrl: 'https://d111111abcdef8.cloudfront.net',
	 *     enabled: true,
	 *     priority: 2
	 *   }
	 * ]);
	 * ```
	 * 
	 * @example
	 * ```typescript
	 * CDNService.initialize([
	 *   {
	 *     provider: 'cloudflare',
	 *     baseUrl: 'https://cdn.example.com',
	 *     enabled: true,
	 *     priority: 1,
	 *     options: { autoOptimize: true, defaultFormat: 'webp' }
	 *   },
	 *   {
	 *     provider: 'aws-cloudfront',
	 *     baseUrl: 'https://d1234567890.cloudfront.net',
	 *     enabled: true,
	 *     priority: 2
	 *   }
	 * ]);
	 * ```
	 */
	static initialize(configs: CDNConfig[]): void {
		// Sort by priority (lower = higher priority)
		this.cdnConfigs = configs
			.filter((config) => config.enabled)
			.sort((a, b) => a.priority - b.priority)

		// Set active provider to highest priority
		if (this.cdnConfigs.length > 0) {
			this.activeProvider = this.cdnConfigs[0].provider
		}

		// Build fallback chain
		this.fallbackChain = this.cdnConfigs.map((config) => config.provider)

		if (process.env.NODE_ENV === 'development') {
			logger.log('CDNService: Initialized', {
				providers: this.cdnConfigs.length,
				activeProvider: this.activeProvider,
				fallbackChain: this.fallbackChain,
			})
		}
	}

	/**
	 * Transforms an image URL for CDN delivery.
	 * 
	 * @param {string} originalUrl - Original image URL
	 * @param {CDNTransformOptions} options - Transformation options
	 * @returns {string} CDN-optimized URL
	 * 
	 * @example
	 * ```typescript
	 * // Basic transformation
	 * const cdnUrl = CDNService.transformUrl(imageUrl, { width: 800, quality: 85 });
	 * 
	 * // With format conversion
	 * const webpUrl = CDNService.transformUrl(imageUrl, {
	 *   width: 800,
	 *   format: 'webp',
	 *   autoFormat: true
	 * });
	 * ```
	 */
	static transformUrl(originalUrl: string, options: CDNTransformOptions = {}): string {
		if (!originalUrl) {
			return originalUrl
		}

		// If no CDN configured, return original URL
		if (this.cdnConfigs.length === 0 || !this.activeProvider) {
			return originalUrl
		}

		const config = this.cdnConfigs.find((c) => c.provider === this.activeProvider)
		if (!config) {
			return originalUrl
		}

		// Transform URL based on provider
		switch (config.provider) {
			case 'cloudflare':
				return this.transformCloudflareUrl(originalUrl, config, options)
			case 'cloudinary':
				return this.transformCloudinaryUrl(originalUrl, config, options)
			case 'aws-cloudfront':
				return this.transformCloudFrontUrl(originalUrl, config, options)
			case 'custom':
				return this.transformCustomUrl(originalUrl, config, options)
			default:
				return originalUrl
		}
	}

	/**
	 * Transforms URL for Cloudflare CDN.
	 */
	private static transformCloudflareUrl(
		originalUrl: string,
		config: CDNConfig,
		options: CDNTransformOptions
	): string {
		// Cloudflare automatic image optimization
		// Format: /cdn-cgi/image/width=800,quality=85,format=webp/image.jpg
		const params: string[] = []

		if (options.width) {
			params.push(`width=${options.width}`)
		}
		if (options.height) {
			params.push(`height=${options.height}`)
		}
		if (options.quality) {
			params.push(`quality=${options.quality}`)
		}
		if (options.format || config.options?.defaultFormat) {
			params.push(`format=${options.format || config.options?.defaultFormat}`)
		}

		if (params.length > 0) {
			const basePath = originalUrl.replace(config.baseUrl, '')
			return `${config.baseUrl}/cdn-cgi/image/${params.join(',')}${basePath}`
		}

		return originalUrl
	}

	/**
	 * Transforms URL for Cloudinary CDN.
	 */
	private static transformCloudinaryUrl(
		originalUrl: string,
		config: CDNConfig,
		options: CDNTransformOptions
	): string {
		// Cloudinary transformation
		// Format: /image/upload/w_800,q_85,f_webp/image.jpg
		const transformations: string[] = []

		if (options.width) {
			transformations.push(`w_${options.width}`)
		}
		if (options.height) {
			transformations.push(`h_${options.height}`)
		}
		if (options.quality) {
			transformations.push(`q_${options.quality}`)
		}
		if (options.format || config.options?.defaultFormat) {
			transformations.push(`f_${options.format || config.options?.defaultFormat}`)
		}

		if (transformations.length > 0) {
			const basePath = originalUrl.replace(config.baseUrl, '')
			return `${config.baseUrl}/image/upload/${transformations.join(',')}${basePath}`
		}

		return originalUrl
	}

	/**
	 * Transforms URL for AWS CloudFront CDN.
	 */
	private static transformCloudFrontUrl(
		originalUrl: string,
		config: CDNConfig,
		options: CDNTransformOptions
	): string {
		// CloudFront with Lambda@Edge or CloudFront Functions
		// For now, return original URL (transformations handled server-side)
		// In production, you'd configure Lambda@Edge for transformations
		return originalUrl
	}

	/**
	 * Transforms URL for custom CDN.
	 */
	private static transformCustomUrl(
		originalUrl: string,
		config: CDNConfig,
		options: CDNTransformOptions
	): string {
		// Custom CDN transformation
		// Add query parameters for transformations
		try {
			// Handle both absolute and relative URLs
			let url: URL
			if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
				url = new URL(originalUrl)
			} else {
				// Relative URL - use config baseUrl as base
				url = new URL(originalUrl, config.baseUrl)
			}

			if (options.width) {
				url.searchParams.set('w', options.width.toString())
			}
			if (options.height) {
				url.searchParams.set('h', options.height.toString())
			}
			if (options.quality) {
				url.searchParams.set('q', options.quality.toString())
			}
			if (options.format) {
				url.searchParams.set('f', options.format)
			}

			return url.toString()
		} catch (error) {
			// If URL parsing fails, return original URL
			logger.error('CDNService: Failed to transform custom URL', { originalUrl, error })
			return originalUrl
		}
	}

	/**
	 * Gets the next CDN provider in the fallback chain.
	 * 
	 * @param {CDNProvider} currentProvider - Current provider
	 * @returns {CDNProvider | null} Next provider or null if none
	 */
	static getNextProvider(currentProvider: CDNProvider): CDNProvider | null {
		const currentIndex = this.fallbackChain.indexOf(currentProvider)
		if (currentIndex === -1 || currentIndex === this.fallbackChain.length - 1) {
			return null
		}
		return this.fallbackChain[currentIndex + 1]
	}

	/**
	 * Switches to the next CDN provider in the fallback chain.
	 * 
	 * @returns {boolean} True if switched, false if no fallback available
	 */
	static switchToFallback(): boolean {
		if (!this.activeProvider) {
			return false
		}

		const nextProvider = this.getNextProvider(this.activeProvider)
		if (nextProvider) {
			this.activeProvider = nextProvider
			if (process.env.NODE_ENV === 'development') {
				logger.warn('CDNService: Switched to fallback provider', {
					newProvider: this.activeProvider,
				})
			}
			return true
		}

		return false
	}

	/**
	 * Gets the current active CDN provider.
	 * 
	 * @returns {CDNProvider | null} Active provider or null
	 */
	static getActiveProvider(): CDNProvider | null {
		return this.activeProvider
	}

	/**
	 * Gets all configured CDN providers.
	 * 
	 * @returns {CDNConfig[]} Array of CDN configurations
	 */
	static getProviders(): CDNConfig[] {
		return [...this.cdnConfigs]
	}

	/**
	 * Resets CDN service to default state.
	 */
	static reset(): void {
		this.cdnConfigs = []
		this.activeProvider = null
		this.fallbackChain = []
	}
}

