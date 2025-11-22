/**
 * User Settings and Preferences Store
 * 
 * Unified Zustand store for all user preferences following Church of God architecture.
 * This store serves as the single source of truth for user settings throughout the application.
 * 
 * **Architecture Improvements:**
 * - Service Layer Pattern: Uses UserSettingsService and ThemeService
 * - Separation of Concerns: Cart moved to separate store
 * - DOM Synchronization: MutationObserver watches for external theme changes
 * - Versioning: Schema versioning via UserSettingsService
 * - Type Safety: Strong TypeScript interfaces
 * - SSR Safe: Graceful fallbacks for server-side rendering
 * 
 * **Managed State:**
 * - Theme selection and persistence
 * - UI preferences (table pagination, sidebar collapse)
 * - Custom key-value preferences (extensible)
 * - Loading states for async operations
 * 
 * **Migration from Old Architecture:**
 * - Removed: Zustand persist middleware (now handled by services)
 * - Removed: Cart functionality (moved to useCartStore)
 * - Added: initialize() method for one-time setup
 * - Added: MutationObserver for theme DOM sync
 * - Added: Loading states
 * - Improved: Service layer for persistence
 * 
 * @example
 * ```typescript
 * // Access theme
 * const currentTheme = useUserSettingsStore(state => state.currentTheme);
 * 
 * // Change theme
 * const setTheme = useUserSettingsStore(state => state.setTheme);
 * setTheme(Theme.Luxury); // Automatically applies to document
 * 
 * // Table pagination preference
 * const tablePageSize = useUserSettingsStore(state => state.preferences.tablePageSize);
 * const setTablePageSize = useUserSettingsStore(state => state.setTablePageSize);
 * setTablePageSize(25);
 * 
 * // Initialize on app load (call once in UserSettingsInitializer)
 * const initialize = useUserSettingsStore(state => state.initialize);
 * initialize();
 * ```
 * 
 * @module useUserSettingsStore
 */

'use client'

import { create } from 'zustand'
import { Theme } from '@_classes/SharedEnums'
import { ThemeService } from '../services/ThemeService'
import { ReducedMotionService } from '../services/ReducedMotionService'
import { UserSettingsService } from '../services/UserSettingsService'
import { logger } from '@_core'

/**
 * User preferences for UI behavior and display.
 * Extensible with custom key-value pairs.
 */
export interface UserPreferences {
	/** Default number of items per page in tables */
	tablePageSize: number
	/** Whether sidebar is collapsed (mobile/desktop) */
	sidebarCollapsed: boolean
	/** Additional custom preferences can be added dynamically */
	[key: string]: any
}

/**
 * Theme state slice interface.
 */
interface ThemeState {
	/** Current selected theme */
	currentTheme: Theme
	/** Theme loading state (for async operations) */
	themeLoading: boolean
}

/**
 * Reduced motion state slice interface.
 */
interface ReducedMotionState {
	/** Whether user prefers reduced motion */
	prefersReducedMotion: boolean
}

/**
 * Preferences state slice interface.
 */
interface PreferencesState {
	/** User UI preferences */
	preferences: UserPreferences
}

/**
 * User settings store actions interface.
 */
interface UserSettingsActions {
	/**
	 * Sets the theme and updates DOM and persistence.
	 * 
	 * @param {Theme} theme - The theme to set
	 * @returns {void}
	 */
	setTheme: (theme: Theme) => void
	
	/**
	 * Sets a specific preference by key.
	 * 
	 * @template K - Key of UserPreferences
	 * @param {K} key - The preference key
	 * @param {UserPreferences[K]} value - The value to set
	 * @returns {void}
	 */
	setPreference: <K extends keyof UserPreferences>(
		key: K,
		value: UserPreferences[K]
	) => void
	
	/**
	 * Sets the default table page size.
	 * 
	 * @param {number} size - The page size
	 * @returns {void}
	 */
	setTablePageSize: (size: number) => void
	
	/**
	 * Sets sidebar collapsed state.
	 * 
	 * @param {boolean} collapsed - Whether sidebar is collapsed
	 * @returns {void}
	 */
	setSidebarCollapsed: (collapsed: boolean) => void
	
	/**
	 * Sets the reduced motion preference and updates DOM and persistence.
	 * 
	 * @param {boolean} prefersReduced - Whether to enable reduced motion
	 * @returns {void}
	 */
	setPrefersReducedMotion: (prefersReduced: boolean) => void
	
