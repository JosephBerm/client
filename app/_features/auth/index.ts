/**
 * Auth Feature - Main Barrel Export (Optimized for Tree-Shaking)
 *
 * Authentication and authorization infrastructure.
 *
 * **Architecture:**
 * - Services: Server-safe auth functions
 * - Stores: Client-only Zustand store (has 'use client')
 * - Redirect: Centralized post-auth redirect management
 *
 * @example
 * ```typescript
 * import { logout, getAuthToken, useAuthStore, AuthRedirectService } from '@_features/auth'
 *
 * // Server Component (functions only)
 * const token = getAuthToken()
 *
 * // Client Component (all exports)
 * 'use client'
 * const user = useAuthStore(state => state.user)
 * logout()
 *
 * // Post-auth redirect management
 * AuthRedirectService.captureIntent('open_chat')
 * const { executePostAuthRedirect } = useAuthRedirect()
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
	verifyMfa,
	type LoginResult,
} from './services/AuthService'

// ============================================================================
// AUTH REDIRECT SERVICE (MAANG-Level Post-Auth Navigation)
// ============================================================================

export {
	AuthRedirectService,
	type AuthIntent,
	type StoredIntent,
	type PostAuthRedirect,
} from './services/AuthRedirectService'

// ============================================================================
// AUTH HOOKS (Client-Only)
// ============================================================================

export {
	useAuthRedirect,
	type CaptureIntentOptions,
	type ExecuteRedirectOptions,
	type UseAuthRedirectReturn,
} from './hooks/useAuthRedirect'

// ============================================================================
// AUTH STORE (Client-Only - has 'use client')
// ============================================================================

export { useAuthStore } from './stores/useAuthStore'

