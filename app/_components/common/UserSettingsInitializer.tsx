'use client'

import { useEffect } from 'react'
import { useUserSettingsStore } from '@_stores/useUserSettingsStore'

/**
 * Client component that initializes user settings on app load
 * This component should be rendered in the root layout
 */
export default function UserSettingsInitializer() {
	const theme = useUserSettingsStore((state) => state.theme)

	useEffect(() => {
		// Apply theme on mount
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme)
		}
	}, [theme])

	// This component doesn't render anything
	return null
}


