'use client'

import { useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/public/big-logo.png'
import { useAuthStore } from '@_stores/useAuthStore'
import Routes from '@_services/routes'
import { PublicRouteType } from '@_classes/Enums'
import IRoute from '@_types/Route'
import {
	Home,
	ShoppingBag,
	FileText,
	Users,
	UserCircle,
	BarChart3,
	Building2,
	IdCard,
	X,
} from 'lucide-react'

interface SidebarProps {
	isOpen: boolean
	onClose: () => void
}

// Map FontAwesome icons to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	'fa-solid fa-house': Home,
	'fa-solid fa-truck': ShoppingBag,
	'fa-solid fa-store': ShoppingBag,
	'fa-solid fa-list-check': FileText,
	'fa-solid fa-hand-holding-dollar': Building2,
	'fa-solid fa-id-badge': IdCard,
	'fa-solid fa-users': Users,
	'fa-solid fa-chart-line': BarChart3,
	'fa-solid fa-user': UserCircle,
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
	const router = useRouter()
	const pathname = usePathname()
	const { user } = useAuthStore()

	const filteredRoutes = useMemo(() => {
		return Routes.internalRoutes.filter((route) => {
			if (!route.accessible?.length) return true
			if (!user?.role) return false
			return route.accessible.includes(user.role)
		})
	}, [user?.role])

	const handleRouteClick = (route: IRoute) => {
		router.push(route.location)
		onClose()
	}

	const getIcon = (iconClass?: string) => {
		if (!iconClass) return Home
		return iconMap[iconClass] || Home
	}

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<div
					className='fixed inset-0 bg-black/50 z-40 lg:hidden'
					onClick={onClose}
					aria-hidden='true'
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-full w-64 bg-base-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
					isOpen ? 'translate-x-0' : '-translate-x-full'
				}`}>
				<div className='flex flex-col h-full'>
					{/* Header */}
					<div className='flex items-center justify-between p-4 border-b border-base-300'>
						<Link
							href={Routes.getPublicRouteByValue(PublicRouteType.Home).location}
							onClick={onClose}
							className='flex items-center'>
							<Image priority src={Logo} alt='MedSource Pro Logo' width={120} height={40} className='h-10 w-auto' />
						</Link>
						<button
							className='btn btn-ghost btn-sm btn-circle lg:hidden'
							onClick={onClose}
							aria-label='Close sidebar'>
							<X className='h-5 w-5' />
						</button>
					</div>

					{/* Navigation */}
					<nav className='flex-1 overflow-y-auto p-4'>
						<ul className='menu menu-vertical w-full gap-1'>
							{filteredRoutes.map((route, index) => {
								const Icon = getIcon(route.icon)
								const isActive = pathname === route.location || pathname.startsWith(route.location + '/')

								return (
									<li key={index}>
										<button
											className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
												isActive
													? 'bg-primary text-primary-content'
													: 'hover:bg-base-300 text-base-content'
											}`}
											onClick={() => handleRouteClick(route)}>
											<Icon className='h-5 w-5' />
											<span>{route.name}</span>
										</button>
									</li>
								)
							})}
						</ul>
					</nav>

					{/* Footer */}
					<div className='p-4 border-t border-base-300'>
						<button
							className='btn btn-ghost w-full justify-start'
							onClick={() => {
								useAuthStore.getState().logout()
								router.push('/')
								onClose()
							}}>
							<UserCircle className='h-5 w-5' />
							Logout
						</button>
					</div>
				</div>
			</aside>
		</>
	)
}

