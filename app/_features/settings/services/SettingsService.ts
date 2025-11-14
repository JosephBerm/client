/**
 * Settings Service
 * 
 * Provides centralized configuration for the Settings Modal component.
 * This service acts as the single source of truth for all settings sections,
 * items, and their configuration, following the Service Layer pattern.
 * 
 * **Purpose:**
 * - Centralizes all settings configuration in one place
 * - Makes it easy to add new settings sections or items
 * - Maintains type safety through TypeScript interfaces
 * - Separates configuration from presentation logic
 * 
 * **Usage:**
 * ```tsx
 * const sections = useSettingsSections()
 * // Use sections in SettingsModal component
 * ```
 * 
 * @module SettingsService
 */

import { Settings as SettingsIcon } from 'lucide-react'
import type { SettingsSection } from '@_types/settings'
import { createElement } from 'react'
import AppearanceSetting from '@_components/settings/AppearanceSetting'

/**
 * Creates and returns all settings sections with their configuration.
 * 
 * This function returns the settings sections array. In the future,
 * this could be converted to a hook if translation support is needed.
 * 
 * **Current Sections:**
 * - **General**: Contains Appearance (theme) settings
 * 
 * **Adding New Sections:**
 * 1. Add a new section object to the returned array
 * 2. Define the section's id, title, icon, and description
 * 3. Add items to the section's items array
 * 
 * **Adding New Settings Items:**
 * 1. Create a new setting component (e.g., `NotificationSetting.tsx`)
 * 2. Add it to the appropriate section's items array
 * 3. Use `createElement` to instantiate the component
 * 
 * @returns Array of settings sections with their configuration
 */
export function getSettingsSections(): SettingsSection[] {
	return [
		{
			id: 'general',
			title: 'General',
			icon: SettingsIcon,
			description: 'Application appearance and preferences',
			items: [
				{
					id: 'appearance',
					type: 'custom',
					label: 'Appearance',
					description: 'Choose your preferred theme',
					component: createElement(AppearanceSetting),
				},
			],
		},
	]
}

