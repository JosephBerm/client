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

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
	const pathname = usePathname()
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)
	const cart = useUserSettingsStore((state) => state.cart)
	const [searchOpen, setSearchOpen] = useState(false)

	const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

	return (
		<header className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4 md:px-8">
			<div className="navbar-start">
				{isAuthenticated && (
					<button
						className="btn btn-ghost btn-square lg:hidden"
						onClick={onMenuClick}
						aria-label="Open menu"
					>
						<Menu className="w-6 h-6" />
					</button>
				)}

				<Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
					<span className="hidden sm:inline">MedSource Pro</span>
					<span className="sm:hidden">MSP</span>
				</Link>
			</div>

			<div className="navbar-center hidden md:flex flex-1 max-w-md mx-4">
				<div className="form-control w-full">
					<div className="input-group">
						<input
							type="text"
							placeholder="Search products..."
							className="input input-bordered w-full"
							onFocus={() => setSearchOpen(true)}
							onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
						/>
						<button className="btn btn-square btn-primary">
							<Search className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>

			<div className="navbar-end gap-2">
				<button className="btn btn-ghost btn-square md:hidden" aria-label="Search">
					<Search className="w-5 h-5" />
				</button>

				<Link href="/cart" className="btn btn-ghost btn-square relative">
					<ShoppingCart className="w-5 h-5" />
					{cartItemCount > 0 && (
						<span className="badge badge-primary badge-sm absolute -top-1 -right-1">
							{cartItemCount}
						</span>
					)}
				</Link>

				{isAuthenticated ? (
					<div className="dropdown dropdown-end">
						<button
							tabIndex={0}
							className="btn btn-ghost btn-square avatar"
							aria-label="User menu"
						>
							{user?.profilePicturePath ? (
								<div className="w-10 rounded-full">
									<img
										src={user.profilePicturePath}
										alt={user.username || 'User'}
									/>
								</div>
							) : (
								<User className="w-5 h-5" />
							)}
						</button>
						<ul
							tabIndex={0}
							className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-3 border border-base-300"
						>
							<li className="menu-title">
								<span className="text-xs">{user?.username || 'User'}</span>
							</li>
							<li>
								<Link href="/medsource-app/profile">Profile</Link>
							</li>
							<li>
								<Link href="/medsource-app/notifications">Notifications</Link>
							</li>
							<div className="divider my-0"></div>
							<li>
								<button
									onClick={() => {
										useAuthStore.getState().logout()
										window.location.href = '/login'
									}}
									className="text-error"
								>
									Logout
								</button>
							</li>
						</ul>
					</div>
				) : (
					<Link href="/login" className="btn btn-primary btn-sm">
						<LogIn className="w-4 h-4 md:mr-2" />
						<span className="hidden md:inline">Login</span>
					</Link>
				)}
			</div>
		</header>
	)
}


