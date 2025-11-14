/**
 * Image Utilities - Barrel Export
 * 
 * Centralized export for all image-related utility functions.
 * Provides a single import path for consuming components.
 * 
 * **Utilities:**
 * - imageUtils: URL construction, blur placeholders
 * - browserUtils: WebP/AVIF detection, network speed
 * 
 * @example
 * ```typescript
 * import { getProductImageUrl, supportsWebP } from '@_features/images'
 * ```
 * 
 * @module images/utils
 */

export * from './imageUtils'
export * from './browserUtils'

