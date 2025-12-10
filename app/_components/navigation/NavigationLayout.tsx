/**
 * NavigationLayout Component
 *
 * Root navigation layout that wraps all application pages.
 * Manages the Navbar and conditional Sidebar based on authentication state.
 * Provides consistent navigation structure across the entire app.
 *
 * **Features:**
 * - Persistent navbar at top (public routes only)
 * - Public mobile menu for all users on public routes
 * - No internal sidebar on public routes (industry best practice)
 * - Internal routes (/app/*) have their own layout with internal sidebar
 * - Full-height main content area
 *
 * **Layout Structure:**
 * - Navbar: Always visible at top (public routes)
 * - Main: Flex-1, takes remaining space
 * - Public mobile menu: Accessible to all users via hamburger button
 *
 * **Route-Based Navigation:**
 * - Public routes (/, /about-us, /store, /contact): Navbar with public navigation
 * - Internal routes (/app/*): InternalAppShell with internal sidebar (separate layout)
 * - Industry best practice: Navigation matches route context (public vs internal)
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

import { usePathname } from 'next/navigation'

import classNames from 'classnames'

import Navbar from './Navbar'

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
 * **Public Route Behavior:**
 * - Shows Navbar component (handles public navigation)
 * - No internal sidebar (industry best practice)
 * - Public mobile menu accessible to all users
 * - Authenticated users can access dashboard via user menu or mobile menu link
 *
 * **Internal Route Behavior:**
 * - Routes starting with /app/* use InternalAppShell layout
 * - Internal sidebar provided by InternalAppShell
 * - Public Navbar not shown on internal routes
 *
 * **Main Content:**
 * - Flex-1 to fill remaining space
 * - Min-height of full viewport
 * - Base background color
 *
 * **Industry Best Practices:**
 * - Navigation matches route context (public vs internal)
 * - Public navigation always accessible on public routes
 * - Follows patterns from Amazon, Netflix, Google
 *
 * @param props - Component props including children
 * @returns NavigationLayout component
 */
export default function NavigationLayout({ children }: NavigationLayoutProps) {
	const pathname = usePathname()

	// Check if we're in the internal app (/app/*) - these routes have their own layout
	const isInternalApp = pathname.startsWith('/app')

	// Note: Sidebar state management removed for public routes
	// Internal sidebar is only used in /app/* routes (handled by InternalAppShell)
	// Public routes use Navbar's built-in public mobile menu (works for all users)
	// Industry best practice: Navigation should match route context (public vs internal)

	return (
		<div className="relative min-h-screen w-full bg-base-100">
			{/* Only show Navbar on public routes (NOT in /app) */}
			{/* Don't pass onMenuClick for public routes - Navbar handles public mobile menu internally */}
			{/* Industry best practice: Public routes show public navigation, not internal sidebar */}
			{!isInternalApp && <Navbar />}

			{/* Internal app routes (/app/*) have their own layout - render children directly */}
			{isInternalApp ? (
				children
			) : (
				<div className="relative mx-auto flex w-full max-w-[1600px] gap-0 lg:gap-10 overflow-x-hidden">
					{/* No sidebar on public routes - public navigation is handled by Navbar */}
					{/* Industry best practice: Navigation should match route context (public vs internal) */}

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
