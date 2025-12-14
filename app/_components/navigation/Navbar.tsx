/**
 * Navbar Component
 *
 * Beautiful, modern navigation bar for the MedSource Pro application.
 * Mobile-first responsive design with clean aesthetics matching the brand.
 *
 * **Features:**
 * - Mobile-first responsive design
 * - Hamburger menu for mobile navigation (all users on public routes)
 * - Sticky positioning (always visible)
 * - Brand logo with medical cross icon
 * - Clean navigation links: Home, About Us, Store, Contact (always visible)
 * - Shopping cart with item count badge
 * - Login button or user menu based on authentication
 * - Accessible and semantic HTML
 * - No internal sidebar on public routes (public navigation via mobile menu)
 * - Internal sidebar only in /app/* routes (via InternalAppShell)
 *
 * **Navigation Links (Always Visible):**
 * - Home (/)
 * - About Us (/about-us)
 * - Store (/store)
 * - Contact (/contact)
 * - Cart (/cart)
 * - Login: Opens modal via login button (no dedicated route)
 *
 * **FAANG-Level UX Design:**
 * - Public navigation links are always visible regardless of authentication state
 * - Follows industry best practices (Amazon, Google, Netflix) for consistent navigation
 * - Navigation is contextual to route type: public routes show public nav, internal routes show internal nav
 * - Authenticated users can access dashboard via user menu or dashboard link in mobile menu
 * - Ensures discoverability and maintains consistent user experience
 *
 * **Mobile Behavior (< 768px):**
 * - Public routes: Shows hamburger menu with public navigation links (all users)
 * - Authenticated users: Additional "Dashboard" link in public mobile menu
 * - Internal routes (/app/*): Shows sidebar menu button (handled by InternalAppShell)
 * - Navigation links visible in navbar on desktop, accessible via mobile menu on public routes
 *
 * **Desktop Behavior (>= 768px):**
 * - Full horizontal navigation with all public links always visible
 * - Public routes: Navbar only (no sidebar)
 * - Internal routes (/app/*): InternalAppShell with InternalSidebar (no public Navbar)
 * - Spacious, clean layout
 *
 * @module Navbar
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { getCookie } from 'cookies-next'
import { Menu, ShoppingCart, X, User, LogOut, Home, Info, Store, Mail, Settings, LayoutDashboard } from 'lucide-react'

import { useAuthStore, logout as logoutService } from '@_features/auth'
import { useHydratedCart } from '@_features/cart'
import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { useMediaQuery, AUTH_COOKIE_NAME } from '@_shared'

import LoginModal from '@_components/auth/LoginModal'
import SettingsModal from '@_components/settings/SettingsModal'
import Button from '@_components/ui/Button'
import Logo from '@_components/ui/Logo'

/**
 * Navbar component props interface.
 */
interface NavbarProps {
	/**
	 * Optional callback for menu click (opens sidebar for internal routes /app/*).
	 * Only provided by InternalAppShell for internal routes.
	 * Public routes don't have a sidebar, so this will be undefined.
	 */
	onMenuClick?: () => void
}

/**
 * Navbar Component
 *
 * Clean, modern navigation bar with mobile-first responsive design.
 * Features a medical cross logo, navigation links, shopping cart, and authentication.
 *
 * @param props - Component props including optional onMenuClick
 * @returns Navbar component
 */
