/**
 * Theme Helper - FAANG-Level Theme Metadata System
 * 
 * Centralized theme configuration following the enum helper pattern.
 * Eliminates duplication and provides a single source of truth for theme properties.
 * 
 * **Architecture Pattern:**
 * - Metadata Mapping: Each theme has associated properties
 * - Type Safety: TypeScript ensures all themes are covered
 * - Extensibility: Easy to add new properties (colors, contrast, etc.)
 * - DRY Compliance: Single place to define theme characteristics
 * 
 * **Industry Best Practice (Google/Meta/Netflix):**
 * - Configuration over hardcoded logic
 * - Exhaustive enum mapping (TypeScript enforces completeness)
 * - Scalable to 100+ themes without code changes
 * - Self-documenting with metadata
 * 
 * **Benefits:**
 * - Add new theme → Add one entry → Everything works
 * - No scattered arrays to update
 * - Type-safe querying
 * - Easy to extend with new properties
 * 
 * @module Helpers/ThemeHelper
 */

import { Theme } from '../SharedEnums'

/**
 * Theme metadata interface.
 * Defines all properties associated with a theme.
 * 
 * **Extensibility:** Add new properties here as needed:
 * - contrast: 'high' | 'normal' | 'low'
 * - primaryColor: string
 * - accentColor: string
 * - fontScale: number
 */
export interface ThemeMetadata {
	/** Theme enum value */
	value: Theme
	/** Display name for UI */
	display: string
	/** Whether theme should use dark mode styling */
	isDark: boolean
	/** Theme category for grouping */
	category: 'light' | 'dark'
	/** Optional description */
	description?: string
}

/**
 * Complete theme metadata map.
 * 
 * **CRITICAL:** TypeScript enforces that ALL Theme enum values are present.
 * If you add a new theme to the enum, TypeScript will error until you add it here.
 * 
 * **Pattern:** Exhaustive mapping (Google/Meta standard)
 * 
 * @example
 * ```typescript
 * // Add new theme:
 * export enum Theme {
 *   // ... existing themes
 *   Cyberpunk = 'cyberpunk',  // Step 1: Add to enum
 * }
 * 
 * // Step 2: Add metadata (TypeScript forces you):
 * const THEME_METADATA_MAP: Record<Theme, ThemeMetadata> = {
 *   // ... existing themes
 *   [Theme.Cyberpunk]: {
 *     value: Theme.Cyberpunk,
 *     display: 'Cyberpunk',
 *     isDark: true,
 *     category: 'dark',
 *     description: 'Neon-lit dark theme',
 *   },
 * }
 * 
 * // Step 3: Done! Everything works automatically.
 * ```
 */
const THEME_METADATA_MAP: Record<Theme, ThemeMetadata> = {
	// ==================== LIGHT THEMES ====================
	[Theme.Light]: {
		value: Theme.Light,
		display: 'Light',
		isDark: false,
		category: 'light',
		description: 'Standard light theme with clean aesthetics',
	},
	[Theme.Winter]: {
		value: Theme.Winter,
		display: 'Winter',
		isDark: false,
		category: 'light',
		description: 'Cool, professional light theme (default)',
	},
	[Theme.Corporate]: {
		value: Theme.Corporate,
		display: 'Corporate',
		isDark: false,
		category: 'light',
		description: 'Business-oriented light theme',
	},

	// ==================== DARK THEMES ====================
	[Theme.Dark]: {
		value: Theme.Dark,
		display: 'Dark',
		isDark: true,
		category: 'dark',
		description: 'Standard dark theme with high contrast',
	},
	[Theme.Luxury]: {
		value: Theme.Luxury,
		display: 'Luxury',
		isDark: true,
		category: 'dark',
		description: 'Elegant dark theme with premium feel',
	},
	[Theme.Sunset]: {
		value: Theme.Sunset,
		display: 'Sunset',
		isDark: true,
		category: 'dark',
		description: 'Warm, vibrant dark theme with sunset palette',
	},
}

/**
 * Theme Helper Class
 * 
 * Provides type-safe methods to query theme properties.
 * Follows the EnumHelper pattern from your Saturn project.
 * 
 * **Usage:**
 * ```typescript
 * // Check if theme is dark
 * const isDark = ThemeHelper.isDarkTheme(Theme.Luxury) // true
 * 
 * // Get all dark themes
 * const darkThemes = ThemeHelper.getDarkThemes() // [Theme.Dark, Theme.Luxury, Theme.Sunset]
 * 
 * // Get theme metadata
 * const metadata = ThemeHelper.getMetadata(Theme.Winter)
 * console.log(metadata.display) // "Winter"
 * 
 * // Get all themes as list
 * const allThemes = ThemeHelper.toList()
 * ```
 */
export default class ThemeHelper {
	/**
	 * Array of all theme metadata.
	 * Useful for rendering theme selectors in UI.
	 */
	static readonly toList: ThemeMetadata[] = Object.values(THEME_METADATA_MAP)

