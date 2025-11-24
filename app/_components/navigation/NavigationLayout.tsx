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

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import { usePathname } from 'next/navigation'

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
	const pathname = usePathname()

	// Check if we're in the internal app (/app/*) - these routes have their own layout
	const isInternalApp = pathname.startsWith('/app')

	// Use media query hook for responsive behavior
	// Breakpoint matches Tailwind's 'lg' breakpoint (1024px) used in Sidebar component
	// Mobile: < 1024px (drawer overlay), Desktop: >= 1024px (persistent sidebar)
	const isMobile = useMediaQuery('(max-width: 1023px)')
	const prevIsMobile = useRef(isMobile)

	// Focus management: Store trigger element for focus restoration
	// Following WAI-ARIA best practices: restore focus to trigger element when closing
	// This matches FAANG-level implementations (Google, Facebook, Amazon, Netflix)
	const previousFocusRef = useRef<HTMLElement | null>(null)

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

	// Close sidebar when user logs out (auth state changes)
	// Defensive: Ensure sidebar state is reset when authentication changes
	// Prevents stale state if user logs out and back in quickly
	useEffect(() => {
		if (!isAuthenticated && sidebarOpen) {
				setSidebarOpen(false)
			}
	}, [isAuthenticated, sidebarOpen])

	// Store trigger element when sidebar opens (for focus restoration)
	// Following WAI-ARIA 2.1 and industry best practices (FAANG-level)
	// When a drawer/modal closes, focus should return to the element that opened it
	// Matches pattern used in useModal and useFocusTrap hooks for consistency
	useEffect(() => {
		if (sidebarOpen) {
			// Store the currently focused element (the trigger button)
			previousFocusRef.current = document.activeElement as HTMLElement
		}
	}, [sidebarOpen])

	// Shared focus restoration utility (DRY principle)
	// Extracted to avoid duplication between escape handler and closeSidebar
	// Follows same pattern as useFocusTrap cleanup function for consistency
	const restoreFocusToTrigger = useCallback(() => {
		const triggerElement = previousFocusRef.current
		if (!triggerElement) {return}

		// Use setTimeout to ensure state update completes before focus restoration
		// Matches pattern used in useFocusTrap and useModal hooks
		setTimeout(() => {
			// Defensive: Verify element still exists and is in DOM before focusing
			// Prevents errors if element was removed during sidebar close animation
			if (triggerElement && document.contains(triggerElement) && typeof triggerElement.focus === 'function') {
				triggerElement.focus()
			}
			// Clear ref after restoration attempt (prevents stale references)
			previousFocusRef.current = null
		}, 0)
	}, [])

	// Close sidebar on escape key with focus restoration
	// Industry best practice: Escape closes drawer AND restores focus to trigger element
	// This matches WAI-ARIA guidelines and FAANG implementations (Google Material, Facebook, Amazon)
	const handleEscape = useCallback((e: KeyboardEvent) => {
		// Use both key and code for maximum compatibility (FAANG-level defensive programming)
		if ((e.key === 'Escape' || e.code === 'Escape') && sidebarOpen) {
			e.preventDefault() // Prevent default focus behavior (prevents X button from receiving focus)
			setSidebarOpen(false)
			restoreFocusToTrigger()
		}
	}, [sidebarOpen, restoreFocusToTrigger])

	useEffect(() => {
		window.addEventListener('keydown', handleEscape)
		return () => window.removeEventListener('keydown', handleEscape)
	}, [handleEscape])

	// Prevent body scroll when sidebar is open on mobile
	useEffect(() => {
		// Only run on client
		if (typeof window === 'undefined') {return}

		if (sidebarOpen && isMobile) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [sidebarOpen, isMobile])

	// Memoized handlers to prevent unnecessary re-renders of child components
	// Following FAANG-level performance best practices
	const toggleSidebar = useCallback(() => {
		setSidebarOpen((prev) => !prev)
	}, [])

	const closeSidebar = useCallback(() => {
		setSidebarOpen(false)
		// Restore focus to trigger element when closing via other methods (click outside, etc.)
		// This ensures consistent behavior regardless of how sidebar is closed
		// Uses shared restoreFocusToTrigger utility for DRY code
		restoreFocusToTrigger()
	}, [restoreFocusToTrigger])

	// Memoize the onMenuClick prop to ensure stable reference
	// Only pass handler when sidebar exists (authenticated users)
	// This prevents Navbar from re-rendering unnecessarily
	const navbarMenuClickHandler = useMemo(() => {
		return isAuthenticated ? toggleSidebar : undefined
	}, [isAuthenticated, toggleSidebar])

	return (
		<div className="relative min-h-screen w-full bg-base-100">
			{/* Only show Navbar on public routes (NOT in /app) */}
			{/* Only pass onMenuClick when sidebar exists (authenticated users) */}
			{/* Memoized handler ensures stable prop reference for optimal performance */}
			{!isInternalApp && <Navbar onMenuClick={navbarMenuClickHandler} />}

			{/* Internal app routes (/app/*) have their own layout - render children directly */}
			{isInternalApp ? (
				children
			) : (
				<div className="relative mx-auto flex w-full max-w-[1600px] gap-0 lg:gap-10 overflow-x-hidden">
					{/* Public sidebar - only for authenticated users on public routes */}
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
			)}
		</div>
	)
}
