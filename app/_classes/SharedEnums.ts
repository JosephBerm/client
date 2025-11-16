/**
 * Shared Enums
 * 
 * Centralized enum definitions used across the application.
 * Following industry best practice of defining enums in a shared location
 * to ensure consistency and prevent duplication.
 * 
 * **Purpose:**
 * - Single source of truth for enumerated types
 * - Type-safe constants throughout the application
 * - Easy to maintain and extend
 * - Consistent naming and values
 * 
 * @module SharedEnums
 */

/**
 * Theme enum for DaisyUI themes.
 * 
 * Defines available themes for the application. These correspond to
 * DaisyUI theme names configured in app/globals.css via @plugin directive.
 * 
 * **Available Themes:**
 * - **Winter**: Light, clean DaisyUI theme (default)
 * - **Luxury**: Dark, elegant DaisyUI theme
 * 
 * **Usage:**
 * ```typescript
 * import { Theme } from '@_classes/SharedEnums'
 * 
 * const currentTheme: Theme = Theme.Winter
 * ThemeService.setStoredTheme(Theme.Luxury)
 * ```
 * 
 * @enum {string}
 */
export enum Theme {
	/**
	 * DaisyUI Winter theme (default).
	 * Clean, professional light theme.
	 */
	Winter = 'winter',
	/**
	 * DaisyUI Luxury theme.
	 * Dark, elegant theme with high contrast.
	 */
	Luxury = 'luxury',

	/**
	 * DaisyUI Light theme.
	 * Standard light theme aligned with DaisyUI defaults.
	 */
	Light = 'light',
	/**
	 * DaisyUI Dark theme.
	 * Standard dark theme aligned with DaisyUI defaults.
	 */
	Dark = 'dark',
	/**
	 * DaisyUI Corporate theme.
	 * Professional business-oriented theme.
	 */
	Corporate = 'corporate',
	/**
	 * DaisyUI Sunset theme.
	 * Warm, vibrant theme with sunset palette.
	 */
	Sunset = 'sunset',
}

