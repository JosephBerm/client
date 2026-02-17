'use client'

import { useCallback } from 'react'

import { useUserSettingsStore } from '@_features/settings'

import { usePermissions } from './usePermissions'

export interface UseAdminViewReturn {
	isAdmin: boolean
	isAdminViewActive: boolean
	setAdminViewEnabled: (enabled: boolean) => void
}

/**
 * Global admin-view state gate.
 * Keeps privileged UI metadata hidden unless both:
 * 1) user has admin role, and 2) admin view is enabled.
 */
export function useAdminView(): UseAdminViewReturn {
	const { isAdmin } = usePermissions()
	const storedAdminViewEnabled = useUserSettingsStore((state) => state.preferences.adminViewEnabled === true)
	const setAdminViewPreference = useUserSettingsStore((state) => state.setAdminViewEnabled)

	const setAdminViewEnabled = useCallback(
		(enabled: boolean) => {
			if (!isAdmin) {
				return
			}
			setAdminViewPreference(enabled)
		},
		[isAdmin, setAdminViewPreference],
	)

	return {
		isAdmin,
		isAdminViewActive: isAdmin && storedAdminViewEnabled,
		setAdminViewEnabled,
	}
}

export default useAdminView
