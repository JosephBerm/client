import { getCookies, setCookie, deleteCookie } from 'cookies-next'
import API from './api'
import { IUser } from '@_classes/User'
import User from '@_classes/User'
import baseInstance from './httpService'

export class AuthService {
	/**
	 * Get the authentication token from cookies
	 */
	static getToken(): string | null {
		const cookies = getCookies()
		return cookies['at'] || null
	}

	/**
	 * Set the authentication token in cookies
	 */
	static setToken(token: string, rememberMe: boolean = false): void {
		const options = rememberMe
			? {
					maxAge: 60 * 60 * 24 * 30, // 30 days
			  }
			: {
					maxAge: 60 * 60 * 24, // 1 day
			  }

		setCookie('at', token, options)
		baseInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
	}

	/**
	 * Remove the authentication token from cookies
	 */
	static removeToken(): void {
		deleteCookie('at')
		delete baseInstance.defaults.headers.common['Authorization']
	}

	/**
	 * Check if user is authenticated (has valid token)
	 */
	static isAuthenticated(): boolean {
		return this.getToken() !== null
	}

	/**
	 * Get current user data from server
	 */
	static async getCurrentUser(): Promise<IUser | null> {
		try {
			const token = this.getToken()
			if (!token) return null

			const response = await API.Accounts.get(null)
			if (response.data?.payload) {
				return response.data.payload as IUser
			}
			return null
		} catch (error) {
			console.error('Failed to get current user:', error)
			return null
		}
	}

	/**
	 * Login with credentials
	 */
	static async login(
		username: string,
		password: string,
		rememberMe: boolean = false
	): Promise<{ success: boolean; token?: string; message?: string }> {
		try {
			const response = await API.login({ username, password, rememberUser: rememberMe })
			if (response.data?.payload) {
				const token = response.data.payload as string
				this.setToken(token, rememberMe)
				return { success: true, token }
			}
			return { success: false, message: response.data?.message || 'Login failed' }
		} catch (error: any) {
			return { success: false, message: error.message || 'Login failed' }
		}
	}

	/**
	 * Logout current user
	 */
	static logout(): void {
		this.removeToken()
	}

	/**
	 * Validate token by fetching user data
	 */
	static async validateToken(): Promise<boolean> {
		try {
			const user = await this.getCurrentUser()
			return user !== null
		} catch {
			return false
		}
	}
}

