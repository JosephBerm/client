import { create } from 'zustand'
import { IUser } from '@_classes/User'
import User from '@_classes/User'
import { AuthService } from '@_services/AuthService'

interface AuthStore {
	user: IUser | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	// Actions
	setUser: (user: IUser | null) => void
	clearUser: () => void
	checkAuth: () => Promise<void>
	login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>
	logout: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null,

	setUser: (user) => {
		set({ user, isAuthenticated: !!user, error: null })
	},

	clearUser: () => {
		set({ user: null, isAuthenticated: false, error: null })
	},

	checkAuth: async () => {
		set({ isLoading: true, error: null })
		try {
			const token = AuthService.getToken()
			if (!token) {
				set({ isLoading: false, isAuthenticated: false, user: null })
				return
			}

			const user = await AuthService.getCurrentUser()
			if (user) {
				set({ user, isAuthenticated: true, isLoading: false })
			} else {
				// Token is invalid, clear it
				AuthService.removeToken()
				set({ user: null, isAuthenticated: false, isLoading: false })
			}
		} catch (error: any) {
			console.error('Auth check failed:', error)
			AuthService.removeToken()
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: error.message || 'Authentication check failed',
			})
		}
	},

	login: async (username: string, password: string, rememberMe: boolean = false) => {
		set({ isLoading: true, error: null })
		try {
			const result = await AuthService.login(username, password, rememberMe)
			if (result.success && result.token) {
				// Fetch user data after successful login
				const user = await AuthService.getCurrentUser()
				if (user) {
					set({ user, isAuthenticated: true, isLoading: false, error: null })
					return true
				}
			}
			set({
				isLoading: false,
				error: result.message || 'Login failed',
				isAuthenticated: false,
			})
			return false
		} catch (error: any) {
			set({
				isLoading: false,
				error: error.message || 'Login failed',
				isAuthenticated: false,
			})
			return false
		}
	},

	logout: () => {
		AuthService.logout()
		set({ user: null, isAuthenticated: false, error: null })
	},
}))

