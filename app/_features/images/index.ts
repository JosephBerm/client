/**
 * Images Feature - Main Barrel Export
 * 
 * Complete image infrastructure for the MedSource Pro application.
 * Combines services, hooks, utilities, and components into a single module.
 * 
 * **Architecture:**
 * ```
 * images/
 * ├── services/    → Business logic with side effects
 * ├── hooks/       → React state management
 * ├── utils/       → Pure utility functions
 * └── components/  → UI components
 * ```
 * 
 * **Usage:**
 * ```typescript
 * // Import everything from one place
 * import {
 *   // Services
 *   ImageService,
 *   CDNService,
 *   
 *   // Hooks
 *   useImageError,
 *   useImageAnalytics,
 *   
 *   // Utils
 *   getProductImageUrl,
 *   supportsWebP,
 *   
 *   // Components
 *   OptimizedImage,
 *   ImageLightbox
 * } from '@_features/images'
 * ```
 * 
 * **Benefits:**
 * - ✅ Single import path
 * - ✅ Clear module boundaries
 * - ✅ Better tree-shaking
 * - ✅ Easier maintenance
 * - ✅ Feature isolation
 * 
 * @module images
 */

// Services
export * from './services'

// Hooks
export * from './hooks'

// Utilities
export * from './utils'

// Components
export * from './components'

