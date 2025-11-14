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

import { useState, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { useAuthStore } from '@_features/auth'
import { useMediaQuery } from '@_shared'
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

	// Use media query hook for responsive behavior
	// Breakpoint matches Tailwind's 'lg' breakpoint (1024px) used in Sidebar component
	// Mobile: < 1024px (drawer overlay), Desktop: >= 1024px (persistent sidebar)
	const isMobile = useMediaQuery('(max-width: 1023px)')
	const prevIsMobile = useRef(isMobile)

	// Close sidebar when screen size changes to desktop
	// This prevents the sidebar drawer from remaining open when resizing from mobile to desktop and back
	// On desktop (>= 1024px), the sidebar should be persistent, not a drawer
	// Only closes when transitioning from mobile to desktop (not on initial mount or when already desktop)
	useEffect(() => {
		// Only close if we transitioned from mobile to desktop AND sidebar is currently open
		if (!isMobile && prevIsMobile.current && sidebarOpen) {
			setSidebarOpen(false)
		}
		// Update ref to track current breakpoint state
		prevIsMobile.current = isMobile
	}, [isMobile, sidebarOpen])

	// Close sidebar on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && sidebarOpen) {
				setSidebarOpen(false)
			}
		}

		window.addEventListener('keydown', handleEscape)
		return () => window.removeEventListener('keydown', handleEscape)
	}, [sidebarOpen])

	// Prevent body scroll when sidebar is open on mobile
	useEffect(() => {
		// Only run on client
		if (typeof window === 'undefined') return

		if (sidebarOpen && isMobile) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [sidebarOpen, isMobile])

	const toggleSidebar = () => {
		setSidebarOpen((prev) => !prev)
	}

	const closeSidebar = () => {
		setSidebarOpen(false)
	}

	return (
		<div className="relative min-h-screen w-full bg-base-100">
			<Navbar onMenuClick={toggleSidebar} />

			<div className="relative mx-auto flex w-full max-w-[1600px] gap-0 lg:gap-10 overflow-x-hidden">
				{isAuthenticated && (
					<Sidebar
						isOpen={sidebarOpen}
						onClose={closeSidebar}
						ariaLabel="MedSource Pro navigation"
					/>
				)}

				<main
					id="page-content"
					className={classNames(
						'relative flex-1 bg-base-100',
						'min-h-[calc(100vh-var(--nav-height))]',
						'px-4 pb-16 pt-8 sm:px-6 lg:px-12 xl:px-16',
						'transition-[padding] duration-300 ease-in-out',
						'overflow-x-hidden w-full min-w-0'
					)}
				>
					{children}
				</main>
			</div>
		</div>
	)
}
