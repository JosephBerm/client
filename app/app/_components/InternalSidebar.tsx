/**
 * Internal Sidebar Component
 *
 * Permanent sidebar navigation for the internal application portal (/app routes).
 * Designed specifically for authenticated users with role-based navigation.
 *
 * **Design Philosophy:**
 * - Permanent sidebar on desktop (>= 1024px) - portal-style like Notion, Linear, Stripe
 * - Mobile drawer (< 1024px) - overlay with backdrop
 * - Clean, modern design with DaisyUI theme integration
 * - Role-based navigation sections
 *
 * **Key Differences from Public Sidebar:**
 * - Shows ONLY internal app routes (Dashboard, Orders, Quotes, etc.)
 * - NO public routes (Home, About, Store, Contact)
 * - Permanent on desktop (not a drawer)
 * - Different visual design (more compact, portal-focused)
 * - Integrated with InternalAppShell, NOT NavigationLayout
 *
 * **Features:**
 * - Role-based navigation (Customer vs Admin views)
 * - Collapsible sections
 * - Active route highlighting
 * - Icon + Label layout
 * - Mobile-first responsive design
 * - Keyboard accessible (Escape to close on mobile)
 * - Body scroll lock on mobile
 * - Click-outside-to-close on mobile
 *
 * **Responsive Behavior:**
 * - **Desktop (>= 1024px)**: Fixed 384px width, always visible, permanent
 * - **Mobile (< 1024px)**: Full-screen overlay drawer, closes on link click
 *
 * **Performance:**
 * - React Compiler automatically optimizes re-renders and callbacks
 * - No manual memoization needed (React Compiler handles it)
 *
 * @module InternalSidebar
 */

'use client'

import { useState, useRef } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import classNames from 'classnames'
import { Settings, ChevronDown, LogOut, Shield, X } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { logout as logoutService } from '@_features/auth/services/AuthService'
import { NavigationService, Routes } from '@_features/navigation'

import { logger } from '@_core'

import { useAdminView, useMediaQuery, useSidebarDrawer } from '@_shared'

import NavigationIcon from '@_components/navigation/NavigationIcon'
import SettingsModal from '@_components/settings/SettingsModal'
import Button from '@_components/ui/Button'
import Logo from '@_components/ui/Logo'
import Toggle from '@_components/ui/Toggle'

/**
 * Internal Sidebar component props interface.
 */
interface InternalSidebarProps {
	/**
	 * Whether the sidebar is open (mobile drawer).
	 * On desktop (>= 1024px), sidebar is always visible regardless of this prop.
	 */
	isOpen: boolean

	/**
	 * Callback to close the sidebar (mobile only).
	 */
	onClose: () => void
}

/**
 * Internal Sidebar Component
 *
 * Portal-style navigation sidebar for the internal application.
 * Provides permanent navigation on desktop and drawer on mobile.
 *
 * **Navigation Structure:**
 * - Main: Dashboard, Internal Store (all authenticated users)
 * - My Orders: Orders, Quotes (customers and admins)
 * - Management: Products, Orders, Quotes (admins only)
 * - Users: Accounts, Customers, Providers (admins only)
 * - Analytics: Dashboard (admins only)
 * - Account: Profile, Notifications (all authenticated users)
 *
 * **Desktop Behavior:**
 * - Fixed position at left edge
 * - 384px width
 * - Always visible (permanent)
 * - No overlay or backdrop
 * - Part of the layout flow
 *
 * **Mobile Behavior:**
 * - Overlay drawer (z-50)
 * - Full-screen backdrop
 * - Closes on link click
 * - Closes on outside click
 * - Closes on Escape key
 * - Body scroll lock when open
 *
 * @param props - Component props including isOpen and onClose
 * @returns Internal sidebar component
 */
