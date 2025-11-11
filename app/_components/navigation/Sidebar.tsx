'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@_stores/useAuthStore'
import { getNavigationSections } from '@_services/NavigationService'
import { useState } from 'react'
import classNames from 'classnames'

interface SidebarProps {
	isOpen: boolean
	onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
	const pathname = usePathname()
	const user = useAuthStore((state) => state.user)
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

	const sections = getNavigationSections(user?.role)

	// Initialize all sections as expanded
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

	// Close sidebar when clicking outside on mobile
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
			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
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
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-base-300 lg:hidden">
					<h2 className="text-xl font-bold text-primary">Menu</h2>
					<button
						onClick={onClose}
						className="btn btn-ghost btn-square btn-sm"
						aria-label="Close menu"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Navigation */}
				<nav className="overflow-y-auto h-full p-4 pb-20">
					<ul className="menu menu-compact">
						{sections.map((section) => (
							<li key={section.title} className="mb-2">
								{/* Section header */}
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

								{/* Section items */}
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
																'bg-primary text-primary-content font-semibold': isActive,
																'hover:bg-base-300': !isActive,
															}
														)}
														onClick={() => {
															// Close sidebar on mobile when item is clicked
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

				{/* Footer */}
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


