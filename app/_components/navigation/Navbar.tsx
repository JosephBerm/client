/**
 * Navbar Component
 *
 * Beautiful, modern navigation bar for the MedSource Pro application.
 * Mobile-first responsive design with clean aesthetics matching the brand.
 *
 * **Features:**
 * - Mobile-first responsive design
 * - Hamburger menu for mobile navigation
 * - Sticky positioning (always visible)
 * - Brand logo with medical cross icon
 * - Clean navigation links: Home, About Us, Store, Contact
 * - Shopping cart with item count badge
 * - Login button or user menu based on authentication
 * - Accessible and semantic HTML
 * - Integration with sidebar for authenticated users
 *
 * **Navigation Links:**
 * - Home (/)
 * - About Us (/about-us)
 * - Store (/store)
 * - Contact (/contact)
 * - Cart (/cart)
 * - Login: Opens modal via login button (no dedicated route)
 *
 * **Mobile Behavior (< 768px):**
 * - Shows hamburger menu button
 * - Navigation links hidden in mobile menu
 * - Compact layout with essential elements
 *
 * **Desktop Behavior (>= 768px):**
 * - Full horizontal navigation
 * - All links visible in navbar
 * - Spacious, clean layout
 *
 * @module Navbar
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, ShoppingCart, X, User, LogOut, Home, Info, Store, Mail, Settings } from 'lucide-react'
import { useCartStore } from '@_features/cart'
import { useAuthStore } from '@_features/auth'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Routes } from '@_features/navigation'
import SettingsModal from '@_components/settings/SettingsModal'
import LoginModal from '@_components/auth/LoginModal'
import { useMediaQuery } from '@_shared'

/**
 * Navbar component props interface.
 */