	/**
	 * Initializes all user settings from storage.
	 * Should be called once when the application loads.
	 * 
	 * @returns {Promise<void>} Promise that resolves when initialization is complete
	 */
	initialize: () => Promise<void>
}

/**
 * Combined user settings store type.
 */
type UserSettingsStore = ThemeState & ReducedMotionState & PreferencesState & UserSettingsActions

/**
 * Default preferences values.
 */
const DEFAULT_PREFERENCES: UserPreferences = {
	tablePageSize: 10,
	sidebarCollapsed: false,
}

/**
 * Unified Zustand store for all user settings (theme and preferences).
 * 
 * This store serves as the single source of truth for all user preferences
 * throughout the application. It follows the Church of God architecture pattern
 * with service layer separation, DOM synchronization, and type safety.
 * 
 * **Architecture:**
 * - **Domain Slices**: Theme and preferences are separate slices within unified store
 * - **Service Layer**: Uses UserSettingsService for unified storage
 * - **DOM Sync**: Automatically syncs theme to DOM
 * - **MutationObserver**: Watches for external DOM changes to keep theme in sync
 * 
 * **Features:**
 * - **Single Source of Truth**: All user preferences in one place
 * - **Consistent API**: Same pattern for all settings
 * - **Performance**: Zustand's selector optimization prevents unnecessary re-renders
 * - **Type-Safe**: Full TypeScript support
 * - **SSR-Safe**: Handles server-side rendering gracefully
 * - **Separation of Concerns**: Cart moved to separate store
 * 
 * **Industry Best Practices:**
 * - Centralized user settings management
 * - Domain slices for clear separation
 * - Unified persistence via services
 * - Automatic DOM synchronization
 * - MutationObserver for external changes
 * - Initialize pattern for one-time setup
 * 
 * **Usage:**
 * ```tsx
 * // In UserSettingsInitializer component (call once on app load)
 * const initialize = useUserSettingsStore((state) => state.initialize)
 * useEffect(() => { initialize() }, [initialize])
 * 
 * // Access theme
 * const currentTheme = useUserSettingsStore((state) => state.currentTheme)
 * const setTheme = useUserSettingsStore((state) => state.setTheme)
 * 
 * // Access preferences
 * const tablePageSize = useUserSettingsStore((state) => state.preferences.tablePageSize)
 * const setTablePageSize = useUserSettingsStore((state) => state.setTablePageSize)
 * ```
 * 
 * @see {@link UserSettingsService} - Unified persistence service
 * @see {@link ThemeService} - Theme-specific service methods
 * @see {@link useCartStore} - Separate store for shopping cart
 */
