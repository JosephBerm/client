/**
 * Images Components - Main Barrel Export
 * 
 * Image-related UI components for the MedSource Pro application.
 * 
 * **Architecture:**
 * - Components live in @_components/images (presentation layer)
 * - Business logic (services, hooks) lives in @_features/images
 * - Clean separation of concerns
 * 
 * @example
 * ```typescript
 * import { OptimizedImage, ImageLightbox } from '@_components/images'
 * ```
 * 
 * @module images
 */

export { default as OptimizedImage } from './OptimizedImage'
export type { OptimizedImageProps } from './OptimizedImage'

export { default as ImageLightbox } from './ImageLightbox'
export type { ImageLightboxProps } from './ImageLightbox'

export { default as ImagePlaceholder } from './ImagePlaceholder'
export type { ImagePlaceholderProps } from './ImagePlaceholder'

export { default as ImageLoadingState } from './ImageLoadingState'
export type { ImageLoadingStateProps } from './ImageLoadingState'