interface NavbarProps {
	/**
	 * Optional callback for menu click (opens sidebar for authenticated users).
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
	const cart = useCartStore((state) => state.cart)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)

	// Check for login query param and open modal automatically
	useEffect(() => {
		const shouldOpenLogin = searchParams.get('login') === 'true'
		if (shouldOpenLogin && !isAuthenticated) {
			setLoginModalOpen(true)
		}
	}, [searchParams, isAuthenticated])

	// Detect when screen size changes to desktop (md breakpoint: 768px)
	// The mobile menu is only rendered on screens smaller than md (md:hidden)
	// This matches Tailwind's 'md' breakpoint used in className="md:hidden"
	const isDesktop = useMediaQuery('(min-width: 768px)')
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

	const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

	// Shared settings button styling - DRY pattern
	const settingsButtonClassName = "flex items-center justify-center rounded-lg p-2.5 text-base-content transition-all hover:scale-105 hover:bg-base-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"

	const publicNavigationLinks = [
		{ 
			name: 'Home', 
			href: Routes.Home.location, 
			icon: Home,
			description: 'Welcome to MedSource Pro'
		},
		{ 
			name: 'About Us', 
			href: Routes.AboutUs.location, 
			icon: Info,
			description: 'Learn about our mission and values'
		},
		{ 
			name: 'Store', 
			href: Routes.Store.location, 
			icon: Store,
			description: 'Browse medical supplies and equipment'
		},
		{ 
			name: 'Contact', 
			href: Routes.Contact.location, 
			icon: Mail,
			description: 'Get in touch with our team'
		},
	]

	const handleLogout = () => {
		useAuthStore.getState().logout()
		// Redirect to home with login modal query param
		router.push(Routes.openLoginModal())
	}

	return (
		<>
		<header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/95 shadow-md backdrop-blur-lg">
			<nav className="mx-auto flex h-24 max-w-screen-2xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 max-[275px]:overflow-x-auto">
			{/* Left Section: Mobile Menu Button + Logo */}
			<div className="flex shrink-0 items-center gap-4">
				{/* Mobile Menu Button (for public navigation) - Moved to left */}
				{!isAuthenticated && (
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="flex items-center justify-center rounded-lg p-2.5 text-base-content transition-all hover:scale-105 hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? (
							<X className="h-7 w-7" />
						) : (
							<Menu className="h-7 w-7" />
						)}
					</button>
				)}

				{/* Sidebar Menu Button (authenticated users on mobile) */}
				{isAuthenticated && onMenuClick && (
					<button
						onClick={onMenuClick}
						className="flex items-center justify-center rounded-lg p-2.5 text-base-content transition-all hover:scale-105 hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
						aria-label="Open sidebar menu"
					>
						<Menu className="h-7 w-7" />
					</button>
				)}

				{/* Logo */}
				<Link
					href={Routes.Home.location}
					className="flex items-center gap-3 transition-opacity hover:opacity-80"
				>
						<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
							<svg
								className="h-7 w-7 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2.5}
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</div>
					<span className="text-2xl font-bold uppercase tracking-wide text-primary max-[480px]:hidden">
						MedSource
					</span>
					</Link>
					</div>

			{/* Center: Desktop Navigation Links (public routes only when not authenticated) */}
			{!isAuthenticated && (
			<div className="hidden flex-1 items-center justify-center gap-6 md:flex lg:gap-8 xl:gap-12 2xl:gap-16">
					{publicNavigationLinks.map((link) => (
						<Link
							key={link.name}
							href={link.href}
							className="whitespace-nowrap text-base font-medium text-base-content transition-all hover:scale-105 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
						>
							{link.name}
						</Link>
					))}
					</div>
					)}

			{/* Right Side: Cart, Settings (desktop), Login/User Menu, Mobile Menu */}
			<div className="flex shrink-0 items-center gap-2">
					{/* Shopping Cart */}
					<Link
						href={Routes.Cart.location}
						className="relative flex items-center justify-center rounded-lg p-2.5 text-base-content transition-all hover:scale-105 hover:bg-base-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						aria-label="Shopping cart"
					>
						<ShoppingCart className="h-7 w-7" />
						{cartItemCount > 0 && (
							<span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
								{cartItemCount}
							</span>
						)}
						</Link>

						{/* Settings Button - Desktop Only
							- Authenticated users: Show on lg+ (when sidebar is hidden)
							- Unauthenticated users: Show on md+ (when mobile menu is hidden)
							Industry best practice: Settings button placed next to user/profile button for easy access */}
						<button
							onClick={() => setSettingsModalOpen(true)}
							className={`${settingsButtonClassName} ${
								isAuthenticated 
									? 'hidden lg:flex' // Authenticated: only on lg+ when sidebar is hidden
									: 'hidden md:flex' // Unauthenticated: on md+ when mobile menu is hidden
							}`}
							aria-label="Settings"
							title="Settings"
						>
							<Settings className="h-7 w-7" />
						</button>

						{/* Authentication: Login Button or User Menu */}
						{isAuthenticated ? (
							<div className="relative">
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="flex items-center justify-center gap-2 rounded-lg p-2.5 text-base-content transition-all hover:scale-105 hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
									aria-label="User menu"
								>
								{user?.profilePicturePath ? (
									<Image
										src={user.profilePicturePath}
										alt={user.username || 'User'}
										width={36}
										height={36}
										className="h-9 w-9 rounded-full border border-base-300 object-cover"
										priority={false}
										loading="lazy"
									/>
								) : (
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
										<User className="h-5 w-5" />
									</div>
								)}
								</button>

								{/* User Dropdown Menu */}
								{userMenuOpen && (
								<div className="absolute right-0 top-full mt-2 w-60 rounded-lg border border-base-300 bg-base-100 shadow-lg">
									<div className="flex flex-col gap-1 border-b border-base-300 px-5 py-4">
										<p className="text-lg font-semibold text-base-content">
											{user?.username || 'User'}
										</p>
										<p className="text-sm text-base-content/70">{user?.email}</p>
									</div>
									<div className="flex flex-col gap-1 py-2">
										<Link
											href={Routes.Profile.location}
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center px-5 py-3 text-base text-base-content transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary"
										>
											Profile
										</Link>
										<Link
											href={Routes.Dashboard.location}
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center px-5 py-3 text-base text-base-content transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary"
										>
											Dashboard
										</Link>
										<button
											onClick={() => {
												setUserMenuOpen(false)
												setSettingsModalOpen(true)
											}}
											className="flex w-full items-center gap-3 px-5 py-3 text-base text-base-content transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary"
										>
											<Settings className="h-5 w-5" />
											<span>Settings</span>
										</button>
									</div>
									<div className="flex flex-col border-t border-base-300 py-2">
										<button
											onClick={handleLogout}
											className="flex w-full items-center gap-3 px-5 py-3 text-base text-red-600 transition-all hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"
										>
											<LogOut className="h-5 w-5" />
											<span>Logout</span>
										</button>
									</div>
								</div>
								)}
							</div>
				) : (
				<button
					onClick={() => setLoginModalOpen(true)}
					className="flex items-center justify-center rounded-lg p-2.5 text-base-content transition-all hover:scale-105 hover:bg-base-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					aria-label="Login to your account"
				>
						<User className="h-7 w-7" />
					</button>
					)}
				</div>
				</nav>
			</header>

			{/* Mobile Menu (public navigation for non-authenticated users) */}
			{mobileMenuOpen && !isAuthenticated && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/30 transition-opacity"
						onClick={() => setMobileMenuOpen(false)}
					/>

				{/* Menu Panel - Slides from left */}
				<div className="fixed left-0 top-24 h-[calc(100vh-6rem)] w-72 bg-base-100 shadow-2xl transition-transform">
					{/* Menu Header with Settings */}
					<div className="flex items-center justify-between border-b border-base-300 px-6 py-4">
						<h2 className="text-xl font-semibold text-base-content">Menu</h2>
						<button
							onClick={() => setSettingsModalOpen(true)}
							className="btn-circle ghost"
							aria-label="Settings"
							title="Settings"
						>
							<Settings className="h-5 w-5" />
						</button>
					</div>

					{/* Navigation Links */}
					<nav className="flex flex-col gap-2 overflow-y-auto p-6">
						{publicNavigationLinks.map((link) => {
							const Icon = link.icon
							return (
								<Link
									key={link.name}
									href={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className="flex items-start gap-3 rounded-lg px-5 py-4 transition-all hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								>
									<Icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
									<div className="flex flex-1 flex-col gap-1">
										<span className="text-base font-semibold text-base-content">{link.name}</span>
										<span className="text-sm text-base-content/70">{link.description}</span>
									</div>
								</Link>
							)
						})}
					</nav>
					</div>
				</div>
			)}

			{/* Click outside to close user menu */}
			{userMenuOpen && (
				<div
					className="fixed inset-0 z-30"
					onClick={() => setUserMenuOpen(false)}
				/>
			)}

			{/* Settings Modal */}
			<SettingsModal
				isOpen={settingsModalOpen}
				onClose={() => setSettingsModalOpen(false)}
				defaultSectionId="general"
			/>

			{/* Login Modal */}
			<LoginModal
				isOpen={loginModalOpen}
				onClose={() => {
					setLoginModalOpen(false)
					// Remove login query param when closing
					if (searchParams.get('login') === 'true') {
						const url = new URL(window.location.href)
						url.searchParams.delete('login')
						router.replace(url.pathname + url.search)
					}
				}}
				onLoginSuccess={() => {
					setLoginModalOpen(false)
					// Remove login query param on successful login
					if (searchParams.get('login') === 'true') {
						const url = new URL(window.location.href)
						url.searchParams.delete('login')
						router.replace(url.pathname + url.search)
					}
				}}
			/>
		</>
	)
}
