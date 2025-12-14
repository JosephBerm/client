/**
 * Auth Services - Barrel Export (Optimized for Tree-Shaking)
 * 
 * @module auth/services
 */

export {
	checkAuthStatus,
	login,
	signup,
	logout,
	getAuthToken,
} from './AuthService'

export {
	AuthRedirectService,
	type AuthIntent,
	type StoredIntent,
	type PostAuthRedirect,
} from './AuthRedirectService'

