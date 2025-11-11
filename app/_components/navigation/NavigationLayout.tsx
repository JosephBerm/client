/**
 * NavigationLayout Component
 *
 * Root navigation layout that wraps all application pages.
 * Manages the Navbar and conditional Sidebar based on authentication state.
 * Provides consistent navigation structure across the entire app.
 *
 * **Features:**
 * - Persistent navbar at top
 * - Conditional sidebar (authenticated users only)
 * - Mobile sidebar toggle state management
 * - Flex layout with sidebar + main content
 * - Authentication-aware rendering
 * - Full-height main content area
 *
 * **Layout Structure:**
 * - Navbar: Always visible at top
 * - Flex container:
 *   - Sidebar: Visible only when authenticated
 *   - Main: Flex-1, takes remaining space
 *
 * **Authentication States:**
 * - Unauthenticated: Navbar + Main content (no sidebar)
 * - Authenticated: Navbar + Sidebar + Main content
 *
 * **Use Cases:**
 * - Root layout wrapper
 * - Application-wide navigation
 * - Protected route layouts
 * - Consistent page structure
 *
 * @example
 * ```tsx
 * import NavigationLayout from '@_components/navigation/NavigationLayout';
 *
 * // In app/layout.tsx or app/(protected)/layout.tsx
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <NavigationLayout>
 *           {children}
 *         </NavigationLayout>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * // Renders as:
 * // <Navbar />
 * // <div className="flex">
 * //   {isAuthenticated && <Sidebar />}
 *   <main>{children}</main>
 * // </div>
 * ```
 *
 * @module NavigationLayout
 */

'use client'

import { useState } from 'react'
import { useAuthStore } from '@_stores/useAuthStore'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

/**
 * NavigationLayout component props interface.
 */
interface NavigationLayoutProps {
	/**
	 * Page content to render within the navigation layout.
	 */
	children: React.ReactNode
}

/**
 * NavigationLayout Component
 *
 * Top-level layout component that provides navigation structure.
 * Manages sidebar open/close state and coordinates with Navbar and Sidebar components.
 *
 * **State Management:**
 * - sidebarOpen: Controls mobile sidebar drawer state
 * - isAuthenticated: From auth store, determines if sidebar should render
 *
 * **Navbar Integration:**
 * - Passes onMenuClick to toggle sidebar on mobile
 * - Burger menu button in navbar triggers setSidebarOpen
 *
 * **Sidebar Integration:**
 * - Passes isOpen state to control visibility
 * - Passes onClose callback for drawer closing
 * - Only rendered when user is authenticated
 *
 * **Main Content:**
 * - Flex-1 to fill remaining space
 * - Min-height of full viewport
 * - Base background color
 *
 * **Responsive Behavior:**
 * - Mobile: Sidebar as drawer overlay (toggled by navbar burger)
 * - Desktop: Sidebar persistent, main content adjusts width
 *
 * @param props - Component props including children
 * @returns NavigationLayout component
 */
export default function NavigationLayout({ children }: NavigationLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

	return (
		<>
			<Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

			<div className="flex">
				{isAuthenticated && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

				<main className="flex-1 min-h-screen bg-base-100">{children}</main>
			</div>
		</>
	)
}
