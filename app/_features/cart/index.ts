/**
 * Cart Feature - Main Barrel Export
 * 
 * Shopping cart management and persistence.
 * 
 * @example
 * ```typescript
 * import { useCartStore, CartItem } from '@_features/cart'
 * ```
 * 
 * @module cart
 */

// Stores
export * from './stores'

// Re-export CartItem type for convenience
export type { CartItem } from './stores/useCartStore'

