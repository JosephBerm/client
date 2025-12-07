/**
 * Cart Feature - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Shopping cart management and persistence.
 * Client-only (Zustand store with 'use client' directive).
 * 
 * @example
 * ```typescript
 * import { useCartStore, type CartItem } from '@_features/cart'
 * import { useCartPageLogic } from '@_features/cart'
 * ```
 * 
 * @module cart
 */

// ============================================================================
// STORE (Client-Only - has 'use client')
// ============================================================================

export { useCartStore, type CartItem } from './stores/useCartStore'

// ============================================================================
// HOOKS (Client-Only - all have 'use client')
// ============================================================================

export {
	useCartPageLogic,
	type UseCartPageLogicReturn,
} from './hooks/useCartPageLogic'

