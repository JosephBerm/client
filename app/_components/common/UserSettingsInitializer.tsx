/**
 * UserSettingsInitializer Component
 *
 * Client-side component that initializes and applies user settings on application load.
 * Manages theme application to the document root and ensures settings persist across sessions.
 * Should be rendered once in the root layout alongside AuthInitializer.
 *
 * **Features:**
 * - Automatic theme application on mount
 * - Reactive theme updates when user changes preferences
 * - Applies theme to document.documentElement data-theme attribute
 * - No visual rendering (returns null)
 * - Persists via localStorage (handled by useUserSettingsStore)
 * - Client-side only ('use client' directive)
 *
 * **Settings Managed:**
 * - Theme (DaisyUI theme names)
 * - User preferences (stored in useUserSettingsStore)
 * - Shopping cart state (persisted)
 *
 * **Theme Application:**
 * The component applies the theme by setting the data-theme attribute on the
 * HTML root element, which DaisyUI uses to apply theme-specific CSS variables.
 *
 * **Use Cases:**
 * - Root layout initialization
 * - Theme persistence across sessions
 * - Applying user preferences on app load
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
 *
 * // Theme will be automatically applied from localStorage
 * // When user changes theme in settings:
 * const setTheme = useUserSettingsStore(state => state.setTheme);
 * setTheme('dark'); // UserSettingsInitializer will apply it reactively
 * ```
 *
 * @module UserSettingsInitializer
 */

'use client'

import { useEffect } from 'react'
import { useUserSettingsStore } from '@_stores/useUserSettingsStore'

/**
 * UserSettingsInitializer Component
 *
 * Invisible component that applies user settings (especially theme) to the DOM.
 * Must be rendered in a client component context.
 *
 * **Implementation Details:**
 * - Subscribes to theme from useUserSettingsStore
 * - Runs effect whenever theme changes
 * - Sets data-theme attribute on document root element
 * - Returns null (no UI rendering)
 *
 * **Theme Application:**
 * DaisyUI themes are applied via the data-theme attribute on the HTML element:
 * ```html
 * <html data-theme="light">  <!-- Light theme -->
 * <html data-theme="dark">   <!-- Dark theme -->
 * <html data-theme="medsource-classic">  <!-- Custom theme -->
 * ```
 *
 * **SSR Considerations:**
 * - Checks typeof document !== 'undefined' for SSR safety
 * - Theme is applied client-side after hydration
 * - May cause brief flash of unstyled content (FOUC)
 *
 * **Important Notes:**
 * - Must be placed in a client component ('use client')
 * - Should be rendered high in the component tree (root layout)
 * - Reacts to theme changes in real-time
 * - localStorage persistence handled by useUserSettingsStore
 *
 * @returns null - Component does not render any UI
 */
export default function UserSettingsInitializer() {
	const theme = useUserSettingsStore((state) => state.theme)

	useEffect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme)
		}
	}, [theme])

	return null
}
