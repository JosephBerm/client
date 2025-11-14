/**
 * Image Components - Barrel Export
 * 
 * Centralized export for all image-related UI components.
 * Provides a single import path for consuming components.
 * 
 * **Components:**
 * - OptimizedImage: Core image wrapper with lazy loading
 * - ImageLoadingState: Skeleton loader for images
 * - ImagePlaceholder: Fallback placeholder component
 * - ImageLightbox: Full-screen image viewer
 * 
 * @example
 * ```typescript
 * import { OptimizedImage, ImageLightbox } from '@_features/images'
 * ```
 * 
 * @module images/components
 */

export { default as OptimizedImage } from './OptimizedImage'
export { default as ImageLoadingState } from './ImageLoadingState'
export { default as ImagePlaceholder } from './ImagePlaceholder'
export { default as ImageLightbox } from './ImageLightbox'

// Re-export types
export type { OptimizedImageProps } from './OptimizedImage'
export type { ImageLoadingStateProps } from './ImageLoadingState'
export type { ImagePlaceholderProps } from './ImagePlaceholder'
export type { ImageLightboxProps } from './ImageLightbox'

