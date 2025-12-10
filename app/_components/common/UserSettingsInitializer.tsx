/**
 * UserSettingsInitializer Component
 *
 * Client-side component that initializes and applies user settings on application load.
 * Manages theme application to the document root and ensures settings persist across sessions.
 * Should be rendered once in the root layout alongside AuthInitializer.
 *
 * **Architecture (Church of God Pattern):**
 * - Single initialization point via `initialize()` method
 * - Called once on mount with empty dependency array
 * - Initializes theme, preferences, and applies them to DOM
 * - MutationObserver in store handles reactive updates
 *
 * **Changes from Old Implementation:**
 * - **Before**: Reactive theme application via useEffect watching theme state
 * - **After**: One-time initialization via `initialize()` method
 * - **Benefit**: Cleaner separation, prevents unnecessary re-renders
 * - **Benefit**: Service layer handles persistence and DOM updates
 * - **Benefit**: Better performance and predictability
 *
 * **Settings Initialized:**
 * - Theme (DaisyUI theme names)
 * - Table page size preference
 * - Sidebar collapsed state
 * - Custom user preferences
 *
 * **Theme Application:**
 * The `initialize()` method retrieves stored theme and applies it via
 * ThemeService, which sets the data-theme attribute on the HTML root element.
 * DaisyUI then applies theme-specific CSS variables.
 *
 * **SSR Considerations:**
 * - Initialization only runs client-side ('use client' directive)
 * - Returns null (no UI rendering)
 * - May cause brief flash of unstyled content (FOUC) on first load
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import AuthInitializer from '@_components/common/AuthInitializer';
 * import UserSettingsInitializer from '@_components/common/UserSettingsInitializer';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <AuthInitializer />
 *         <UserSettingsInitializer />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @module UserSettingsInitializer
 */

'use client'

import { useEffect } from 'react'

import { useUserSettingsStore } from '@_features/settings'

import { logger } from '@_core'

/**
 * UserSettingsInitializer Component
 *
 * Invisible component that initializes all user settings on app mount.
 * Must be rendered in a client component context.
 *
 * **Implementation Details:**
 * - Calls `initialize()` method from useUserSettingsStore
 * - Runs once on mount (empty dependency array)
 * - Handles errors gracefully with console logging
 * - Returns null (no UI rendering)
 *
 * **Initialization Process:**
 * 1. Retrieve stored settings from localStorage (via UserSettingsService)
 * 2. Apply theme to document (via ThemeService)
 * 3. Load preferences into store
 * 4. Set up MutationObserver for theme sync (handled by store)
 *
 * **Performance:**
 * - Single initialization call (not reactive)
 * - Subsequent theme changes handled by store's MutationObserver
 * - No unnecessary re-renders
 *
 * **Important Notes:**
 * - Must be placed in a client component ('use client')
 * - Should be rendered high in the component tree (root layout)
 * - Only runs once per application load
 * - Do not call initialize() elsewhere in the app
 *
 * @returns null - Component does not render any UI
 */
export default function UserSettingsInitializer() {
	const initialize = useUserSettingsStore((state) => state.initialize)

	useEffect(() => {
		// Initialize all user settings (theme and preferences) on mount
		// Only run once - empty dependency array ensures this
		initialize().catch((error) => {
			logger.error('Failed to initialize user settings', {
				error,
				component: 'UserSettingsInitializer',
			})
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Empty array - only run once on mount

	// This component doesn't render anything
	return null
}
