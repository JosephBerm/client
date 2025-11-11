/**
 * Authentication State Management Store
 * 
 * Zustand store for managing authentication state across the application.
 * Persists user data to localStorage for session persistence across page reloads.
 * Works in conjunction with AuthService for API authentication operations.
 * 
 * **Features:**
 * - Persistent authentication state
 * - Automatic token validation on app init
 * - Type-safe user data
 * - Loading state management
 * - localStorage synchronization
 * 
 * **Use Cases:**
 * - Check if user is authenticated
 * - Access current user data
 * - Manage login/logout state
 * - Display user info in navigation
 * 
 * @example
 * ```typescript
 * // Access authentication state in any component
 * const { user, isAuthenticated, isLoading } = useAuthStore();
 * 
 * // Check auth and display conditionally
 * if (isAuthenticated && user) {
 *   return <div>Welcome, {user.name.fullName}!</div>;
 * }
 * 
 * // Login a user
 * const login = useAuthStore(state => state.login);
 * login(userData);
 * 
 * // Logout
 * const logout = useAuthStore(state => state.logout);
 * logout();
 * ```
 * 
 * @module useAuthStore
 */

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { IUser } from '@_classes/User'

/**
 * Authentication state interface.
 * Contains current user data and authentication status.
 */
interface AuthState {
	/** Current authenticated user, or null if not logged in */
	user: IUser | null
	/** Whether user is currently authenticated */
	isAuthenticated: boolean
	/** Whether auth check is in progress (used during app initialization) */
	isLoading: boolean
}

/**
 * Authentication actions interface.
 * Methods for managing authentication state.
 */
interface AuthActions {
	/** Sets user data and marks as authenticated */
	setUser: (user: IUser) => void
	/** Clears user data and marks as not authenticated */
	clearUser: () => void
	/** Logs in a user (same as setUser, semantic clarity) */
	login: (user: IUser) => void
	/** Logs out the current user */
	logout: () => void
	/** Validates token and loads user data from server */
	checkAuth: () => Promise<void>
}

/**
 * Combined authentication store type.
 */
type AuthStore = AuthState & AuthActions

/**
 * Zustand authentication store with localStorage persistence.
 * 
 * **State Persistence:**
 * - Persists: user, isAuthenticated
 * - Not persisted: isLoading (always starts as true on app init)
 * 
 * **Store Structure:**
 * - user: Current user object or null
 * - isAuthenticated: Boolean authentication status
 * - isLoading: Boolean loading state
 * - setUser(user): Set user and mark as authenticated
 * - clearUser(): Clear user and mark as not authenticated
 * - login(user): Semantic alias for setUser
 * - logout(): Clear user and authentication status
 * - checkAuth(): Validate token and load user from server
 * 
 * @example
 * ```typescript
 * // In a component
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 * 
 * // In middleware or route protection
 * const isAuthenticated = useAuthStore.getState().isAuthenticated;
 * 
 * // Check auth on app initialization
 * useEffect(() => {
 *   useAuthStore.getState().checkAuth();
 * }, []);
 * ```
 */
export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			isAuthenticated: false,
			isLoading: true, // Starts as true, set to false after auth check

			/**
			 * Sets the current user and marks as authenticated.
			 * Called after successful login or when loading persisted user data.
			 */
			setUser: (user) => {
				set({ user, isAuthenticated: true, isLoading: false })
			},

			/**
			 * Clears the current user and marks as not authenticated.
			 * Used during logout or when token validation fails.
			 */
			clearUser: () => {
				set({ user: null, isAuthenticated: false, isLoading: false })
			},

			/**
			 * Logs in a user by setting user data and authentication status.
			 * Semantic wrapper around setUser for clarity in login flows.
			 */
			login: (user) => {
				set({ user, isAuthenticated: true, isLoading: false })
			},

			/**
			 * Logs out the current user by clearing all auth state.
			 * Should be called alongside AuthService.logout() to clear cookies.
			 */
			logout: () => {
				set({ user: null, isAuthenticated: false, isLoading: false })
			},

			/**
			 * Validates the authentication token and loads user data from the server.
			 * Called on app initialization to restore authentication state.
			 * Uses dynamic import to avoid circular dependencies.
			 * 
			 * @async
			 * @returns {Promise<void>}
			 */
			checkAuth: async () => {
				// This will be called on app initialization by AuthInitializer
				try {
					// Dynamic import to avoid circular dependency
					const { checkAuthStatus } = await import('@_services/AuthService')
					const user = await checkAuthStatus()
					
					if (user) {
						// Token is valid, set user data
						set({ user, isAuthenticated: true, isLoading: false })
					} else {
						// Token is invalid or not present
						set({ user: null, isAuthenticated: false, isLoading: false })
					}
				} catch (error) {
					// Auth check failed (network error, server down, etc.)
					console.error('Auth check failed:', error)
					set({ user: null, isAuthenticated: false, isLoading: false })
				}
			},
		}),
		{
			name: 'auth-storage', // localStorage key
			storage: createJSONStorage(() => localStorage),
			// Only persist user data and auth status, not loading state
			// Loading state should always start as true on app init
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
)


