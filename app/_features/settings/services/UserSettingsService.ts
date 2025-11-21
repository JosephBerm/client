import { Theme } from '@_classes/SharedEnums'
import { logger } from '@_core'

/**
 * User Settings Service
 * 
 * Unified service for managing all user preferences and settings.
 * Provides a single source of truth for settings persistence with versioning,
 * migration support, and type safety.
 * 
 * **Architecture:**
 * - Single localStorage key: `'user-settings'`
 * - Versioned schema for migration support
 * - Type-safe interfaces for all settings
 * - Batch operations for multiple settings
 * - Error handling with graceful fallbacks
 * 
 * **Storage Format:**
 * ```json
 * {
 *   "version": 1,
 *   "settings": {
 *     "theme": "medsource-classic",
 *     "tablePageSize": 10,
 *     "sidebarCollapsed": false
 *   }
 * }
 * ```
 * 
 * **Industry Best Practices:**
 * - Single source of truth for all settings
 * - Versioning enables migration between schema versions
 * - Type-safe with TypeScript interfaces
 * - Error handling with fallbacks
 * - SSR-safe (returns defaults on server)
 * - Versioned structure (future-proof)
 * 
 * @module UserSettingsService
 * @see {@link ThemeService} - Uses this service internally
 */

/**
 * User settings interface.
 * 
 * Defines the structure of all user preferences stored in localStorage.
 * This interface should be extended when adding new settings types.
 * 
 * @interface UserSettings
 */
export interface UserSettings {
	/**
	 * User's preferred theme.
	 * 
 * @default Theme.Light
	 */
	theme?: Theme
	/**
	 * Default table page size for pagination.
	 * Used by DataGrid and ServerDataTable components.
	 * 
	 * @default 10
	 */
	tablePageSize?: number
	/**
	 * Sidebar collapsed state (desktop navigation).
	 * Controls whether the sidebar is expanded or collapsed.
	 * 
	 * @default false
	 */
	sidebarCollapsed?: boolean
	/**
	 * Reduced motion preference.
	 * Controls whether animations and transitions should be reduced.
	 * Respects system preference by default.
	 * 
	 * @default false (or system preference if available)
	 */
	prefersReducedMotion?: boolean
	/**
	 * Custom settings can be added dynamically.
	 * Allows for extensibility without schema changes.
	 */
	[key: string]: any
}

/**
 * Stored settings format with versioning.
 * 
 * Includes version number for migration support and the actual settings object.
 * 
 * @interface StoredSettings
 */
interface StoredSettings {
	/**
	 * Schema version number.
	 * Increment when making breaking changes to settings structure.
	 * 
	 * @default 1
	 */
	version: number
	/**
	 * User settings object.
	 */
	settings: UserSettings
}

/**
 * Default settings values.
 * 
 * Used when no settings are stored or when settings are invalid.
 * 
 * @constant
 * @type {UserSettings}
 */
const DEFAULT_SETTINGS: UserSettings = {
	theme: Theme.Light,
	tablePageSize: 10,
	sidebarCollapsed: false,
	prefersReducedMotion: false,
}

/**
 * Current schema version.
 * 
 * Increment this when making breaking changes to the settings structure.
 * Migration functions will handle converting old versions to new ones.
 * 
 * @constant
 * @type {number}
 */
const CURRENT_VERSION = 1

/**
 * Storage key for unified settings.
 * 
 * All user preferences are stored under this single key.
 * 
 * @constant
 * @type {string}
 */
const STORAGE_KEY = 'user-settings'

// No legacy storage keys required in this branch

/**
 * User Settings Service
 * 
 * Unified service for managing all user preferences with versioning and migration.
 */
