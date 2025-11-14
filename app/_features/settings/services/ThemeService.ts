import { Theme } from '@_classes/SharedEnums'
import { UserSettingsService } from './UserSettingsService'

/**
 * Theme Service
 * 
 * Manages theme preferences and application of themes to the document.
 * Uses UserSettingsService internally for unified storage management.
 * 
 * **Responsibilities:**
 * - Detecting system color scheme preference (dark/light)
 * - Persisting theme preference via UserSettingsService
 * - Applying theme to document via data-theme attribute
 * - Providing theme initialization on app load
 * 
 * **Theme Mapping:**
 * - **Dark system preference** → Luxury theme
 * - **Light system preference** → Winter theme
 * - **Default** → MedSource Classic theme
 * 
 * **Storage:**
 * Uses UserSettingsService for unified settings storage. Maintains backward
 * compatibility by reading from legacy storage if unified storage doesn't exist.
 * 
 * **SSR Safety:**
 * All methods are SSR-safe and return defaults or no-op on the server.
 * 
 * @module ThemeService
 * @see {@link useUserSettingsStore} - Store that uses this service
 * @see {@link UserSettingsService} - Unified settings service used internally
 */
export class ThemeService {

	/**
	 * Detects the system color scheme preference.
	 * 
	 * Checks the user's operating system/browser preference for dark or light mode.
	 * Returns the appropriate theme based on this preference:
	 * - Dark preference → Luxury theme
	 * - Light preference → Winter theme
	 * 
	 * **SSR Safety:**
	 * Returns Winter theme on the server (defaults to light).
	 * 
	 * @returns {Theme} The theme matching the system preference
	 * 
	 * @example
	 * ```tsx
	 * const systemTheme = ThemeService.getSystemTheme()
	 * // If user has dark mode enabled: Theme.Luxury
	 * // If user has light mode enabled: Theme.Winter
	 * ```
	 */
	static getSystemTheme(): Theme {
		if (typeof window === 'undefined') return Theme.Winter
		
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		return prefersDark ? Theme.Luxury : Theme.Winter
	}

	/**
	 * Retrieves the stored theme preference from localStorage.
	 * 
	 * If no theme is stored, falls back to the system preference.
	 * This provides a good default experience while still allowing
	 * users to override with their preference.
	 * 
	 * **Fallback Chain:**
	 * 1. Stored theme in localStorage (if valid)
	 * 2. System preference (dark/light mode)
	 * 3. Default (Winter theme)
	 * 
	 * **SSR Safety:**
	 * Returns Winter theme on the server.
	 * 
	 * @returns {Theme} The stored theme or system preference
	 * 
	 * @example
	 * ```tsx
	 * const theme = ThemeService.getStoredTheme()
	 * // Returns user's preference, or system preference if not set
	 * ```
	 */
	static getStoredTheme(): Theme {
		if (typeof window === 'undefined') return Theme.Winter
		
		// Use unified settings service
		const theme = UserSettingsService.getSetting('theme')
		if (theme) {
			return theme
		}
		
		// No stored theme, return system preference
		return this.getSystemTheme()
	}

	/**
	 * Retrieves the currently applied theme from the document.
	 * 
	 * Checks the document's `data-theme` attribute to determine
	 * what theme is currently active. This is useful for:
	 * - Verifying the applied theme matches stored preference
	 * - Getting the theme in contexts where state isn't available
	 * - Initialization checks
	 * 
	 * **Fallback Chain:**
	 * 1. HTML data-theme attribute (if valid)
	 * 2. Stored theme from localStorage
	 * 3. System preference
	 * 4. Default (Winter)
	 * 
	 * **SSR Safety:**
	 * Returns Winter theme on the server.
	 * 
	 * @returns {Theme} The currently applied theme
	 * 
	 * @example
	 * ```tsx
	 * const current = ThemeService.getCurrentTheme()
	 * if (current !== desiredTheme) {
	 *   ThemeService.applyTheme(desiredTheme)
	 * }
	 * ```
	 */
	static getCurrentTheme(): Theme {
		if (typeof window === 'undefined') return Theme.Winter
		
		const appliedTheme = document.documentElement.getAttribute('data-theme')
		if (appliedTheme && Object.values(Theme).includes(appliedTheme as Theme)) {
			return appliedTheme as Theme
		}
		
		// Fallback to stored or system preference
		return this.getStoredTheme()
	}

	/**
	 * Saves the theme preference to localStorage.
	 * 
	 * Persists the user's theme choice so it can be restored on
	 * subsequent visits. This method is SSR-safe and will no-op on the server.
	 * 
	 * @param {Theme | string} theme - The theme to store
	 * 
	 * @example
	 * ```tsx
	 * ThemeService.setStoredTheme(Theme.Luxury)
	 * // Theme preference saved to localStorage
	 * ```
	 */
	static setStoredTheme(theme: Theme | string): void {
		if (typeof window === 'undefined') return
		
		// Use unified settings service
		UserSettingsService.setSetting('theme', theme as Theme)
	}

	/**
	 * Applies the theme to the document via data-theme attribute.
	 * 
	 * Updates the document's `data-theme` attribute, which DaisyUI uses
	 * to apply the corresponding theme styles. This is the mechanism
	 * by which theme changes take effect.
	 * 
	 * **How It Works:**
	 * DaisyUI reads the `data-theme` attribute and applies CSS variables
	 * and classes corresponding to that theme.
	 * 
	 * This method is SSR-safe and will no-op on the server.
	 * 
	 * @param {Theme | string} theme - The theme to apply
	 * 
	 * @example
	 * ```tsx
	 * ThemeService.applyTheme(Theme.Luxury)
	 * // <html data-theme="luxury"> is now set, DaisyUI styles applied
	 * ```
	 */
	static applyTheme(theme: Theme | string): void {
		if (typeof window === 'undefined') return
		
		document.documentElement.setAttribute('data-theme', theme)
	}

	/**
	 * Initializes the theme on application load.
	 * 
	 * This method should be called once when the application starts to:
	 * 1. Retrieve the stored theme preference (or use system preference)
	 * 2. Apply it to the document
	 * 3. Return the initialized theme for use in state management
	 * 
	 * **Usage:**
	 * Typically called in the UserSettingsInitializer component or by
	 * the useUserSettingsStore.initialize() method to ensure the correct
	 * theme is applied before the UI renders, preventing flash of unstyled
	 * content (FOUC).
	 * 
	 * @returns {Theme} The theme that was initialized and applied
	 * 
	 * @example
	 * ```tsx
	 * // In UserSettingsInitializer or store initialization
	 * const theme = ThemeService.initializeTheme()
	 * // Theme is now applied to document and ready to use
	 * ```
	 */
	static initializeTheme(): Theme {
		const theme = this.getStoredTheme()
		this.applyTheme(theme)
		return theme
	}
}

