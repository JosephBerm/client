'use client'

import { getCookie, deleteCookie, setCookie } from 'cookies-next'
import type { IUser } from '@_classes/User'
import type LoginCredentials from '@_classes/LoginCredentials'
import type { RegisterModel } from '@_classes/User'

// API URL from environment
const API_URL = process.env.API_URL || 'http://localhost:5254/api'

interface ApiResponse<T> {
	payload: T | null
	message: string | null
	statusCode: number
}

/**
 * Check if user is authenticated by verifying token and fetching user data
 */
export async function checkAuthStatus(): Promise<IUser | null> {
	const token = getCookie('at')

	if (!token) {
		return null
	}

	try {
		const response = await fetch(`${API_URL}/account`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (!response.ok) {
			// Token is invalid, clear it
			deleteCookie('at')
			return null
		}

		const data: ApiResponse<IUser> = await response.json()
		return data.payload
	} catch (error) {
		console.error('Error checking auth status:', error)
		return null
	}
}

/**
 * Login user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<{
	success: boolean
	user?: IUser
	token?: string
	message?: string
}> {
	try {
		const response = await fetch(`${API_URL}/account/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(credentials),
		})

		const data: ApiResponse<{ account: IUser; token: string }> = await response.json()

		if (response.ok && data.payload) {
			// Store token in cookie
			setCookie('at', data.payload.token, {
				maxAge: credentials.rememberUser ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
			})

			return {
				success: true,
				user: data.payload.account,
				token: data.payload.token,
			}
		}

		return {
			success: false,
			message: data.message || 'Login failed',
		}
	} catch (error) {
		console.error('Login error:', error)
		return {
			success: false,
			message: 'Network error occurred',
		}
	}
}

/**
 * Signup new user
 */
export async function signup(form: RegisterModel): Promise<{
	success: boolean
	user?: IUser
	message?: string
}> {
	try {
		const response = await fetch(`${API_URL}/account/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(form),
		})

		const data: ApiResponse<IUser> = await response.json()

		if (response.ok && data.payload) {
			return {
				success: true,
				user: data.payload,
			}
		}

		return {
			success: false,
			message: data.message || 'Signup failed',
		}
	} catch (error) {
		console.error('Signup error:', error)
		return {
			success: false,
			message: 'Network error occurred',
		}
	}
}

/**
 * Logout user
 */
export function logout(): void {
	deleteCookie('at')
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | undefined {
	return getCookie('at')?.toString()
}


