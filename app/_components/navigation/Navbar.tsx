'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/public/big-logo.png'
import { useAuthStore } from '@_stores/useAuthStore'
import { useCartStore } from '@_stores/store'
import Routes from '@_services/routes'
import { PublicRouteType } from '@_classes/Enums'
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react'

interface NavbarProps {
	onMenuClick?: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
	const router = useRouter()
	const pathname = usePathname()
	const { isAuthenticated, user } = useAuthStore()
	const cart = useCartStore((state) => state.Cart)
	const [searchOpen, setSearchOpen] = useState(false)
	const [searchText, setSearchText] = useState('')

	const cartItemsQuantity = cart.reduce((total, item) => total + item.quantity, 0)

	const handleSearch = () => {
		if (!searchText.trim()) {
			router.push(Routes.Store.location)
		} else {
			router.push(`${Routes.Store.location}?search=${encodeURIComponent(searchText)}`)
		}
		setSearchOpen(false)
		setSearchText('')
	}

	const handleEnterLogin = () => {
		if (isAuthenticated) {
			router.push(Routes.InternalAppRoute)
		} else {
			router.push(Routes.Login.location)
		}
	}

	// Don't show navbar on login/signup pages
	const isAuthPage = pathname.includes('login') || pathname.includes('signup')
	if (isAuthPage) return null

	return (
		<header className='navbar bg-base-100 shadow-lg sticky top-0 z-50'>
			<div className='navbar-start'>
				{/* Logo */}
				<Link
					href={Routes.getPublicRouteByValue(PublicRouteType.Home).location}
					className='btn btn-ghost normal-case text-xl'>
					<Image priority src={Logo} alt='MedSource Pro Logo' width={120} height={40} className='h-10 w-auto' />
				</Link>

				{/* Mobile menu button - only show if authenticated */}
				{isAuthenticated && onMenuClick && (
					<button className='btn btn-ghost lg:hidden' onClick={onMenuClick} aria-label='Toggle sidebar'>
						<Menu className='h-6 w-6' />
					</button>
				)}
			</div>

			{/* Center - Search bar (desktop) */}
			<div className='navbar-center hidden md:flex'>
				<div className='form-control'>
					<div className='input-group'>
						<input
							type='text'
							placeholder='Search products...'
							className='input input-bordered w-full max-w-xs'
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						/>
						<button className='btn btn-square' onClick={handleSearch} aria-label='Search'>
							<Search className='h-5 w-5' />
						</button>
					</div>
				</div>
			</div>

			{/* Right side - Actions */}
			<div className='navbar-end gap-2'>
				{/* Mobile search toggle */}
				<button
					className='btn btn-ghost btn-circle md:hidden'
					onClick={() => setSearchOpen(!searchOpen)}
					aria-label='Toggle search'>
					{searchOpen ? <X className='h-6 w-6' /> : <Search className='h-6 w-6' />}
				</button>

				{/* Cart */}
				<Link href='/cart' className='btn btn-ghost btn-circle relative'>
					<ShoppingCart className='h-6 w-6' />
					{cartItemsQuantity > 0 && (
						<span className='badge badge-error badge-sm absolute -top-1 -right-1'>
							{cartItemsQuantity}
						</span>
					)}
				</Link>

				{/* User/Login */}
				{isAuthenticated ? (
					<div className='dropdown dropdown-end'>
						<label tabIndex={0} className='btn btn-ghost btn-circle avatar'>
							<div className='w-10 rounded-full bg-primary text-primary-content flex items-center justify-center'>
								<User className='h-6 w-6' />
							</div>
						</label>
						<ul
							tabIndex={0}
							className='dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300'>
							<li>
								<Link href={`${Routes.InternalAppRoute}/profile`}>Profile</Link>
							</li>
							<li>
								<button onClick={() => router.push(Routes.InternalAppRoute)}>Dashboard</button>
							</li>
							<li>
								<button onClick={() => useAuthStore.getState().logout()}>Logout</button>
							</li>
						</ul>
					</div>
				) : (
					<button className='btn btn-primary' onClick={handleEnterLogin}>
						Login
					</button>
				)}
			</div>

			{/* Mobile search bar */}
			{searchOpen && (
				<div className='absolute top-full left-0 right-0 bg-base-100 border-t border-base-300 p-4 md:hidden'>
					<div className='flex gap-2'>
						<input
							type='text'
							placeholder='Search products...'
							className='input input-bordered flex-1'
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
							autoFocus
						/>
						<button className='btn btn-primary' onClick={handleSearch}>
							<Search className='h-5 w-5' />
						</button>
					</div>
				</div>
			)}
		</header>
	)
}

