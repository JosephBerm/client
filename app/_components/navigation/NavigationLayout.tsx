'use client'

import { useState } from 'react'
import { useAuthStore } from '@_stores/useAuthStore'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface NavigationLayoutProps {
	children: React.ReactNode
}

/**
 * Root navigation layout that wraps all pages
 * Manages Navbar and conditional Sidebar based on authentication state
 */
export default function NavigationLayout({ children }: NavigationLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

	return (
		<>
			<Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
			
			<div className="flex">
				{/* Sidebar - only visible when authenticated */}
				{isAuthenticated && (
					<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
				)}

				{/* Main content */}
				<main className="flex-1 min-h-screen bg-base-100">
					{children}
				</main>
			</div>
		</>
	)
}