export const useUserSettingsStore = create<UserSettingsStore>()((set, get) => {
	// Set up MutationObserver for theme DOM sync (only on client, singleton pattern)
	// This runs once when the store is created
	if (typeof window !== 'undefined') {
		// Only set up observer once (check if already set up)
		if (!document.documentElement.hasAttribute('data-theme-observer-setup')) {
			const observer = new MutationObserver(() => {
				const appliedTheme = ThemeService.getCurrentTheme()
				const currentTheme = get().currentTheme
				// Only update if different to prevent infinite loops
				if (appliedTheme !== currentTheme) {
					set({ currentTheme: appliedTheme })
				}
			})

			// Start observing
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['data-theme'],
			})

			// Mark as set up to prevent duplicate observers
			document.documentElement.setAttribute('data-theme-observer-setup', 'true')
		}
	}

	return {
		// Initial state - Theme
		currentTheme: Theme.Winter,
		themeLoading: false,

		// Initial state - Reduced Motion
		prefersReducedMotion: false,

		// Initial state - Preferences
		preferences: DEFAULT_PREFERENCES,

		/**
		 * Set theme and update DOM and persistence.
		 */
		setTheme: (theme: Theme) => {
			set({ currentTheme: theme, themeLoading: true })

			try {
				// Update DOM
				ThemeService.applyTheme(theme)

				// Persist via ThemeService (uses UserSettingsService internally)
				ThemeService.setStoredTheme(theme)

				set({ themeLoading: false })
			} catch (error) {
				logger.error('Failed to set theme', {
					error,
					theme,
					component: 'useUserSettingsStore',
				})
				set({ themeLoading: false })
			}
		},

		/**
		 * Sets a custom preference by key.
		 * Allows dynamic addition of new preferences without schema changes.
		 */
		setPreference: (key, value) => {
			set((state) => ({
				preferences: {
					...state.preferences,
					[key]: value,
				},
			}))
			
			// Persist to localStorage
			try {
				const currentSettings = UserSettingsService.getSettings()
				UserSettingsService.setSettings({
					...currentSettings,
					[key]: value,
				})
			} catch (error) {
				logger.error('Failed to persist preference', {
					error,
					preference: String(key),
					value,
					component: 'useUserSettingsStore',
				})
			}
		},

		/**
		 * Sets the default table page size preference.
		 * Used by ServerDataGrid and DataGrid components.
		 */
		setTablePageSize: (size) => {
			set((state) => ({
				preferences: {
					...state.preferences,
					tablePageSize: size,
				},
			}))
			
			// Persist to localStorage
			try {
				UserSettingsService.setSetting('tablePageSize', size)
			} catch (error) {
				logger.error('Failed to persist table page size', {
					error,
					size,
					component: 'useUserSettingsStore',
				})
			}
		},

		/**
		 * Sets the sidebar collapsed state.
		 * Controls sidebar visibility in navigation layout.
		 */
		setSidebarCollapsed: (collapsed) => {
			set((state) => ({
				preferences: {
					...state.preferences,
					sidebarCollapsed: collapsed,
				},
			}))
			
			// Persist to localStorage
			try {
				UserSettingsService.setSetting('sidebarCollapsed', collapsed)
			} catch (error) {
				logger.error('Failed to persist sidebar state', {
					error,
					collapsed,
					component: 'useUserSettingsStore',
				})
			}
		},

		/**
		 * Set reduced motion preference and update DOM and persistence.
		 */
		setPrefersReducedMotion: (prefersReduced) => {
			set({ prefersReducedMotion: prefersReduced })

			try {
				// Update DOM
				ReducedMotionService.applyPreference(prefersReduced)

				// Persist via ReducedMotionService (uses UserSettingsService internally)
				ReducedMotionService.setStoredPreference(prefersReduced)
			} catch (error) {
				logger.error('Failed to set reduced motion preference', {
					error,
					prefersReduced,
					component: 'useUserSettingsStore',
				})
			}
		},

		/**
		 * Initialize all user settings from storage.
		 * Called once on app startup by UserSettingsInitializer.
		 * 
		 * **Important:** This should only be called once by UserSettingsInitializer.
		 * Do not call this after user changes settings, as it will overwrite
		 * the current state with stored values.
		 */
		initialize: async () => {
			if (typeof window === 'undefined') return

			set({ themeLoading: true })

			try {
				// Initialize theme
				const storedTheme = ThemeService.getStoredTheme() // Gets system preference if no stored theme
				const theme = storedTheme || Theme.Winter
				ThemeService.applyTheme(theme)
				
				// Persist the theme to localStorage if it came from system preference
				// This ensures the theme persists across page reloads
				if (!UserSettingsService.getSetting('theme')) {
					ThemeService.setStoredTheme(theme)
				}

				// Initialize reduced motion preference
				const storedReducedMotion = ReducedMotionService.getStoredPreference() // Gets system preference if no stored preference
				const prefersReducedMotion = storedReducedMotion
				ReducedMotionService.applyPreference(prefersReducedMotion)
				
				// Persist the preference to localStorage if it came from system preference
				// This ensures the preference persists across page reloads
				if (UserSettingsService.getSetting('prefersReducedMotion') === undefined) {
					ReducedMotionService.setStoredPreference(prefersReducedMotion)
				}

				// Initialize preferences from UserSettingsService
				const settings = UserSettingsService.getSettings()
				const preferences: UserPreferences = {
					tablePageSize: settings.tablePageSize || DEFAULT_PREFERENCES.tablePageSize,
					sidebarCollapsed: settings.sidebarCollapsed !== undefined 
						? settings.sidebarCollapsed 
						: DEFAULT_PREFERENCES.sidebarCollapsed,
				}

				// Copy any custom preferences
				for (const [key, value] of Object.entries(settings)) {
					if (!['theme', 'prefersReducedMotion', 'tablePageSize', 'sidebarCollapsed'].includes(key)) {
						preferences[key] = value
					}
				}

				// Update state
				set({
					currentTheme: theme,
					prefersReducedMotion,
					preferences,
					themeLoading: false,
				})
			} catch (error) {
				logger.error('Failed to initialize user settings', {
					error,
					component: 'useUserSettingsStore',
				})
				set({ themeLoading: false })
			}
		},
	}
})
