import { Theme } from '@_classes/SharedEnums'

import { BasePreferenceService } from './BasePreferenceService'

/**
 * Theme Service
 * 
 * Manages theme preferences and application of themes to the document.
 * Extends BasePreferenceService for DRY code and consistent API.
 * 
 * **Responsibilities:**
 * - Detecting system color scheme preference (dark/light)
 * - Persisting theme preference via UserSettingsService
 * - Applying theme to document via data-theme attribute
 * - Providing theme initialization on app load
 * 
 * **FAANG-Level Improvements:**
 * - Extends BasePreferenceService (eliminates 80+ lines of duplication)
 * - Template Method pattern for shared logic
 * - Type-safe with TypeScript generics
 * - Consistent with other preference services
 * 
 * **Theme Mapping:**
 * - **Dark system preference** → Dark theme
 * - **Light system preference** → Light theme
 * - **Default** → Light theme
 * 
 * @module ThemeService
 * @see {@link BasePreferenceService} - Base class with shared logic
 * @see {@link useUserSettingsStore} - Store that uses this service
 */
class ThemeServiceClass extends BasePreferenceService<Theme> {
	protected readonly settingKey = 'theme' as const
	protected readonly domAttribute = 'data-theme'
	protected readonly defaultValue = Theme.Light

	/**
	 * Detects the system color scheme preference.
	 */
	protected detectSystemPreference(): Theme {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		return prefersDark ? Theme.Dark : Theme.Light
	}

	/**
	 * Validates that a value is a valid Theme enum value.
	 */
	protected validateValue(value: unknown): value is Theme {
		return typeof value === 'string' && Object.values(Theme).includes(value as Theme)
	}

	/**
	 * Deserializes a DOM attribute value to a Theme.
	 */
	protected deserializeFromDOM(attributeValue: string | null): Theme | null {
		if (!attributeValue) {return null}
		return this.validateValue(attributeValue) ? (attributeValue as Theme) : null
	}

	// Public API methods (for backward compatibility and clarity)
	// These delegate to the base class methods

	/**
	 * Detects the system color scheme preference.
	 * 
	 * @returns {Theme} The theme matching the system preference
	 * 
	 * @example
	 * ```tsx
	 * const systemTheme = ThemeService.getSystemTheme()
	 * // If user has dark mode enabled: Theme.Dark
	 * // If user has light mode enabled: Theme.Light
	 * ```
	 */
	getSystemTheme(): Theme {
		return this.getSystemPreference()
	}

	/**
	 * Retrieves the stored theme preference from localStorage.
	 * 
	 * @returns {Theme} The stored theme or system preference
	 * 
	 * @example
	 * ```tsx
	 * const theme = ThemeService.getStoredTheme()
	 * ```
	 */
	getStoredTheme(): Theme {
		return this.getStoredPreference()
	}

	/**
	 * Retrieves the currently applied theme from the document.
	 * 
	 * @returns {Theme} The currently applied theme
	 * 
	 * @example
	 * ```tsx
	 * const current = ThemeService.getCurrentTheme()
	 * ```
	 */
	getCurrentTheme(): Theme {
		return this.getCurrentPreference()
	}

	/**
	 * Saves the theme preference to localStorage.
	 * 
	 * @param {Theme | string} theme - The theme to store
	 * 
	 * @example
	 * ```tsx
	 * ThemeService.setStoredTheme(Theme.Luxury)
	 * ```
	 */
	setStoredTheme(theme: Theme | string): void {
		if (this.validateValue(theme)) {
			this.setStoredPreference(theme as Theme)
		}
	}

	/**
	 * Applies the theme to the document via data-theme attribute.
	 * 
	 * @param {Theme | string} theme - The theme to apply
	 * 
	 * @example
	 * ```tsx
	 * ThemeService.applyTheme(Theme.Luxury)
	 * ```
	 */
	applyTheme(theme: Theme | string): void {
		if (this.validateValue(theme)) {
			this.applyPreference(theme as Theme)
		}
	}

	/**
	 * Initializes the theme on application load.
	 * 
	 * @returns {Theme} The theme that was initialized and applied
	 * 
	 * @example
	 * ```tsx
	 * const theme = ThemeService.initializeTheme()
	 * ```
	 */
	initializeTheme(): Theme {
		return this.initializePreference()
	}
}

// Export singleton instance (FAANG pattern: single instance for stateless service)
export const ThemeService = new ThemeServiceClass()

