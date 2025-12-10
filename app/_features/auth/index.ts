/**
 * Auth Feature - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Authentication and authorization infrastructure.
 * 
 * **Architecture:**
 * - Services: Server-safe auth functions
 * - Stores: Client-only Zustand store (has 'use client')
 * 
 * @example
 * ```typescript
 * import { logout, getAuthToken, useAuthStore } from '@_features/auth'
 * 
 * // Server Component (functions only)
 * const token = getAuthToken()
 * 
 * // Client Component (all exports)
 * 'use client'
 * const user = useAuthStore(state => state.user)
 * logout()
 * ```
 * 
 * @module auth
 */

// ============================================================================
// AUTH SERVICES (Server-Safe Functions)
// ============================================================================

export {
	checkAuthStatus,
	login,
	signup,
	logout,
	getAuthToken,
} from './services/AuthService'

// ============================================================================
// AUTH STORE (Client-Only - has 'use client')
// ============================================================================

export { useAuthStore } from './stores/useAuthStore'

