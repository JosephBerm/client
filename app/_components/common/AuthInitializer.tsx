/**
 * AuthInitializer Component
 *
 * Client-side component that initializes authentication state on application load.
 * Checks for existing authentication tokens and restores user session if valid.
 * Should be rendered once in the root layout to ensure auth state is ready before
 * the app renders protected content.
 *
 * **Features:**
 * - Automatic auth state initialization on mount
 * - Calls useAuthStore.checkAuth() to validate session
 * - No visual rendering (returns null)
 * - Runs once per app load
 * - Client-side only ('use client' directive)
 *
 * **Authentication Flow:**
 * 1. Component mounts in root layout
 * 2. useEffect calls checkAuth() from auth store
 * 3. checkAuth reads JWT token from HTTP-only cookie
 * 4. If token exists, fetches user data from API
 * 5. Updates auth store with user data
 * 6. If token invalid/expired, clears auth state
 *
 * **Use Cases:**
 * - Root layout initialization
 * - Session restoration on page reload
 * - Persistent authentication across browser sessions
 *
 * @example
 * ```tsx
 * // In app/layout.tsx or app/(protected)/layout.tsx
 * import AuthInitializer from '@_components/common/AuthInitializer';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <AuthInitializer />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @module AuthInitializer
 */

'use client'

import { useEffect } from 'react'

import { useAuthStore } from '@_features/auth'

/**
 * AuthInitializer Component
 *
 * Invisible component that initializes authentication state on app startup.
 * Must be rendered in a client component context.
 *
 * **Implementation Details:**
 * - Uses useAuthStore hook to access checkAuth function
 * - Runs checkAuth in useEffect with empty dependency array (once on mount)
 * - Returns null (no UI rendering)
 *
 * **Important Notes:**
 * - Must be placed in a client component ('use client')
 * - Should be rendered high in the component tree (root layout)
 * - Runs before any protected routes are accessed
 * - Does not block rendering (async auth check)
 *
 * @returns null - Component does not render any UI
 */
export default function AuthInitializer() {
	const checkAuth = useAuthStore((state) => state.checkAuth)

	useEffect(() => {
		void checkAuth()
	}, [checkAuth])

	return null
}
