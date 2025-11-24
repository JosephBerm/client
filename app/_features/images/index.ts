/**
 * Images Feature - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Complete image infrastructure for the MedSource Pro application.
 * Combines services, hooks, utilities, and components.
 * 
 * **Architecture:**
 * - Services: Image operations, caching, CDN management
 * - Hooks: React state management (client-only)
 * - Utils: Pure functions (server + client safe)
 * - Components: UI components (client-only)
 * 
 * @example
 * ```typescript
 * import {
 *   ImageService,
 *   useImageError,
 *   getProductImageUrl,
 *   OptimizedImage
 * } from '@_features/images'
 * ```
 * 
 * @module images
 */

// ============================================================================
// SERVICES (Business Logic)
// ============================================================================

export { ImageService } from './services/ImageService'
export { ImageCacheService } from './services/ImageCacheService'
export { ImagePreloadService } from './services/ImagePreloadService'
export { ImageTransformService } from './services/ImageTransformService'
export { CDNService } from './services/CDNService'

// ============================================================================
// HOOKS (Client-Only - have 'use client')
// ============================================================================

export {
	useImage,
	type UseImageOptions,
	type UseImageReturn,
} from './hooks/useImage'

export {
	useImageError,
	type ErrorStrategy,
	type UseImageErrorOptions,
	type UseImageErrorReturn,
} from './hooks/useImageError'

export {
	useImageAnalytics,
	type ImageLoadMetrics,
	type InteractionType,
	type ImageInteraction,
	type UseImageAnalyticsOptions,
	type UseImageAnalyticsReturn,
} from './hooks/useImageAnalytics'

// ============================================================================
// UTILITIES (Server + Client Safe)
// ============================================================================

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
} from './utils/imageUtils'

export {
	getNetworkSpeed,
	isDataSaverEnabled,
	getOptimalImageQuality,
	clearFormatCache,
	type NetworkSpeed,
	type BrowserCapabilities,
} from './utils/browserUtils'

// ============================================================================
// COMPONENTS MOVED TO @_components/images
// ============================================================================
// Image components are now exported from @_components/images
// This maintains clean architecture: features export business logic only