	/**
	 * Checks if a theme should use dark mode styling.
	 * 
	 * **Pattern:** Query metadata, not hardcoded logic
	 * 
	 * @param theme - Theme to check
	 * @returns true if dark theme, false if light
	 * 
	 * @example
	 * ```typescript
	 * ThemeHelper.isDarkTheme(Theme.Luxury) // true
	 * ThemeHelper.isDarkTheme(Theme.Winter) // false
	 * ```
	 */
	static isDarkTheme(theme: Theme): boolean {
		return THEME_METADATA_MAP[theme].isDark
	}

	/**
	 * Gets metadata for a specific theme.
	 * 
	 * @param theme - Theme to get metadata for
	 * @returns Theme metadata object
	 * 
	 * @example
	 * ```typescript
	 * const metadata = ThemeHelper.getMetadata(Theme.Dark)
	 * console.log(metadata.display) // "Dark"
	 * console.log(metadata.isDark) // true
	 * ```
	 */
	static getMetadata(theme: Theme): ThemeMetadata {
		return THEME_METADATA_MAP[theme]
	}

	/**
	 * Gets all dark themes.
	 * 
	 * **Pattern:** Filter by metadata, not hardcoded array
	 * 
	 * @returns Array of dark theme enum values
	 * 
	 * @example
	 * ```typescript
	 * const darkThemes = ThemeHelper.getDarkThemes()
	 * // [Theme.Dark, Theme.Luxury, Theme.Sunset]
	 * ```
	 */
	static getDarkThemes(): Theme[] {
		return this.toList.filter((t) => t.isDark).map((t) => t.value)
	}

	/**
	 * Gets all light themes.
	 * 
	 * @returns Array of light theme enum values
	 * 
	 * @example
	 * ```typescript
	 * const lightThemes = ThemeHelper.getLightThemes()
	 * // [Theme.Light, Theme.Winter, Theme.Corporate]
	 * ```
	 */
	static getLightThemes(): Theme[] {
		return this.toList.filter((t) => !t.isDark).map((t) => t.value)
	}

	/**
	 * Gets themes by category.
	 * 
	 * @param category - Theme category ('light' or 'dark')
	 * @returns Array of theme metadata
	 * 
	 * @example
	 * ```typescript
	 * const darkThemes = ThemeHelper.getThemesByCategory('dark')
	 * ```
	 */
	static getThemesByCategory(category: 'light' | 'dark'): ThemeMetadata[] {
		return this.toList.filter((t) => t.category === category)
	}

	/**
	 * Gets display name for a theme.
	 * Useful for UI labels.
	 * 
	 * @param theme - Theme to get display name for
	 * @returns Human-readable theme name
	 * 
	 * @example
	 * ```typescript
	 * ThemeHelper.getDisplayName(Theme.Luxury) // "Luxury"
	 * ```
	 */
	static getDisplayName(theme: Theme): string {
		return THEME_METADATA_MAP[theme].display
	}

	/**
	 * Validates if a string is a valid theme value.
	 * Useful for parsing user input or URL params.
	 * 
	 * @param value - String to validate
	 * @returns true if valid theme, false otherwise
	 * 
	 * @example
	 * ```typescript
	 * ThemeHelper.isValidTheme('luxury') // true
	 * ThemeHelper.isValidTheme('invalid') // false
	 * ```
	 */
	static isValidTheme(value: string): value is Theme {
		return Object.values(Theme).includes(value as Theme)
	}

	/**
	 * Gets toast theme ('light' or 'dark') for react-toastify.
	 * 
	 * **Purpose:** Direct replacement for hardcoded logic in ToastProvider
	 * 
	 * @param theme - Current app theme
	 * @returns Toast theme string
	 * 
	 * @example
	 * ```typescript
	 * ThemeHelper.getToastTheme(Theme.Luxury) // 'dark'
	 * ThemeHelper.getToastTheme(Theme.Winter) // 'light'
	 * ```
	 */
	static getToastTheme(theme: Theme): 'light' | 'dark' {
		return this.isDarkTheme(theme) ? 'dark' : 'light'
	}
}

/**
 * @example Advanced Usage
 * 
 * **1. Render Theme Selector**
 * ```tsx
 * function ThemeSelector() {
 *   const themes = ThemeHelper.toList()
 *   
 *   return (
 *     <select>
 *       {themes.map(theme => (
 *         <option key={theme.value} value={theme.value}>
 *           {theme.display} {theme.isDark ? '🌙' : '☀️'}
 *         </option>
 *       ))}
 *     </select>
 *   )
 * }
 * ```
 * 
 * **2. Dynamic Styling**
 * ```typescript
 * const theme = useCurrentTheme()
 * const metadata = ThemeHelper.getMetadata(theme)
 * 
 * if (metadata.isDark) {
 *   // Apply dark-specific logic
 * }
 * ```
 * 
 * **3. Filter by Category**
 * ```typescript
 * const darkThemes = ThemeHelper.getThemesByCategory('dark')
 * const lightThemes = ThemeHelper.getThemesByCategory('light')
 * ```
 */

