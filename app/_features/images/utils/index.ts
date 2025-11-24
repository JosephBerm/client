/**
 * Image Utilities - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Pure utility functions for image operations.
 * Server + Client safe (no React dependencies).
 * 
 * @example
 * ```typescript
 * import { getProductImageUrl, supportsWebP, getNetworkSpeed } from '@_features/images'
 * ```
 * 
 * @module images/utils
 */

// Image Utils
export {
	getBlurDataUrl,
	getImageBaseUrl,
	getProductImageUrl,
	validateImageUrl,
	getImageFallbackUrl,
	clearImageUrlCache,
	getImageUrlCacheSize,
	RESPONSIVE_BREAKPOINTS,
	generateSrcset,
	generateSizes,
	generateResponsiveImage,
	type ImageSize,
} from './imageUtils'

// Browser Utils
export {
	getNetworkSpeed,
	isDataSaverEnabled,
	getOptimalImageQuality,
	clearFormatCache,
	type NetworkSpeed,
	type BrowserCapabilities,
} from './browserUtils'