export class UserSettingsService {
	/**
	 * Retrieves all user settings from localStorage.
	 * 
	 * Returns the complete settings object, with defaults applied for any missing values.
	 * No legacy migration in this branch.
	 * 
	 * **SSR Safety:**
	 * Returns default settings on the server.
	 * 
	 * @returns {UserSettings} Complete settings object with defaults applied
	 * 
	 * @example
	 * ```tsx
 * import { logger } from '@_core';
 * 
	 * const settings = UserSettingsService.getSettings()
 * logger.debug('User settings retrieved', {
 *   theme: settings.theme, // Theme.MedsourceClassic
 *   tablePageSize: settings.tablePageSize // 10
 * })
	 * ```
	 */
	static getSettings(): UserSettings {
		if (typeof window === 'undefined') return DEFAULT_SETTINGS

		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			
			if (stored) {
				const parsed: StoredSettings | any = JSON.parse(stored)
				
				// Check if it's the new format (with explicit version field at root)
				if (parsed.version && parsed.settings) {
					// New unified format
					// Validate version and migrate if needed
					if (parsed.version !== CURRENT_VERSION) {
					logger.warn('Settings version mismatch detected', {
						currentVersion: parsed.version,
						expectedVersion: CURRENT_VERSION,
						component: 'UserSettingsService',
					})
					}
					
					// Merge with defaults to ensure all settings exist
					return {
						...DEFAULT_SETTINGS,
						...parsed.settings,
					}
				}
			}
			
			// No settings found, return defaults
			return DEFAULT_SETTINGS
		} catch (error) {
			logger.warn('Failed to read user settings', {
				error,
				component: 'UserSettingsService',
				fallback: 'using_defaults',
			})
			return DEFAULT_SETTINGS
		}
	}

	/**
	 * Gets a specific setting value.
	 * 
	 * Retrieves a single setting by key, with type safety and default fallback.
	 * 
	 * @template K - Key of UserSettings
	 * @param {K} key - The setting key to retrieve
	 * @returns {UserSettings[K]} The setting value, or default if not set
	 * 
	 * @example
	 * ```tsx
	 * const theme = UserSettingsService.getSetting('theme')
	 * const pageSize = UserSettingsService.getSetting('tablePageSize')
	 * ```
	 */
	static getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
		const settings = this.getSettings()
		return settings[key] ?? DEFAULT_SETTINGS[key]
	}

	/**
	 * Sets a specific setting value.
	 * 
	 * Updates a single setting while preserving all other settings.
	 * Validates the value before saving.
	 * 
	 * **Validation:**
	 * - Theme: Must be valid Theme enum value
	 * - tablePageSize: Must be positive number
	 * - sidebarCollapsed: Must be boolean
	 * 
	 * @template K - Key of UserSettings
	 * @param {K} key - The setting key to update
	 * @param {UserSettings[K]} value - The value to set
	 * @returns {void}
	 * 
	 * @example
	 * ```tsx
	 * UserSettingsService.setSetting('theme', Theme.Luxury)
	 * UserSettingsService.setSetting('tablePageSize', 25)
	 * UserSettingsService.setSetting('sidebarCollapsed', true)
	 * ```
	 */
	static setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
		if (typeof window === 'undefined') return

		try {
			// Validate value based on key
			if (!this.validateSetting(key, value)) {
				logger.warn('Invalid setting value rejected', {
					setting: String(key),
					value,
					component: 'UserSettingsService',
				})
				return
			}

			// Get current settings
			const currentSettings = this.getSettings()

			// Update the specific setting
			const updatedSettings: UserSettings = {
				...currentSettings,
				[key]: value,
			}

			// Save to localStorage
			const stored: StoredSettings = {
				version: CURRENT_VERSION,
				settings: updatedSettings,
			}

			localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
		} catch (error) {
			logger.warn('Failed to save setting', {
				error,
				setting: String(key),
				value,
				component: 'UserSettingsService',
			})
		}
	}

	/**
	 * Sets multiple settings at once (batch operation).
	 * 
	 * Updates multiple settings in a single localStorage write operation.
	 * More efficient than calling `setSetting` multiple times.
	 * 
	 * @param {Partial<UserSettings>} settings - Object with settings to update
	 * @returns {void}
	 * 
	 * @example
	 * ```tsx
	 * UserSettingsService.setSettings({
	 *   theme: Theme.Luxury,
	 *   tablePageSize: 25,
	 *   sidebarCollapsed: true,
	 * })
	 * ```
	 */
	static setSettings(settings: Partial<UserSettings>): void {
		if (typeof window === 'undefined') return

		try {
			// Get current settings
			const currentSettings = this.getSettings()

			// Validate all new settings
			for (const [key, value] of Object.entries(settings)) {
				if (value !== undefined && !this.validateSetting(key as keyof UserSettings, value)) {
					logger.warn('Invalid setting value rejected', {
						setting: key,
						value,
						component: 'UserSettingsService',
					})
					return
				}
			}

			// Merge with current settings
			const updatedSettings: UserSettings = {
				...currentSettings,
				...settings,
			}

			// Save to localStorage
			const stored: StoredSettings = {
				version: CURRENT_VERSION,
				settings: updatedSettings,
			}

			localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
		} catch (error) {
			logger.warn('Failed to save settings', {
				error,
				settings,
				component: 'UserSettingsService',
			})
		}
	}

	/**
	 * Validates a setting value.
	 * 
	 * Ensures the value is valid for the given setting key.
	 * 
	 * @template K - Key of UserSettings
	 * @param {K} key - The setting key
	 * @param {unknown} value - The value to validate
	 * @returns {boolean} True if value is valid, false otherwise
	 * 
	 * @private
	 */
	private static validateSetting<K extends keyof UserSettings>(key: K, value: unknown): boolean {
		switch (key) {
			case 'theme':
				return typeof value === 'string' && Object.values(Theme).includes(value as Theme)
			case 'tablePageSize':
				return typeof value === 'number' && value > 0
			case 'sidebarCollapsed':
				return typeof value === 'boolean'
			case 'prefersReducedMotion':
				return typeof value === 'boolean'
			default:
				// For custom settings, accept any value
				return true
		}
	}

	/**
	// No legacy migration helpers in this branch

	/**
	 * Clears all user settings.
	 * 
	 * Removes all settings from localStorage and resets to defaults.
	 * Useful for logout or reset functionality.
	 * 
	 * @returns {void}
	 * 
	 * @example
	 * ```tsx
	 * UserSettingsService.clearSettings()
	 * // All settings reset to defaults
	 * ```
	 */
	static clearSettings(): void {
		if (typeof window === 'undefined') return

		try {
			localStorage.removeItem(STORAGE_KEY)
		} catch (error) {
			logger.warn('Failed to clear settings', {
				error,
				component: 'UserSettingsService',
			})
		}
	}
}

