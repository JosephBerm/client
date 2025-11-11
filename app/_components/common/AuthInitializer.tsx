'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@_stores/useAuthStore'

/**
 * Client component that initializes authentication state on app load
 * This component should be rendered in the root layout
 */
export default function AuthInitializer() {
	const checkAuth = useAuthStore((state) => state.checkAuth)

	useEffect(() => {
		// Check authentication status on mount
		checkAuth()
	}, [checkAuth])

	// This component doesn't render anything
	return null
}


