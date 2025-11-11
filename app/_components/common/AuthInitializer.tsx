'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@_stores/useAuthStore'
import { IUser } from '@_classes/User'

interface AuthInitializerProps {
	/**
	 * Optional user data from server-side rendering
	 * If provided, will be set immediately without making an API call
	 */
	user?: IUser | null
}

/**
 * Component that initializes authentication state on app mount
 * Should be placed in the root layout
 * 
 * If user prop is provided (from server-side), it will be set immediately.
 * Otherwise, it will check auth status via API call.
 */
export default function AuthInitializer({ user }: AuthInitializerProps) {
	const setUser = useAuthStore((state) => state.setUser)
	const checkAuth = useAuthStore((state) => state.checkAuth)

	useEffect(() => {
		if (user?.id != null) {
			// User data provided from server-side, set it immediately
			setUser(user)
		} else {
			// No user data, check auth status via API
			checkAuth()
		}
	}, [user, setUser, checkAuth])

	return null
}

