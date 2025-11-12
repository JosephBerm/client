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

	/**
	 * Accessible name for the navigation landmark.
	 */
	ariaLabel?: string
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
export default function Sidebar({ isOpen, onClose, ariaLabel }: SidebarProps) {
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
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
					onClick={onClose}
					aria-hidden="true"
				/>
			)}

			<aside
				id="app-sidebar"
				aria-label={ariaLabel}
				className={classNames(
					'fixed top-0 left-0 z-50 flex h-full w-[min(82vw,320px)] flex-col overflow-hidden border-r border-brand-1/10 bg-white/95 backdrop-blur transition-transform duration-300 ease-in-out',
					'shadow-2xl shadow-brand-5/20 lg:shadow-none',
					'lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[var(--nav-title-width)] lg:translate-x-0 lg:bg-white',
					{
						'translate-x-0': isOpen,
						'-translate-x-full': !isOpen,
					}
				)}
			>
				<div className="flex items-center justify-between border-b border-brand-1/10 px-5 py-4 lg:hidden">
					<h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-3">Navigation</h2>
					<button
						onClick={onClose}
						className="btn btn-ghost btn-square btn-sm text-brand-4"
						aria-label="Close menu"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto px-4 pb-24 pt-6 lg:px-0 lg:pt-8">
					<ul className="flex flex-col gap-4">
						{sections.map((section) => (
							<li key={section.title}>
								<button
									onClick={() => toggleSection(section.title)}
									className="flex w-full items-center justify-between rounded-full bg-white/70 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-4 transition hover:bg-white hover:text-brand-3 lg:px-6 lg:py-3"
								>
									<span>{section.title}</span>
									{expandedSections[section.title] ? (
										<ChevronDown className="h-4 w-4" />
									) : (
										<ChevronRight className="h-4 w-4" />
									)}
								</button>

								{expandedSections[section.title] && (
									<ul className="mt-3 space-y-1 lg:mt-4">
										{section.items.map((item) => {
											const Icon = item.icon
											const isActive = pathname === item.href

											return (
												<li key={item.href}>
													<Link
														href={item.href}
														className={classNames(
															'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors lg:px-6',
															{
																'bg-brand-4 text-white shadow-md shadow-brand-5/20':
																	isActive,
																'text-brand-4 hover:bg-[var(--soft-brand-color)] hover:text-brand-3':
																	!isActive,
															}
														)}
														onClick={() => {
															if (window.innerWidth < 1024) {
																onClose()
															}
														}}
													>
														<Icon
															className={classNames('h-5 w-5', {
																'text-white': isActive,
																'text-brand-3 transition-colors group-hover:text-brand-4':
																	!isActive,
															})}
														/>
														<span className="flex-1">{item.title}</span>
														{item.badge && (
															<span
																className={classNames(
																	'rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider',
																	isActive
																		? 'bg-white/30 text-white'
																		: 'bg-brand-1/10 text-brand-4'
																)}
															>
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

				<div className="absolute inset-x-0 bottom-0 border-t border-brand-1/10 bg-white/95 px-6 py-5 text-center text-[0.7rem] uppercase tracking-[0.3em] text-brand-4">
					<div className="flex flex-col gap-1">
						<span className="font-semibold text-brand-3">MedSource Pro</span>
						<span>v1.0.0</span>
					</div>
				</div>
			</aside>
		</>
	)
}