export default function Navbar({ onMenuClick }: NavbarProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [settingsModalOpen, setSettingsModalOpen] = useState(false)
	const [loginModalOpen, setLoginModalOpen] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	// Use hydration-aware cart hook to prevent SSR mismatch
	const { itemCount: cartItemCount } = useHydratedCart()
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)
	const clearAuthState = useAuthStore((state) => state.logout)

	/**
	 * Extract search param values to stable variables for dependency tracking.
	 * Next.js 15 best practice: Extract specific values from searchParams to prevent infinite loops.
	 * ReadOnlyURLSearchParams object reference changes, but values are stable.
	 */
	const loginParamValue = searchParams.get('login')
	const redirectToValue = searchParams.get('redirectTo')
	const hasLoginParam = loginParamValue === 'true'

	/**
	 * Memoized URL cleanup function to avoid recreating on every render.
	 * FAANG pattern: Reusable utility functions for URL state management.
	 */
	const cleanupLoginParams = useCallback(() => {
		// Read current searchParams directly for maximum reliability
		// This ensures we always work with the latest URL state (FAANG best practice)
		const currentParams = new URLSearchParams(searchParams.toString())
		const hadLogin = currentParams.has('login')
		const hadRedirectTo = currentParams.has('redirectTo')
		
		if (hadLogin || hadRedirectTo) {
			currentParams.delete('login')
			currentParams.delete('redirectTo')
			const cleanUrl = window.location.pathname + (currentParams.toString() ? `?${currentParams.toString()}` : '')
			router.replace(cleanUrl)
		}
	}, [searchParams, router])

	/**
	 * Handle login query parameter with FAANG-level authentication logic.
	 *
	 * **FAANG Best Practices:**
	 * - Uses Next.js useSearchParams() for React-friendly URL state management
	 * - Checks both cookie token AND auth state (handles race conditions)
	 * - Only opens modal if user is NOT authenticated (no token AND not authenticated)
	 * - Cleans up URL if user IS authenticated but `?login=true` is present
	 * - Uses router.replace() to avoid polluting browser history
	 * - Prevents duplicate modal opens with ref guard
	 * - Memoized dependencies to prevent infinite loops
	 *
	 * **Why check both cookie and state:**
	 * - Cookie check: Immediate, available before AuthInitializer runs
	 * - State check: Validated token, user data loaded
	 * - Both must fail for user to be considered unauthenticated
	 *
	 * **URL State Management (FAANG Pattern):**
	 * - URL params drive UI state (shareable, bookmarkable)
	 * - Clean URL on state changes (no stale params)
	 * - History-friendly (replace, not push)
	 */
	const loginParamHandledRef = useRef(false)
	
	useEffect(() => {
		if (!hasLoginParam) {
			loginParamHandledRef.current = false
			return // No login param, nothing to do
		}

		// Prevent duplicate handling if already processed
		// FAANG pattern: Ref guard prevents unnecessary re-execution
		if (loginParamHandledRef.current) {
			return
		}

		// Check for token in cookies (immediate check, available before AuthInitializer runs)
		const token = getCookie(AUTH_COOKIE_NAME)
		const hasToken = !!token

		// User is authenticated if they have a token OR auth state says so
		// This handles race conditions where token exists but state hasn't updated yet
		const isUserAuthenticated = hasToken || isAuthenticated

		if (isUserAuthenticated) {
			// User is already authenticated - clean up URL by removing login param
			// FAANG pattern: Clean URL state when it no longer matches application state
			cleanupLoginParams()
			loginParamHandledRef.current = true
		} else {
			// User is not authenticated - open login modal
			// FAANG pattern: URL param drives UI state
			// Ref guard ensures we only open once per URL param change
			setLoginModalOpen(true)
			loginParamHandledRef.current = true
		}
	}, [hasLoginParam, isAuthenticated, cleanupLoginParams])

	// Detect when screen size changes to desktop (md breakpoint: 768px)
	// The mobile menu is only rendered on screens smaller than md (md:hidden)
	// This matches Tailwind's 'md' breakpoint used in className="md:hidden"
	const isDesktop = useMediaQuery('(min-width: 768px)')

	// Keyboard handlers for backdrop overlays
	const handleMobileMenuBackdropKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		// Keyboard support for backdrop (Enter or Space to close)
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			setMobileMenuOpen(false)
		}
	}, [])

	const handleUserMenuBackdropKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		// Keyboard support for backdrop (Enter or Space to close)
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			setUserMenuOpen(false)
		}
	}, [])
	const prevIsDesktop = useRef(isDesktop)

	// Close mobile menu when screen size changes to desktop
	// This prevents the menu from remaining open when resizing from mobile to desktop and back
	// Only closes when transitioning from mobile to desktop (not on initial mount or when already desktop)
	useEffect(() => {
		// Only close if we transitioned from mobile to desktop AND menu is currently open
		if (isDesktop && !prevIsDesktop.current && mobileMenuOpen) {
			setMobileMenuOpen(false)
		}
		// Update ref to track current breakpoint state
		prevIsDesktop.current = isDesktop
	}, [isDesktop, mobileMenuOpen])

	const publicNavigationLinks = [
		{
			name: 'Home',
			href: Routes.Home.location,
			icon: Home,
			description: 'Welcome to MedSource Pro',
		},
		{
			name: 'About Us',
			href: Routes.AboutUs.location,
			icon: Info,
			description: 'Learn about our mission and values',
		},
		{
			name: 'Store',
			href: Routes.Store.location,
			icon: Store,
			description: 'Browse medical supplies and equipment',
		},
		{
			name: 'Contact',
			href: Routes.Contact.location,
			icon: Mail,
			description: 'Get in touch with our team',
		},
	]

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
	 * 7. Navigate to home page with login modal (SPA-style, no full reload)
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
	 * Matches InternalSidebar implementation for consistency.
	 */
	// eslint-disable-next-line @typescript-eslint/require-await
	const handleLogout = useCallback(async () => {
		// Prevent double-logout
		if (isLoggingOut) {
			logger.warn('Logout already in progress, ignoring duplicate request', {
				component: 'Navbar',
			})
			return
		}

		try {
			// Step 1: Set loading state
			setIsLoggingOut(true)
			
			logger.info('User logout initiated', {
				userId: user?.id ?? undefined,
				userName: user?.name?.getFullName?.() ?? user?.username,
				component: 'Navbar',
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
					component: 'Navbar',
				})
			} catch (storageError) {
				// localStorage might be unavailable (private browsing, storage full, etc.)
				logger.warn('Failed to clear localStorage', {
					error: storageError,
					component: 'Navbar',
				})
			}

			logger.info('User logged out successfully', {
				component: 'Navbar',
			})

			// Step 5: Navigate to home page with login modal (SPA-style navigation)
			// Use router.push instead of window.location for smooth transition
			// This maintains the SPA experience without full page reload
			router.push(Routes.openLoginModal())
			
		} catch (error) {
			// Error handling: Don't leave user in broken state
			logger.error('Logout error occurred', {
				error,
				component: 'Navbar',
			})

			// Even if error occurs, still try to navigate away from protected route
			// This prevents user from being stuck in a broken authenticated state
			try {
				clearAuthState()
				logoutService()
				router.push(Routes.openLoginModal())
			} catch (fallbackError) {
				// Last resort: Force full page reload to home
				logger.error('Fallback logout failed, forcing reload', {
					error: fallbackError,
					component: 'Navbar',
				})
				window.location.href = Routes.Home.location
			}
		} finally {
			// Always reset loading state
			setIsLoggingOut(false)
			// Close user menu after logout
			setUserMenuOpen(false)
		}
	}, [isLoggingOut, user, clearAuthState, router])

	/**
	 * Wrapper for logout to handle promise in onClick handler.
	 * FAANG Pattern: Non-async wrapper for async event handlers.
	 */
	const handleLogoutClick = useCallback(() => {
		void handleLogout().catch((error) => {
			// Error already handled in handleLogout, but catch any unhandled rejections
			logger.error('Unhandled logout error', {
				error,
				component: 'Navbar',
				action: 'handleLogoutClick',
			})
		})
	}, [handleLogout])

	return (
		<>
			<header className='sticky top-0 z-50 border-b border-base-300 bg-base-100/95 shadow-md backdrop-blur-lg'>
				<nav className='mx-auto flex h-24 max-w-screen-2xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 max-[275px]:overflow-x-auto'>
					{/* Left Section: Mobile Menu Button + Logo */}
					<div className='flex shrink-0 items-center gap-4'>
						{/* Mobile Menu Button (for public navigation) - All users on public routes */}
						{/* Note: Sidebar only exists in /app/* routes (InternalAppShell), not on public routes */}
						{/* So authenticated users on public routes get the same mobile menu as unauthenticated users */}
						{!onMenuClick && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="text-base-content md:hidden p-2.5! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:ring-0 origin-center transition-transform duration-200 ease-out motion-safe:hover:scale-[1.02] active:scale-95"
								aria-label='Toggle menu'>
								{mobileMenuOpen ? <X className='h-7 w-7' /> : <Menu className='h-7 w-7' />}
							</Button>
						)}

						{/* Sidebar Menu Button (only for internal routes /app/* via InternalAppShell) */}
						{/* This should never appear on public routes since onMenuClick won't be provided */}
						{/* Only show when center navigation links are hidden (mobile < 768px) */}
						{onMenuClick && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onMenuClick}
								className="hover:scale-105 text-base-content md:hidden p-2.5! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:ring-0"
								aria-label='Open sidebar menu'>
								<Menu className='h-7 w-7' />
							</Button>
						)}

						{/* Logo */}
						<Logo
							href={Routes.Home.location}
							showText
							size="lg"
							hideTextOnMobile
						/>
					</div>

					{/* Center: Desktop Navigation Links (always visible for all users) */}
					{/* 
				FAANG-Level UX: Public navigation should always be accessible regardless of auth state.
				This follows industry best practices (Amazon, Google, Netflix) where navigation remains
				consistent. Authenticated users have additional routes via Sidebar, but public routes
				(Home, About, Store, Contact) should always be accessible for discoverability and UX consistency.
			*/}
					<div className='hidden flex-1 items-center justify-center gap-6 md:flex lg:gap-8 xl:gap-12 2xl:gap-16'>
						{publicNavigationLinks.map((link) => (
							<Link
								key={link.name}
								href={link.href}
								className='whitespace-nowrap text-base font-medium text-base-content transition-all hover:scale-105 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'>
								{link.name}
							</Link>
						))}
					</div>

					{/* Right Side: Cart, Settings (desktop), Login/User Menu, Mobile Menu */}
					<div className='flex shrink-0 items-center gap-2'>
						{/* Shopping Cart */}
						<Link
							href={Routes.Cart.location}
							className='relative flex items-center justify-center rounded-lg p-2.5 text-base-content transition-all hover:scale-105 hover:bg-base-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
							aria-label='Shopping cart'>
							<ShoppingCart className='h-7 w-7' />
							{cartItemCount > 0 && (
								<span className='absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white'>
									{cartItemCount}
								</span>
							)}
						</Link>

						{/* Settings Button - Desktop Only
							- Authenticated users: Show on lg+ (when sidebar is hidden)
							- Unauthenticated users: Show on md+ (when mobile menu is hidden)
							Industry best practice: Settings button placed next to user/profile button for easy access */}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSettingsModalOpen(true)}
							className={`hover:scale-105 hover:text-primary text-base-content p-2.5! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:ring-0 ${
								isAuthenticated
									? 'hidden lg:flex' // Authenticated: only on lg+ when sidebar is hidden
									: 'hidden md:flex' // Unauthenticated: on md+ when mobile menu is hidden
							}`}
							aria-label='Settings'
							title='Settings'>
							<Settings className='h-7 w-7' />
						</Button>

						{/* Authentication: Login Button or User Menu */}
						{isAuthenticated ? (
							<div className='relative'>
								<Button
									variant="ghost"
									size="sm"
									contentDrivenHeight
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="bg-transparent hover:scale-105 text-base-content gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:ring-0"
									aria-label='User menu'>
									{user?.profilePicturePath ? (
										<Image
											src={user.profilePicturePath}
											alt={user.username ?? 'User'}
											width={36}
											height={36}
											className='h-9 w-9 rounded-full border border-base-300 object-cover'
											priority={false}
											loading='lazy'
										/>
									) : (
										<div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white'>
											<User className='h-5 w-5' />
										</div>
									)}
								</Button>

								{/* User Dropdown Menu */}
								{userMenuOpen && (
									<div className='absolute right-0 top-full mt-2 w-60 rounded-lg border border-base-300 bg-base-100 shadow-lg'>
										<div className='flex flex-col gap-1 border-b border-base-300 px-5 py-4'>
											<p className='text-lg font-semibold text-base-content'>
												{user?.username ?? 'User'}
											</p>
											<p className='text-sm text-base-content/70'>{user?.email}</p>
										</div>
										<div className='flex flex-col gap-1 py-2'>
											<Link
												href={Routes.Profile.location}
												onClick={() => setUserMenuOpen(false)}
												className='flex items-center px-5 py-3 text-base text-base-content transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary'>
												Profile
											</Link>
											<Link
												href={Routes.Dashboard.location}
												onClick={() => setUserMenuOpen(false)}
												className='flex items-center px-5 py-3 text-base text-base-content transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary'>
												Dashboard
											</Link>
											<Button
												variant="ghost"
												fullWidth
												onClick={() => {
													setUserMenuOpen(false)
													setSettingsModalOpen(true)
												}}
												leftIcon={<Settings className='h-5 w-5' />}
												className="justify-start text-base-content px-5 py-3 gap-3 focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-0">
												Settings
											</Button>
										</div>
										<div className='flex flex-col border-t border-base-300 py-2'>
											<Button
												variant={isLoggingOut ? 'error' : 'ghost'}
												fullWidth
												onClick={handleLogoutClick}
												disabled={isLoggingOut}
												loading={isLoggingOut}
												leftIcon={!isLoggingOut ? <LogOut className='h-5 w-5' /> : undefined}
												className="justify-start text-error hover:bg-error/10 hover:text-error focus-visible:outline-2 focus-visible:outline-error focus-visible:ring-0 px-5 py-3 gap-3"
												aria-busy={isLoggingOut}>
												{isLoggingOut ? 'Signing Out...' : 'Logout'}
											</Button>
										</div>
									</div>
								)}
							</div>
						) : (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setLoginModalOpen(true)}
								className="hover:scale-105 hover:text-primary text-base-content p-2.5! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:ring-0"
								aria-label='Login to your account'>
								<User className='h-7 w-7' />
							</Button>
						)}
					</div>
				</nav>
			</header>

			{/* Mobile Menu (public navigation for all users on public routes) */}
			{/* Industry best practice: Public navigation should be accessible to all users regardless of auth state */}
			{mobileMenuOpen && !onMenuClick && (
				<div className='fixed inset-0 z-40 md:hidden'>
					{/* Backdrop */}
					<div
						className='fixed inset-0 bg-black/30 transition-opacity'
						onClick={() => setMobileMenuOpen(false)}
						onKeyDown={handleMobileMenuBackdropKeyDown}
						role='button'
						tabIndex={-1}
						aria-label='Close menu'
					/>

					{/* Menu Panel - Slides from left */}
					<div className='fixed left-0 top-24 h-[calc(100vh-6rem)] w-72 bg-base-100 shadow-2xl transition-transform'>
						{/* Menu Header with Settings */}
						<div className='flex items-center justify-between border-b border-base-300 px-6 py-4'>
							<h2 className='text-xl font-semibold text-base-content'>Menu</h2>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSettingsModalOpen(true)}
								className="btn-circle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:ring-0"
								aria-label='Settings'
								title='Settings'>
								<Settings className='h-5 w-5' />
							</Button>
						</div>

						{/* Navigation Links */}
						<nav className='flex flex-col gap-2 overflow-y-auto p-6'>
							{/* Public Navigation Links - Always visible for all users */}
							{publicNavigationLinks.map((link) => {
								const Icon = link.icon
								return (
									<Link
										key={link.name}
										href={link.href}
										onClick={() => setMobileMenuOpen(false)}
										className='flex items-start gap-3 rounded-lg px-5 py-4 transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'>
										<Icon className='mt-0.5 h-6 w-6 shrink-0 text-primary' />
										<div className='flex flex-1 flex-col gap-1'>
											<span className='text-base font-semibold text-base-content'>
												{link.name}
											</span>
											<span className='text-sm text-base-content/70'>{link.description}</span>
										</div>
									</Link>
								)
							})}

							{/* Dashboard Link - Only for authenticated users */}
							{/* Industry best practice: Provide easy access to dashboard from public navigation */}
							{isAuthenticated && (
								<>
									<div className='my-2 border-t border-base-300' />
									<Link
										href={Routes.Dashboard.location}
										onClick={() => setMobileMenuOpen(false)}
										className='flex items-start gap-3 rounded-lg px-5 py-4 transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'>
										<LayoutDashboard className='mt-0.5 h-6 w-6 shrink-0 text-primary' />
										<div className='flex flex-1 flex-col gap-1'>
											<span className='text-base font-semibold text-base-content'>
												Dashboard
											</span>
											<span className='text-sm text-base-content/70'>Access your dashboard and account</span>
										</div>
									</Link>
								</>
							)}
						</nav>
					</div>
				</div>
			)}

			{/* Click outside to close user menu */}
			{userMenuOpen && (
				<div
					className='fixed inset-0 z-30'
					onClick={() => setUserMenuOpen(false)}
					onKeyDown={handleUserMenuBackdropKeyDown}
					role='button'
					tabIndex={-1}
					aria-label='Close user menu'
				/>
			)}

			{/* Settings Modal */}
			<SettingsModal
				isOpen={settingsModalOpen}
				onClose={() => setSettingsModalOpen(false)}
				defaultSectionId='general'
			/>

			{/* Login Modal */}
			{/* 
			 * Post-Auth Redirect is now handled centrally by AuthRedirectService in useAuthModal.
			 * The onLoginSuccess callback here only handles UI cleanup (closing modal, resetting refs).
			 * Navigation logic lives in useAuthModal.handleAuthSuccess → executePostAuthRedirect().
			 * 
			 * MAANG Pattern: Single source of truth for redirect logic.
			 */}
			<LoginModal
				isOpen={loginModalOpen}
				onClose={() => {
					setLoginModalOpen(false)
					loginParamHandledRef.current = false
					// Remove login query param when closing (FAANG pattern: sync URL with UI state)
					cleanupLoginParams()
				}}
				onLoginSuccess={() => {
					setLoginModalOpen(false)
					loginParamHandledRef.current = false
					
					// Remove login query param on successful login (FAANG pattern: clean URL after state change)
					// Note: Navigation is handled by useAuthModal via AuthRedirectService
					cleanupLoginParams()
				}}
			/>
		</>
	)
}