export default function InternalSidebar({ isOpen, onClose }: InternalSidebarProps) {
	const pathname = usePathname()
	const router = useRouter()
	const user = useAuthStore((state) => state.user)
	const clearAuthState = useAuthStore((state) => state.logout)
	const { isAdmin, isAdminViewActive, setAdminViewEnabled } = useAdminView()

	// Logout loading state
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	// Detect mobile vs desktop
	const isMobile = useMediaQuery('(max-width: 1023px)')

	// Get navigation sections for internal app only
	// Filter to show only internal app routes (exclude public routes)
	// React Compiler automatically optimizes this computation
	// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
	const allSections = NavigationService.getNavigationSections(user?.roleLevel)
	const sections = allSections
		.map((section) => ({
			...section,
			routes: section.routes.filter(
				(route) => route.href.startsWith('/app') || route.id === 'profile' || route.id === 'notifications',
			),
		}))
		.filter((section) => section.routes.length > 0)

	// State for collapsible sections
	// React Compiler automatically optimizes this computation
	const initialCollapsed = (() => {
		const collapsed = new Set<string>()
		sections.forEach((section) => {
			if (section.defaultCollapsed) {
				collapsed.add(section.id)
			}
		})
		return collapsed
	})()

	const [collapsedSections, setCollapsedSections] = useState<Set<string>>(initialCollapsed)
	const [settingsModalOpen, setSettingsModalOpen] = useState(false)
	const sidebarRef = useRef<HTMLElement>(null)

	/**
	 * Shared sidebar drawer behavior (MAANG DRY principle)
	 *
	 * Handles all common mobile drawer logic in one place:
	 * - Outside click detection (modal-aware)
	 * - Escape key handling (modal-aware)
	 * - Body scroll lock
	 * - Child state reset on close
	 *
	 * @see useSidebarDrawer for implementation details
	 */
	useSidebarDrawer({
		isOpen,
		isMobile,
		onClose,
		sidebarRef,
		hasOpenModal: settingsModalOpen,
		onSidebarClose: () => setSettingsModalOpen(false),
	})

	// Toggle section collapse
	// React Compiler automatically optimizes this callback
	const toggleSection = (sectionId: string) => {
		setCollapsedSections((prev) => {
			const next = new Set(prev)
			if (next.has(sectionId)) {
				next.delete(sectionId)
			} else {
				next.add(sectionId)
			}
			return next
		})
	}

	// Handle link click - close sidebar on mobile
	// React Compiler automatically optimizes this callback
	const handleLinkClick = () => {
		if (isMobile) {
			onClose()
		}
	}

	/**
	 * Handle user logout with FAANG-level cleanup.
	 *
	 * **Logout Flow (Industry Best Practice):**
	 * 1. Prevent double-logout (check if already logging out)
	 * 2. Set loading state (show user feedback)
	 * 3. Clear auth token from HTTP-only cookies (AuthService.logout)
	 * 4. Clear Zustand auth state (user data, isAuthenticated)
	 * 5. Clear persisted localStorage (Zustand persist middleware)
	 * 6. Log the action for monitoring/analytics
	 * 7. Navigate to home page (SPA-style, no full reload)
	 * 8. Handle errors gracefully (don't leave user in broken state)
	 *
	 * **Why This Approach:**
	 * - Cookie deletion ensures token can't be reused
	 * - State clearing prevents stale data in UI
	 * - localStorage clearing ensures clean state on next login
	 * - Router navigation maintains SPA experience
	 * - Error handling prevents broken logout states
	 * - Logging enables monitoring and debugging
	 *
	 * **Security Considerations:**
	 * - Token deleted from cookies (can't be accessed by JS or sent to server)
	 * - All sensitive data cleared from memory and storage
	 * - User redirected to public page (no lingering in protected routes)
	 *
	 * Used by: Google, Facebook, Stripe, Airbnb, LinkedIn
	 */
	// React Compiler automatically optimizes this async callback
	const handleLogout = async () => {
		// Prevent double-logout
		if (isLoggingOut) {
			logger.warn('Logout already in progress, ignoring duplicate request', {
				component: 'InternalSidebar',
			})
			return
		}

		try {
			// Step 1: Set loading state
			setIsLoggingOut(true)

			logger.info('User logout initiated', {
				userId: user?.id ?? undefined,
				userName: user?.name?.getFullName?.() ?? user?.username,
				component: 'InternalSidebar',
			})

			// Step 2: Delete auth token cookie (server-side session invalidation)
			// This removes the 'at' cookie that stores the JWT token
			logoutService()

			// Step 3: Clear Zustand auth state (client-side state)
			// This sets user to null and isAuthenticated to false
			clearAuthState()

			// Step 4: Clear persisted localStorage
			// Zustand persist middleware stores data in localStorage under 'auth-storage' key
			// We need to clear this to prevent stale data on next login
			try {
				localStorage.removeItem('auth-storage')
				logger.debug('Cleared persisted auth data from localStorage', {
					component: 'InternalSidebar',
				})
			} catch (storageError) {
				// localStorage might be unavailable (private browsing, storage full, etc.)
				logger.warn('Failed to clear localStorage', {
					error: storageError,
					component: 'InternalSidebar',
				})
			}

			logger.info('User logged out successfully', {
				component: 'InternalSidebar',
			})

			// Step 5: Navigate to home page (SPA-style navigation)
			// Use router.push instead of window.location for smooth transition
			// This maintains the SPA experience without full page reload
			router.push(Routes.Home.location)
		} catch (error) {
			// Error handling: Don't leave user in broken state
			logger.error('Logout error occurred', {
				error,
				component: 'InternalSidebar',
			})

			// Even if error occurs, still try to navigate away from protected route
			// This prevents user from being stuck in a broken authenticated state
			try {
				clearAuthState()
				logoutService()
				router.push(Routes.Home.location)
			} catch (fallbackError) {
				// Last resort: Force full page reload to home
				logger.error('Fallback logout failed, forcing reload', {
					error: fallbackError,
					component: 'InternalSidebar',
				})
				window.location.href = Routes.Home.location
			}
		} finally {
			// Always reset loading state
			setIsLoggingOut(false)
		}
	}

	/**
	 * Wrapper for logout to handle promise in onClick handler.
	 * FAANG Pattern: Non-async wrapper for async event handlers.
	 * React Compiler automatically optimizes this callback
	 */
	const handleLogoutClick = () => {
		void handleLogout().catch((error) => {
			// Error already handled in handleLogout, but catch any unhandled rejections
			logger.error('Unhandled logout error', {
				error,
				component: 'InternalSidebar',
				action: 'handleLogoutClick',
			})
		})
	}

	// Desktop: Always render (permanent sidebar)
	// Mobile: Only render when isOpen is true
	const shouldRender = !isMobile || isOpen

	if (!shouldRender) {
		return null
	}

	return (
		<>
			{/* Mobile Backdrop */}
			{isMobile && isOpen && (
				<div
					className='fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden'
					onClick={onClose}
					aria-hidden='true'
				/>
			)}

			{/* Sidebar */}
			<aside
				id='internal-sidebar'
				ref={sidebarRef}
				aria-label='Internal application navigation'
				className={classNames(
					'bg-base-200 border-r border-base-300',
					// Desktop: Fixed position, always visible
					'lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-96',
					// Mobile: Fixed position, drawer style with dynamic viewport height
					// Use h-dvh (dynamic viewport height) to account for mobile browser UI
					'fixed top-0 left-0 h-dvh w-80 z-50',
					'transition-transform duration-300 ease-in-out',
					// Mobile transform (drawer slide)
					{
						'translate-x-0': isOpen || !isMobile,
						'-translate-x-full': !isOpen && isMobile,
					},
				)}>
				<div className='flex flex-col h-full max-h-dvh'>
					{/* Header */}
					<div className='flex items-center justify-between p-6 border-b border-base-300 shrink-0'>
						<Logo
							href={Routes.Home.location}
							showText
							size='sm'
							onClick={handleLinkClick}
							className='group'
						/>

						{/* Mobile: Close button */}
						{isMobile && (
							<Button
								variant='ghost'
								size='sm'
								onClick={onClose}
								aria-label='Close navigation'
								className='btn-circle w-8 h-8 p-0 min-h-0'>
								<X
									size={20}
									aria-hidden='true'
								/>
							</Button>
						)}
					</div>

					{/* Navigation Content - Scrollable with safe area for mobile */}
					<nav className='flex-1 overflow-y-auto p-4 overscroll-contain'>
						{sections.map((section) => (
							<div
								key={section.id}
								className='mb-6'>
								{/* Section Header */}
								<div className='mb-3'>
									{section.collapsible ? (
										<Button
											onClick={() => toggleSection(section.id)}
											variant='ghost'
											className='flex items-center justify-between w-full text-left group h-auto p-0'
											rightIcon={
												<ChevronDown
													size={16}
													className={classNames('text-base-content/40 transition-transform', {
														'rotate-180': !collapsedSections.has(section.id),
													})}
												/>
											}
											contentDrivenHeight>
											<h3 className='text-xs font-semibold uppercase tracking-wider text-base-content/60 group-hover:text-base-content transition-colors'>
												{section.title}
											</h3>
										</Button>
									) : (
										<h3 className='text-xs font-semibold uppercase tracking-wider text-base-content/60'>
											{section.title}
										</h3>
									)}
								</div>

								{/* Section Routes */}
								{!collapsedSections.has(section.id) && (
									<ul className='space-y-1'>
										{section.routes.map((route) => {
											/**
											 * FAANG-Level Active Route Detection
											 *
											 * **Problem:** Simple startsWith() causes multiple routes to be active
											 * Example: "/app" matches both "/app" and "/app/profile"
											 *
											 * **Solution:** Intelligent matching based on route depth
											 * - Root route (/app) → Exact match ONLY
											 * - Nested routes (/app/orders) → Exact OR prefix match for children
											 *
											 * **Test Cases:**
											 * ✅ Dashboard (/app) active only on /app, NOT on /app/profile
											 * ✅ Orders (/app/orders) active on /app/orders AND /app/orders/123
											 * ✅ Profile (/app/profile) active only on /app/profile
											 *
											 * **Edge Cases Handled:**
											 * - Root route collision (Dashboard vs other /app/* routes)
											 * - Nested route children (/app/orders/123 activates /app/orders)
											 * - Exact path matching with trailing slashes
											 *
											 * **Industry Standard:** Used by Vercel, Stripe, Linear, Notion
											 */
											const isActive = (() => {
												// Exact match always wins
												if (pathname === route.href) {
													return true
												}

												// Dashboard (/app) is a special case - EXACT MATCH ONLY
												// This prevents /app from matching /app/profile, /app/orders, etc.
												if (route.href === Routes.Dashboard.location) {
													return false
												}

												// For all other routes, check if current path is a child route
												// Example: /app/orders/123 should activate /app/orders
												// But /app/profile should NOT activate /app
												return pathname.startsWith(`${route.href}/`)
											})()

											return (
												<li key={route.id}>
													<Link
														href={route.href}
														onClick={handleLinkClick}
														className={classNames(
															'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
															'hover:bg-base-300 motion-safe:hover:translate-x-1',
															'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
															{
																'bg-primary/10 text-primary font-medium': isActive,
																'text-base-content': !isActive,
															},
														)}
														aria-current={isActive ? 'page' : undefined}>
														<NavigationIcon
															icon={route.icon}
															className={classNames('w-5 h-5 shrink-0', {
																'text-primary': isActive,
																'text-base-content/70': !isActive,
															})}
														/>
														<span className='text-sm'>{route.label}</span>
														{route.badge && (
															<span className='ml-auto badge badge-sm badge-primary'>
																{route.badge}
															</span>
														)}
													</Link>
												</li>
											)
										})}
									</ul>
								)}
							</div>
						))}
					</nav>

					{/* Footer - Always visible with safe area padding for mobile browsers */}
					<div className='p-4 pb-safe border-t border-base-300 space-y-2 shrink-0 bg-base-200'>
						{isAdmin && (
							<div className='flex items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-2'>
								<div className='min-w-0'>
									<div className='flex items-center gap-2 text-sm font-medium text-base-content'>
										<Shield
											className='h-4 w-4 text-info'
											aria-hidden='true'
										/>
										<span className='truncate'>Admin View</span>
									</div>
									<p className='text-xs text-base-content/60'>Show internal IDs</p>
								</div>
								<Toggle
									id='sidebar-admin-view-toggle'
									variant='info'
									size='sm'
									className='sm:toggle-md'
									checked={isAdminViewActive}
									onChange={(e) => setAdminViewEnabled(e.target.checked)}
									aria-label='Toggle admin view'
								/>
							</div>
						)}

						<Button
							variant='ghost'
							size='sm'
							onClick={() => setSettingsModalOpen(true)}
							disabled={isLoggingOut}
							leftIcon={<Settings className='w-5 h-5' />}
							className='w-full justify-start px-3'>
							Settings
						</Button>

						<Button
							variant={isLoggingOut ? 'error' : 'ghost'}
							size='sm'
							onClick={handleLogoutClick}
							disabled={isLoggingOut}
							loading={isLoggingOut}
							leftIcon={!isLoggingOut ? <LogOut className='w-5 h-5' /> : undefined}
							className={classNames('w-full justify-start px-3', {
								'hover:bg-error/10 hover:text-error': !isLoggingOut,
							})}
							aria-busy={isLoggingOut}>
							{isLoggingOut ? 'Signing Out...' : 'Sign Out'}
						</Button>
					</div>
				</div>
			</aside>

			{/* Settings Modal */}
			<SettingsModal
				isOpen={settingsModalOpen}
				onClose={() => setSettingsModalOpen(false)}
			/>
		</>
	)
}
