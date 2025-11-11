'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { IUser } from '@_classes/User'

interface AuthState {
	user: IUser | null
	isAuthenticated: boolean
	isLoading: boolean
}

interface AuthActions {
	setUser: (user: IUser) => void
	clearUser: () => void
	login: (user: IUser) => void
	logout: () => void
	checkAuth: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			// State
			user: null,
			isAuthenticated: false,
			isLoading: true,

			// Actions
			setUser: (user) => {
				set({ user, isAuthenticated: true, isLoading: false })
			},

			clearUser: () => {
				set({ user: null, isAuthenticated: false, isLoading: false })
			},

			login: (user) => {
				set({ user, isAuthenticated: true, isLoading: false })
			},

			logout: () => {
				set({ user: null, isAuthenticated: false, isLoading: false })
			},

			checkAuth: async () => {
				// This will be called on app initialization
				// For now, we'll check if there's a token cookie
				try {
					const { checkAuthStatus } = await import('@_services/AuthService')
					const user = await checkAuthStatus()
					if (user) {
						set({ user, isAuthenticated: true, isLoading: false })
					} else {
						set({ user: null, isAuthenticated: false, isLoading: false })
					}
				} catch (error) {
					console.error('Auth check failed:', error)
					set({ user: null, isAuthenticated: false, isLoading: false })
				}
			},
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => localStorage),
			// Only persist user data, not loading state
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
)


