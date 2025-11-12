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
 * - Login (/login)
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
import { Menu, ShoppingCart, X, User, LogOut, Home, Info, Store, Mail, Settings } from 'lucide-react'
import { useUserSettingsStore } from '@_stores/useUserSettingsStore'
import { useAuthStore } from '@_stores/useAuthStore'
import { useState } from 'react'
import Routes from '@_services/routes'

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
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [settingsModalOpen, setSettingsModalOpen] = useState(false)
	const cart = useUserSettingsStore((state) => state.cart)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)

	const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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
		window.location.href = '/login'
	}

	return (
		<>
		<header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-md backdrop-blur-lg">
			<nav className="mx-auto flex h-24 max-w-screen-2xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
			{/* Left Section: Mobile Menu Button + Logo */}
			<div className="flex shrink-0 items-center gap-4">
				{/* Mobile Menu Button (for public navigation) - Moved to left */}
				{!isAuthenticated && (
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="flex items-center justify-center rounded-lg p-2.5 text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color-1)] md:hidden"
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
						className="flex items-center justify-center rounded-lg p-2.5 text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color-1)] lg:hidden"
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
						<div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--brand-color-1)]">
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
					<span className="text-3xl font-bold uppercase tracking-wide text-[var(--brand-color-1)]">
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
							className="text-xl font-medium text-gray-700 transition-all hover:scale-105 hover:text-[var(--brand-color-1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-color-1)]"
						>
							{link.name}
						</Link>
					))}
					</div>
					)}

			{/* Right Side: Cart, Login/User Menu, Mobile Menu */}
			<div className="flex shrink-0 items-center gap-4">
					{/* Shopping Cart */}
					<Link
						href={Routes.Cart.location}
						className="relative flex items-center justify-center rounded-lg p-2.5 text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 hover:text-[var(--brand-color-1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color-1)]"
						aria-label="Shopping cart"
					>
						<ShoppingCart className="h-7 w-7" />
						{cartItemCount > 0 && (
							<span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[var(--brand-color-1)] px-1.5 text-sm font-semibold text-white">
								{cartItemCount}
							</span>
						)}
						</Link>

						{/* Authentication: Login Button or User Menu */}
						{isAuthenticated ? (
							<div className="relative">
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="flex items-center justify-center gap-2 rounded-lg p-2.5 text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color-1)]"
									aria-label="User menu"
								>
								{user?.profilePicturePath ? (
									<img
										src={user.profilePicturePath}
										alt={user.username || 'User'}
										className="h-9 w-9 rounded-full border border-gray-200 object-cover"
									/>
								) : (
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-color-1)] text-white">
										<User className="h-5 w-5" />
									</div>
								)}
								</button>

								{/* User Dropdown Menu */}
								{userMenuOpen && (
								<div className="absolute right-0 top-full mt-2 w-60 rounded-lg border border-gray-200 bg-white shadow-lg">
									<div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4">
										<p className="text-base font-semibold text-gray-900">
											{user?.username || 'User'}
										</p>
										<p className="text-sm text-gray-500">{user?.email}</p>
									</div>
									<div className="flex flex-col gap-1 py-2">
										<Link
											href={Routes.Profile.location}
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center px-5 py-3 text-base text-gray-700 transition-all hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[var(--brand-color-1)]"
										>
											Profile
										</Link>
										<Link
											href={Routes.Dashboard.location}
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center px-5 py-3 text-base text-gray-700 transition-all hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[var(--brand-color-1)]"
										>
											Dashboard
										</Link>
									</div>
									<div className="flex flex-col border-t border-gray-100 py-2">
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
				<Link
					href={Routes.Login.location}
					className="flex items-center justify-center rounded-lg p-2.5 text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 hover:text-[var(--brand-color-1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color-1)]"
					aria-label="Login to your account"
				>
						<User className="h-7 w-7" />
					</Link>
					)}
				</div>
				</nav>
			</header>

			{/* Mobile Menu (public navigation for non-authenticated users) */}
			{mobileMenuOpen && !isAuthenticated && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
						onClick={() => setMobileMenuOpen(false)}
					/>

				{/* Menu Panel - Slides from left */}
				<div className="fixed left-0 top-24 h-[calc(100vh-6rem)] w-72 bg-white shadow-2xl transition-transform">
					{/* Menu Header with Settings */}
					<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
						<h2 className="text-xl font-bold text-gray-900">Menu</h2>
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
									className="flex items-start gap-3 rounded-lg px-5 py-4 transition-all hover:bg-[var(--soft-brand-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color-1)]"
								>
									<Icon className="mt-0.5 h-6 w-6 shrink-0 text-[var(--brand-color-1)]" />
									<div className="flex flex-1 flex-col gap-1">
										<span className="text-lg font-medium text-gray-900">{link.name}</span>
										<span className="text-sm text-gray-600">{link.description}</span>
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
			{settingsModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/50"
						onClick={() => setSettingsModalOpen(false)}
					/>
					
					{/* Modal Content */}
					<div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
						{/* Header */}
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-2xl font-bold text-gray-900">Settings</h2>
							<button
								onClick={() => setSettingsModalOpen(false)}
								className="btn-circle ghost"
								aria-label="Close settings"
								title="Close"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Settings Content */}
						<div className="space-y-6">
							{/* Theme Selection */}
							<div>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-600">
									Appearance
								</h3>
								<p className="text-sm text-gray-500 mb-2">Choose your preferred theme</p>
								<div className="space-y-2">
									<button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-[var(--brand-color-1)] hover:bg-[var(--soft-brand-color)]">
										<div className="h-4 w-4 rounded-full border-2 border-[var(--brand-color-1)]"></div>
										<span className="font-medium">Light Mode</span>
									</button>
									<button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-[var(--brand-color-1)] hover:bg-[var(--soft-brand-color)]">
										<div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
										<span className="font-medium">Dark Mode</span>
									</button>
								</div>
							</div>

							{/* Language (Future) */}
							<div>
								<h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-600">
									Language
								</h3>
								<p className="text-sm text-gray-500">Coming soon...</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
