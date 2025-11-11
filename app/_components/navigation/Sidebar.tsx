/**
 * Sidebar Component
 *
 * Collapsible sidebar navigation menu with role-based access control.
 * Displays navigation sections and items based on user permissions.
 * Responsive design with drawer overlay on mobile and persistent sidebar on desktop.
 *
 * **Features:**
 * - Role-based navigation (uses NavigationService)
 * - Collapsible navigation sections with expand/collapse
 * - Active route highlighting
 * - Mobile drawer with overlay
 * - Desktop sticky sidebar
 * - Click-outside-to-close on mobile
 * - Section badges (notification counts, etc.)
 * - Smooth animations
 * - App version display in footer
 *
 * **Responsive Behavior:**
 * - Mobile (< 1024px): Fixed drawer overlay, closes on item click or outside click
 * - Desktop (>= 1024px): Sticky sidebar, always visible when authenticated
 *
 * **Use Cases:**
 * - Main application navigation
 * - Admin panel menu
 * - Protected route navigation
 * - Role-based feature access
 *
 * @example
 * ```tsx
 * import Sidebar from '@_components/navigation/Sidebar';
 * import { useState } from 'react';
 *
 * function AppLayout() {
 *   const [sidebarOpen, setSidebarOpen] = useState(false);
 *
 *   return (
 *     <div>
 *       <Navbar onMenuClick={() => setSidebarOpen(true)} />
 *       <Sidebar
 *         isOpen={sidebarOpen}
 *         onClose={() => setSidebarOpen(false)}
 *       />
 *       <main>{children}</main>
 *     </div>
 *   );
 * }
 * ```
 *
 * @module Sidebar
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@_stores/useAuthStore'
import { getNavigationSections } from '@_services/NavigationService'
import { useState } from 'react'
import classNames from 'classnames'

/**
 * Sidebar component props interface.
 */
interface SidebarProps {
	/**
	 * Whether the sidebar is open (mobile drawer).
	 * On desktop, sidebar is always visible when authenticated.
	 */
	isOpen: boolean

	/**
	 * Callback to close the sidebar.
	 * Used primarily for mobile drawer.
	 */
	onClose: () => void
}

/**
 * Sidebar Component
 *
 * Dynamic navigation sidebar that adapts to user role and device size.
 * Fetches navigation structure from NavigationService based on user permissions.
 *
 * **Navigation Structure:**
 * - Sections: Top-level categories (Dashboard, Store, Orders, etc.)
 * - Items: Individual links within sections
 * - Badges: Optional notification counts or indicators
 *
 * **Mobile Drawer:**
 * - Fixed positioning with transform animation
 * - Dark overlay backdrop
 * - Close button in header
 * - Closes on item click or outside click
 *
 * **Desktop Sidebar:**
 * - Sticky positioning below navbar
 * - Always visible when authenticated
 * - No close button or overlay
 *
 * **Section Collapsing:**
 * - Click section header to toggle expand/collapse
 * - All sections expanded by default
 * - Chevron icon indicates state
 *
 * **Active Route:**
 * - Highlights current page
 * - Primary background color
 * - Bold font weight
 *
 * @param props - Component props including isOpen and onClose
 * @returns Sidebar component
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
	const pathname = usePathname()
	const user = useAuthStore((state) => state.user)
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

	const sections = getNavigationSections(user?.role)

	useEffect(() => {
		const expanded: Record<string, boolean> = {}
		sections.forEach((section) => {
			expanded[section.title] = true
		})
		setExpandedSections(expanded)
	}, [sections])

	const toggleSection = (title: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[title]: !prev[title],
		}))
	}

	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			const sidebar = document.getElementById('app-sidebar')
			if (sidebar && !sidebar.contains(e.target as Node) && isOpen) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleOutsideClick)
		}

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
		}
	}, [isOpen, onClose])

	return (
		<>
			{isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

			<aside
				id="app-sidebar"
				className={classNames(
					'fixed top-0 left-0 h-full w-72 bg-base-200 z-50 transform transition-transform duration-300 ease-in-out',
					'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
					{
						'translate-x-0': isOpen,
						'-translate-x-full': !isOpen,
					}
				)}
			>
				<div className="flex items-center justify-between p-4 border-b border-base-300 lg:hidden">
					<h2 className="text-xl font-bold text-primary">Menu</h2>
					<button onClick={onClose} className="btn btn-ghost btn-square btn-sm" aria-label="Close menu">
						<X className="w-5 h-5" />
					</button>
				</div>

				<nav className="overflow-y-auto h-full p-4 pb-20">
					<ul className="menu menu-compact">
						{sections.map((section) => (
							<li key={section.title} className="mb-2">
								<button
									onClick={() => toggleSection(section.title)}
									className="menu-title flex items-center justify-between w-full p-2 hover:bg-base-300 rounded-lg"
								>
									<span className="text-xs font-semibold uppercase text-base-content/70">
										{section.title}
									</span>
									{expandedSections[section.title] ? (
										<ChevronDown className="w-4 h-4" />
									) : (
										<ChevronRight className="w-4 h-4" />
									)}
								</button>

								{expandedSections[section.title] && (
									<ul className="mt-1">
										{section.items.map((item) => {
											const Icon = item.icon
											const isActive = pathname === item.href

											return (
												<li key={item.href}>
													<Link
														href={item.href}
														className={classNames(
															'flex items-center gap-3 p-3 rounded-lg transition-colors',
															{
																'bg-primary text-primary-content font-semibold':
																	isActive,
																'hover:bg-base-300': !isActive,
															}
														)}
														onClick={() => {
															if (window.innerWidth < 1024) {
																onClose()
															}
														}}
													>
														<Icon className="w-5 h-5" />
														<span className="flex-1">{item.title}</span>
														{item.badge && (
															<span className="badge badge-primary badge-sm">
																{item.badge}
															</span>
														)}
													</Link>
												</li>
											)
										})}
									</ul>
								)}
							</li>
						))}
					</ul>
				</nav>

				<div className="absolute bottom-0 left-0 right-0 p-4 bg-base-200 border-t border-base-300">
					<div className="text-xs text-center text-base-content/60">
						<p className="font-semibold">MedSource Pro</p>
						<p>v1.0.0</p>
					</div>
				</div>
			</aside>
		</>
	)
}
