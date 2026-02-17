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

import type { ComponentType } from 'react'

import { Settings as SettingsIcon } from 'lucide-react'

import type { SettingsSection } from '@_types/settings'

/**
 * Creates and returns all settings sections with their configuration.
 *
 * This function returns the settings sections metadata. The component types
 * should be provided by the UI layer to maintain clean architecture.
 *
 * **Architecture:**
 * - Service returns data/metadata only
 * - UI layer (SettingsModal) provides component mappings
 * - Maintains unidirectional dependency flow
 *
 * **Current Sections:**
 * - **General**: Contains Appearance (theme) settings
 *
 * @param componentMap - Map of setting IDs to their component types
 * @returns Array of settings sections with their configuration
 */
export function getSettingsSections(componentMap: Record<string, ComponentType>): SettingsSection[] {
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
					component: componentMap['appearance'],
				},
				{
					id: 'reduced-motion',
					type: 'custom',
					label: 'Reduce Motion',
					description: 'Reduce animations and transitions',
					component: componentMap['reduced-motion'],
				},
				{
					id: 'admin-view',
					type: 'custom',
					label: 'Admin View',
					description: 'Show internal identifiers and debug metadata',
					component: componentMap['admin-view'],
				},
			],
		},
	]
}
