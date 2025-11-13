/**
 * Appearance Setting Component
 * 
 * Provides theme selection functionality for the Settings Modal.
 * Displays a dropdown selector for choosing the application theme.
 * 
 * **Architecture:**
 * - Uses Theme enum from SharedEnums for type safety
 * - Integrates with useUserSettingsStore (Church of God pattern)
 * - Theme changes automatically persist via ThemeService
 * - Updates DOM via ThemeService.applyTheme
 * 
 * **Features:**
 * - Dropdown selection for theme
 * - Type-safe theme values
 * - Automatic persistence to localStorage
 * - Immediate DOM application
 * - Responsive layout with proper spacing
 * 
 * **Available Themes:**
 * - MedSource Classic (default brand green theme)
 * - Winter (light professional theme)
 * - Luxury (dark elegant theme)
 * 
 * @module AppearanceSetting
 */

'use client'

import { useMemo } from 'react'
import { useUserSettingsStore } from '@_stores/useUserSettingsStore'
import { Theme } from '@_classes/SharedEnums'
import Select from '@_components/ui/Select'

/**
 * Maps theme enum values to display names.
 * 
 * Provides user-friendly labels for theme options in the dropdown.
 * 
 * @constant
 */
const themeDisplayNames: Record<Theme, string> = {
	[Theme.Winter]: 'Light (Winter)',
	[Theme.Luxury]: 'Dark (Luxury)',
}

/**
 * Appearance Setting Component
 * 
 * Provides theme selection within the Settings Modal.
 * 
 * **Usage:**
 * This component is rendered within the Settings Modal's "Appearance" section.
 * It provides a dropdown for theme selection that immediately applies changes.
 * 
 * **Implementation:**
 * - Reads `currentTheme` from useUserSettingsStore
 * - Calls `setTheme()` on selection change
 * - ThemeService handles DOM application and persistence
 * - MutationObserver in store keeps state in sync
 * 
 * @returns Appearance setting with theme selector
 */
export default function AppearanceSetting() {
	const currentTheme = useUserSettingsStore((state) => state.currentTheme)
	const setTheme = useUserSettingsStore((state) => state.setTheme)

	// Convert theme options to select options
	const themeOptions = useMemo(() => {
		return Object.entries(themeDisplayNames).map(([value, label]) => ({
			value,
			label,
		}))
	}, [])

	const handleThemeChange = (value: string) => {
		setTheme(value as Theme)
	}

	return (
		<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 md:gap-6 py-4 md:py-5 px-4 sm:px-6">
			<div className="flex-1 min-w-0">
				<label className="block text-sm md:text-base font-semibold text-base-content mb-1 md:mb-1.5">
					Theme
				</label>
				<p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
					Choose your preferred color theme for the application
				</p>
			</div>
			<div className="shrink-0 w-full sm:w-auto">
				<Select
					value={currentTheme}
					onChange={(e) => handleThemeChange(e.target.value)}
					options={themeOptions}
					width="full"
					size="sm"
					aria-label="Select theme"
					className="sm:!w-44"
				/>
			</div>
		</div>
	)
}
