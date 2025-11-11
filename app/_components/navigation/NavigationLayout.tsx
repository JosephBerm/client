'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@_stores/useAuthStore'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface NavigationLayoutProps {
	children: React.ReactNode
}

export default function NavigationLayout({ children }: NavigationLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const pathname = usePathname()

	// Close sidebar when route changes (mobile)
	useEffect(() => {
		setSidebarOpen(false)
	}, [pathname])

	// Close sidebar on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && sidebarOpen) {
				setSidebarOpen(false)
			}
		}
		window.addEventListener('keydown', handleEscape)
		return () => window.removeEventListener('keydown', handleEscape)
	}, [sidebarOpen])

	return (
		<div className='min-h-screen bg-base-100'>
			<Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
			{isAuthenticated && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
			<main
				className={`transition-all duration-300 ${
					isAuthenticated ? 'lg:ml-64' : ''
				}`}>
				{children}
			</main>
		</div>
	)
}

