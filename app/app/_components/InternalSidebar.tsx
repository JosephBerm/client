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
 * - Memoized navigation sections
 * - Memoized callbacks
 * - Optimized re-renders
 *
 * @module InternalSidebar
 */

'use client'

import { useEffect, useMemo, useCallback, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Settings, ChevronDown, LogOut, X } from 'lucide-react'
import classNames from 'classnames'
import { useAuthStore } from '@_features/auth'
import { logout as logoutService } from '@_features/auth/services/AuthService'
import { NavigationService, Routes } from '@_features/navigation'
import { useMediaQuery } from '@_shared'
import { logger } from '@_core'
import Button from '@_components/ui/Button'
import NavigationIcon from '@_components/navigation/NavigationIcon'
import SettingsModal from '@_components/settings/SettingsModal'

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

	// Logout loading state
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	// Detect mobile vs desktop
	const isMobile = useMediaQuery('(max-width: 1023px)')

	// Get navigation sections for internal app only
	// Filter to show only internal app routes (exclude public routes)
	const sections = useMemo(() => {
		const allSections = NavigationService.getNavigationSections(user?.role)
		
		// Filter out public routes (Home, About, Store public, Contact)
		// Keep only internal app routes
		return allSections
			.map((section) => ({
				...section,
				routes: section.routes.filter(
					(route) =>
						route.href.startsWith('/app') ||
						route.id === 'profile' ||
						route.id === 'notifications'
				),
			}))
			.filter((section) => section.routes.length > 0)
	}, [user?.role])

	// State for collapsible sections
	const initialCollapsed = useMemo<Set<string>>(() => {
		const collapsed = new Set<string>()
		sections.forEach((section) => {
			if (section.defaultCollapsed) {
				collapsed.add(section.id)
			}
		})
		return collapsed
	}, [sections])

	const [collapsedSections, setCollapsedSections] = useState<Set<string>>(initialCollapsed)
	const [settingsModalOpen, setSettingsModalOpen] = useState(false)
	const sidebarRef = useRef<HTMLElement>(null)

	// Toggle section collapse
	const toggleSection = useCallback((sectionId: string) => {
		setCollapsedSections((prev) => {
			const next = new Set(prev)
			if (next.has(sectionId)) {
				next.delete(sectionId)
			} else {
				next.add(sectionId)
			}
			return next
		})
	}, [])

	// Handle link click - close sidebar on mobile
	const handleLinkClick = useCallback(() => {
		if (isMobile) {
			onClose()
		}
	}, [isMobile, onClose])

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
	const handleLogout = useCallback(async () => {
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
	}, [isLoggingOut, user, clearAuthState, router])

	// Handle Escape key to close on mobile
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen && isMobile) {
				onClose()
			}
		}

		window.addEventListener('keydown', handleEscape)
		return () => window.removeEventListener('keydown', handleEscape)
	}, [isOpen, isMobile, onClose])

	// Handle outside click on mobile
	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			if (
				isMobile &&
				isOpen &&
				sidebarRef.current &&
				!sidebarRef.current.contains(e.target as Node)
			) {
				onClose()
			}
		}

		if (isOpen && isMobile) {
			// Slight delay to prevent immediate closing
			const timeoutId = setTimeout(() => {
				document.addEventListener('mousedown', handleOutsideClick)
			}, 100)

			return () => {
				clearTimeout(timeoutId)
				document.removeEventListener('mousedown', handleOutsideClick)
			}
		}
	}, [isOpen, isMobile, onClose])

	// Body scroll lock on mobile
	useEffect(() => {
		if (isOpen && isMobile) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen, isMobile])

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
					className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden"
					onClick={onClose}
					aria-hidden="true"
				/>
			)}

		{/* Sidebar */}
		<aside
			id="internal-sidebar"
			ref={sidebarRef}
			aria-label="Internal application navigation"
			className={classNames(
					'bg-base-200 border-r border-base-300 overflow-y-auto',
					// Desktop: Fixed position, always visible
					'lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-96',
					// Mobile: Fixed position, drawer style
					'fixed top-0 left-0 h-screen w-80 z-50',
					'transition-transform duration-300 ease-in-out',
					// Mobile transform (drawer slide)
					{
						'translate-x-0': isOpen || !isMobile,
						'-translate-x-full': !isOpen && isMobile,
					}
				)}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-base-300 shrink-0">
						<Link
							href={Routes.Home.location}
							className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
							onClick={handleLinkClick}
						>
							<div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-content font-bold group-hover:scale-105 transition-transform">
								M
							</div>
							<h2 className="text-xl font-semibold text-base-content">
								MedSource
							</h2>
						</Link>

					{/* Mobile: Close button */}
					{isMobile && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							aria-label="Close navigation"
							className="btn-circle w-8 h-8 p-0 min-h-0"
						>
							<X size={20} aria-hidden="true" />
						</Button>
					)}
					</div>

					{/* Navigation Content */}
					<nav className="flex-1 overflow-y-auto p-4">
						{sections.map((section) => (
							<div key={section.id} className="mb-6">
								{/* Section Header */}
								<div className="mb-3">
									{section.collapsible ? (
										<button
											onClick={() => toggleSection(section.id)}
											className="flex items-center justify-between w-full text-left group"
										>
											<h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/60 group-hover:text-base-content transition-colors">
												{section.title}
											</h3>
											<ChevronDown
												size={16}
												className={classNames(
													'text-base-content/40 transition-transform',
													{
														'rotate-180': !collapsedSections.has(section.id),
													}
												)}
											/>
										</button>
									) : (
										<h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
											{section.title}
										</h3>
									)}
								</div>

								{/* Section Routes */}
								{!collapsedSections.has(section.id) && (
									<ul className="space-y-1">
										{section.routes.map((route) => {
											const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`)

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
															}
														)}
														aria-current={isActive ? 'page' : undefined}
													>
														<NavigationIcon
															icon={route.icon}
															className={classNames('w-5 h-5 shrink-0', {
																'text-primary': isActive,
																'text-base-content/70': !isActive,
															})}
														/>
														<span className="text-sm">{route.label}</span>
														{route.badge && (
															<span className="ml-auto badge badge-sm badge-primary">
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

				{/* Footer */}
				<div className="p-4 border-t border-base-300 space-y-2 shrink-0">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSettingsModalOpen(true)}
						disabled={isLoggingOut}
						leftIcon={<Settings className="w-5 h-5" />}
						className="w-full justify-start px-3"
					>
						Settings
					</Button>

					<Button
						variant={isLoggingOut ? 'error' : 'ghost'}
						size="sm"
						onClick={handleLogout}
						disabled={isLoggingOut}
						loading={isLoggingOut}
						leftIcon={!isLoggingOut ? <LogOut className="w-5 h-5" /> : undefined}
						className={classNames('w-full justify-start px-3', {
							'hover:bg-error/10 hover:text-error': !isLoggingOut,
						})}
						aria-busy={isLoggingOut}
					>
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

