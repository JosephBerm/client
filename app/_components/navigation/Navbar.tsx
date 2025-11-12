/**
 * Navbar Component
 *
 * Main navigation bar for the MedSource Pro application.
 * Provides site-wide navigation, search, shopping cart, and user menu.
 * Sticky positioned at the top of the page with responsive design.
 *
 * **Features:**
 * - Responsive design (mobile + desktop layouts)
 * - Sticky positioning (always visible)
 * - Mobile menu burger button (authenticated users only)
 * - Brand logo with link to home
 * - Product search bar (desktop) / search button (mobile)
 * - Shopping cart with item count badge
 * - User authentication dropdown menu
 * - Login button for unauthenticated users
 * - Profile picture support
 * - Logout functionality
 *
 * **Authentication States:**
 * - Unauthenticated: Shows login button
 * - Authenticated: Shows menu button (mobile), user avatar/menu, cart
 *
 * **Layout Structure:**
 * - navbar-start: Burger menu + Logo
 * - navbar-center: Search bar (desktop only)
 * - navbar-end: Search button (mobile), Cart, User menu/Login
 *
 * **Use Cases:**
 * - Main site navigation
 * - User account access
 * - Product search
 * - Shopping cart access
 * - Mobile menu toggle
 *
 * @example
 * ```tsx
 * import Navbar from '@_components/navigation/Navbar';
 * import { useState } from 'react';
 *
 * function Layout({ children }) {
 *   const [sidebarOpen, setSidebarOpen] = useState(false);
 *
 *   return (
 *     <div>
 *       <Navbar onMenuClick={() => setSidebarOpen(true)} />
 *       <main>{children}</main>
 *     </div>
 *   );
 * }
 * ```
 *
 * @module Navbar
 */

'use client'

import Link from 'next/link'
import { Menu, Search, ShoppingCart, User, LogIn } from 'lucide-react'
import { useAuthStore } from '@_stores/useAuthStore'
import { useUserSettingsStore } from '@_stores/useUserSettingsStore'

/**
 * Navbar component props interface.
 */
interface NavbarProps {
	/**
	 * Callback fired when the mobile menu button is clicked.
	 * Used to toggle the sidebar drawer on mobile devices.
	 */
	onMenuClick: () => void
}

/**
 * Navbar Component
 *
 * Top navigation bar with authentication-aware features.
 * Integrates with auth and user settings stores for dynamic content.
 *
 * **Mobile Behavior (< 1024px):**
 * - Shows burger menu button (authenticated only)
 * - Logo text abbreviated to "MSP"
 * - Search bar hidden (shows button instead)
 * - Compact cart and user icons
 *
 * **Desktop Behavior (>= 1024px):**
 * - Burger menu hidden (sidebar always visible)
 * - Full "MedSource Pro" logo
 * - Centered search bar
 * - Full cart and user menu dropdowns
 *
 * **User Menu (Authenticated):**
 * - Profile link
 * - Notifications link
 * - Logout button (red text)
 *
 * **Cart Badge:**
 * - Displays total item quantity
 * - Only visible when cart has items
 * - Updates reactively from user settings store
 *
 * @param props - Component props including onMenuClick
 * @returns Navbar component
 */
export default function Navbar({ onMenuClick }: NavbarProps) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)
	const cart = useUserSettingsStore((state) => state.cart)

	const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

	return (
		<header className="sticky top-0 z-50 border-b border-brand-1/10 bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur">
			<div className="mx-auto flex h-[var(--nav-height)] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10">
				<div className="flex items-center gap-4">
				{isAuthenticated && (
					<button
							className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-1/20 bg-white text-brand-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--soft-brand-color)] lg:hidden"
						onClick={onMenuClick}
							aria-label="Open navigation"
					>
							<Menu className="h-5 w-5" />
					</button>
				)}

					<Link
						href="/"
						className="inline-flex items-baseline gap-2 text-lg font-extrabold uppercase tracking-[0.35em] text-brand-4 transition hover:text-brand-2"
					>
						<span className="hidden text-base sm:inline">MedSource</span>
						<span className="text-brand-1 sm:text-brand-3">Pro</span>
				</Link>
			</div>

				<div className="hidden flex-1 justify-center md:flex">
					<div className="relative w-full max-w-xl">
						<Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-3/70" />
						<input
							type="search"
							placeholder="Search products, orders, or providers"
							className="w-full rounded-full border border-brand-1/15 bg-white/80 py-3 pl-12 pr-32 text-sm text-brand-4 shadow-inner shadow-brand-1/5 transition focus:border-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3/20"
						/>
						<button
							type="button"
							className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-brand-4 px-6 py-2 text-sm font-semibold text-white shadow-md shadow-brand-5/20 transition hover:bg-brand-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-3"
						>
							<span>Search</span>
						</button>
				</div>
			</div>

				<div className="flex items-center gap-2 md:gap-3">
					<button
						className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-brand-4 transition hover:bg-[var(--soft-brand-color)] md:hidden"
						aria-label="Open search"
					>
						<Search className="h-5 w-5" />
				</button>

					<Link
						href="/cart"
						className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-1/15 text-brand-4 transition hover:-translate-y-0.5 hover:border-brand-3 hover:text-brand-3"
						aria-label="View cart"
					>
						<ShoppingCart className="h-5 w-5" />
					{cartItemCount > 0 && (
							<span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-4 px-1 text-[0.65rem] font-semibold text-white">
							{cartItemCount}
						</span>
					)}
				</Link>

				{isAuthenticated ? (
					<div className="dropdown dropdown-end">
						<button
							tabIndex={0}
								className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-1/15 bg-white text-brand-4 transition hover:-translate-y-0.5 hover:border-brand-3"
							aria-label="User menu"
						>
							{user?.profilePicturePath ? (
									<div className="h-10 w-10 overflow-hidden rounded-full border border-brand-1/15">
									<img
										src={user.profilePicturePath}
											alt={user.username || 'User avatar'}
											className="h-full w-full object-cover"
									/>
								</div>
							) : (
									<User className="h-5 w-5" />
							)}
						</button>
							<ul className="dropdown-content menu mt-3 w-60 rounded-2xl border border-brand-1/15 bg-white/95 p-3 text-sm text-brand-4 shadow-2xl shadow-brand-5/15 backdrop-blur">
								<li className="mb-1 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-3">
									{user?.username || 'User'}
							</li>
							<li>
									<Link href="/medsource-app/profile" className="rounded-lg px-3 py-2 hover:bg-[var(--soft-brand-color)]">
										Profile
									</Link>
							</li>
							<li>
									<Link href="/medsource-app/notifications" className="rounded-lg px-3 py-2 hover:bg-[var(--soft-brand-color)]">
										Notifications
									</Link>
							</li>
							<li>
								<button
									onClick={() => {
										useAuthStore.getState().logout()
										window.location.href = '/login'
									}}
										className="mt-2 w-full rounded-lg px-3 py-2 text-left font-semibold text-error hover:bg-error/10"
								>
									Logout
								</button>
							</li>
						</ul>
					</div>
				) : (
						<Link
							href="/login"
							className="inline-flex items-center gap-2 rounded-full border border-brand-1/20 bg-brand-4 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-5/20 transition hover:-translate-y-0.5 hover:bg-brand-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-3"
						>
							<LogIn className="h-4 w-4" />
						<span className="hidden md:inline">Login</span>
							<span className="md:hidden">Sign in</span>
					</Link>
				)}
				</div>
			</div>
		</header>
	)
}
