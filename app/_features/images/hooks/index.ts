/**
 * Image Hooks - Barrel Export (Optimized for Tree-Shaking)
 * 
 * React hooks for image state management, error handling, and analytics.
 * All hooks have 'use client' directive.
 * 
 * @example
 * ```typescript
 * import { useImage, useImageError, useImageAnalytics } from '@_features/images'
 * ```
 * 
 * @module images/hooks
 */

// useImage
export {
	useImage,
	type UseImageOptions,
	type UseImageReturn,
} from './useImage'

// useImageError
export {
	useImageError,
	type ErrorStrategy,
	type UseImageErrorOptions,
	type UseImageErrorReturn,
} from './useImageError'

// useImageAnalytics
export {
	useImageAnalytics,
	type ImageLoadMetrics,
	type InteractionType,
	type ImageInteraction,
	type UseImageAnalyticsOptions,
	type UseImageAnalyticsReturn,
} from './useImageAnalytics'

