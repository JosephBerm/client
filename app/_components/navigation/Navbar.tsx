'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, ShoppingCart, User, LogIn } from 'lucide-react'
import { useAuthStore } from '@_stores/useAuthStore'
import { useUserSettingsStore } from '@_stores/useUserSettingsStore'

interface NavbarProps {
	onMenuClick: () => void
}

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
				{/* Burger menu for mobile */}
				{isAuthenticated && (
					<button
						className="btn btn-ghost btn-square lg:hidden"
						onClick={onMenuClick}
						aria-label="Open menu"
					>
						<Menu className="w-6 h-6" />
					</button>
				)}

				{/* Logo */}
				<Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
					<span className="hidden sm:inline">MedSource Pro</span>
					<span className="sm:hidden">MSP</span>
				</Link>
			</div>

			{/* Search bar - center on desktop */}
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

			{/* Right side actions */}
			<div className="navbar-end gap-2">
				{/* Mobile search button */}
				<button className="btn btn-ghost btn-square md:hidden" aria-label="Search">
					<Search className="w-5 h-5" />
				</button>

				{/* Cart */}
				<Link href="/cart" className="btn btn-ghost btn-square relative">
					<ShoppingCart className="w-5 h-5" />
					{cartItemCount > 0 && (
						<span className="badge badge-primary badge-sm absolute -top-1 -right-1">
							{cartItemCount}
						</span>
					)}
				</Link>

				{/* User menu or Login button */}
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
								<span className="text-xs">
									{user?.username || 'User'}
								</span>
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


