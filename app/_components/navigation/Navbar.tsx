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
import { Menu, ShoppingCart, X, User, LogOut } from 'lucide-react'
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
	const cart = useUserSettingsStore((state) => state.cart)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)

	const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

	const publicNavigationLinks = [
		{ name: 'Home', href: Routes.Home.location },
		{ name: 'About Us', href: Routes.AboutUs.location },
		{ name: 'Store', href: Routes.Store.location },
		{ name: 'Contact', href: Routes.Contact.location },
	]

	const handleLogout = () => {
		useAuthStore.getState().logout()
		window.location.href = '/login'
	}

	return (
		<>
			<header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md">
				<nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					{/* Left Section: Sidebar Button (authenticated) + Logo */}
					<div className="flex items-center gap-3">
						{/* Sidebar Menu Button (authenticated users on mobile) */}
						{isAuthenticated && onMenuClick && (
							<button
								onClick={onMenuClick}
								className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
								aria-label="Open sidebar menu"
							>
								<Menu className="h-6 w-6" />
							</button>
						)}

						{/* Logo */}
						<Link
							href={Routes.Home.location}
							className="flex items-center gap-2 transition-opacity hover:opacity-80"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--brand-color-1)]">
								<svg
									className="h-6 w-6 text-white"
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
							<span className="text-xl font-bold uppercase tracking-wide text-[var(--brand-color-1)]">
								MedSource
							</span>
						</Link>
					</div>

					{/* Center: Desktop Navigation Links (public routes only when not authenticated) */}
					{!isAuthenticated && (
						<div className="hidden items-center gap-8 md:flex">
							{publicNavigationLinks.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									className="text-base font-medium text-gray-700 transition-colors hover:text-[var(--brand-color-1)]"
								>
									{link.name}
								</Link>
							))}
						</div>
					)}

					{/* Right Side: Cart, Login/User Menu, Mobile Menu */}
					<div className="flex items-center gap-2">
						{/* Shopping Cart */}
						<Link
							href={Routes.Cart.location}
							className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-[var(--brand-color-1)]"
							aria-label="Shopping cart"
						>
							<ShoppingCart className="h-6 w-6" />
							{cartItemCount > 0 && (
								<span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--brand-color-1)] px-1 text-xs font-semibold text-white">
									{cartItemCount}
								</span>
							)}
						</Link>

						{/* Authentication: Login Button or User Menu */}
						{isAuthenticated ? (
							<div className="relative">
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="flex items-center gap-2 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
									aria-label="User menu"
								>
									{user?.profilePicturePath ? (
										<img
											src={user.profilePicturePath}
											alt={user.username || 'User'}
											className="h-8 w-8 rounded-full border border-gray-200 object-cover"
										/>
									) : (
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-color-1)] text-white">
											<User className="h-5 w-5" />
										</div>
									)}
								</button>

								{/* User Dropdown Menu */}
								{userMenuOpen && (
									<div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
										<div className="border-b border-gray-100 px-4 py-3">
											<p className="text-sm font-semibold text-gray-900">
												{user?.username || 'User'}
											</p>
											<p className="text-xs text-gray-500">{user?.email}</p>
										</div>
										<div className="py-2">
											<Link
												href={Routes.Profile.location}
												onClick={() => setUserMenuOpen(false)}
												className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
											>
												Profile
											</Link>
											<Link
												href={Routes.Dashboard.location}
												onClick={() => setUserMenuOpen(false)}
												className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
											>
												Dashboard
											</Link>
										</div>
										<div className="border-t border-gray-100 py-2">
											<button
												onClick={handleLogout}
												className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
											>
												<LogOut className="h-4 w-4" />
												<span>Logout</span>
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<Link
								href={Routes.Login.location}
								className="rounded-md bg-[var(--brand-color-1)] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--brand-color-2)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-color-1)]"
							>
								Login
							</Link>
						)}

						{/* Mobile Menu Button (for public navigation) */}
						{!isAuthenticated && (
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
								aria-label="Toggle menu"
							>
								{mobileMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
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
						className="fixed inset-0 bg-black/20 backdrop-blur-sm"
						onClick={() => setMobileMenuOpen(false)}
					/>

					{/* Menu Panel */}
					<div className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white shadow-xl">
						<nav className="flex flex-col gap-1 p-4">
							{publicNavigationLinks.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-[var(--soft-brand-color)] hover:text-[var(--brand-color-1)]"
								>
									{link.name}
								</Link>
							))}
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
		</>
	)
}
