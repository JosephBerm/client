/**
 * Sidebar Component
 *
 * Modern sidebar navigation with collapsible sections and role-based access control.
 * Inspired by industry-leading designs with a clean, light theme and intuitive UX.
 *
 * **Design Features:**
 * - Light, spacious design (base-200 background)
 * - Large, prominent section headers
 * - Clean icon and text layout
 * - Smooth hover effects
 * - Professional spacing and typography
 * - Settings button in header
 * - "Report an Issue" footer link
 *
 * **Navigation Features:**
 * - Role-based navigation (uses NavigationService)
 * - Collapsible navigation sections
 * - External link indicators
 * - Badge support for notifications
 * - Active route highlighting
 * - Mobile overlay with backdrop
 * - Click-outside-to-close
 * - Escape key support
 * - Body scroll lock on mobile
 *
 * **Responsive Behavior:**
 * - Mobile (< 1024px): Full-screen overlay, closes on link click
 * - Desktop (>= 1024px): Slide-in drawer (controlled by parent)
 * - Width: 320px (mobile) to 384px (desktop)
 *
 * **Performance:**
 * - React Compiler automatically optimizes re-renders and callbacks
 * - No manual memoization needed (React Compiler handles it)
 * - SSR-safe media query hook
 * - Optimized re-renders
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
 *     <>
 *       <Navbar onMenuClick={() => setSidebarOpen(true)} />
 *       <Sidebar
 *         isOpen={sidebarOpen}
 *         onClose={() => setSidebarOpen(false)}
 *       />
 *       <main>{children}</main>
 *     </>
 *   );
 * }
 * ```
 *
 * @module Sidebar
 */

'use client'

import { useState, useRef } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import classNames from 'classnames'
import { Settings, ChevronDown, ExternalLink } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { NavigationService, Routes } from '@_features/navigation'

import { useMediaQuery, useSidebarDrawer } from '@_shared'

import SettingsModal from '@_components/settings/SettingsModal'

import NavigationIcon from './NavigationIcon'

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
 * Modern, spacious navigation sidebar with clean design and intuitive UX.
 * Adapts to user role (Customer vs Admin) and provides role-based navigation.
 *
 * **Design:**
 * - Light background (base-200) with clean typography
 * - Wide layout (320px mobile, 384px desktop)
 * - Prominent section headers with bold text
 * - Icon + Label + Description layout
 * - Smooth hover effects with base-300 background
 * - Professional spacing and padding
 *
 * **Navigation Structure:**
 * - Main: Dashboard, Store (all users)
 * - My Orders: Orders, Quotes (customers)
 * - Management: Products, Orders, Quotes (admins)
 * - Users: Accounts, Customers, Providers (admins)
 * - Analytics: Dashboard (admins)
 * - Account: Profile, Notifications (all users)
 *
 * **Interactions:**
 * - Collapsible sections (click header to toggle)
 * - Hover effect on route items (background change)
 * - Click outside or Escape key to close
 * - Auto-close on mobile after link click
 * - Body scroll lock when open on mobile
 *
 * @param props - Component props including isOpen and onClose
 * @returns Sidebar component
 */
export default function Sidebar({ isOpen, onClose, ariaLabel }: SidebarProps) {
	const pathname = usePathname()
	const user = useAuthStore((state) => state.user)

	// Use media query hook instead of window.innerWidth (prevents hydration issues)
	const isMobile = useMediaQuery('(max-width: 1023px)')

	// Get navigation sections - React Compiler automatically optimizes this computation
	const sections = NavigationService.getNavigationSections(user?.role)

	// State for collapsible sections - React Compiler automatically optimizes this computation
	const initialCollapsed = (() => {
		const collapsed = new Set<string>()
		sections.forEach((section) => {
			if (section.defaultCollapsed) {
				collapsed.add(section.id)
			}
		})
		return collapsed
	})()

	const [collapsedSections, setCollapsedSections] = useState<Set<string>>(initialCollapsed)
	const [settingsModalOpen, setSettingsModalOpen] = useState(false)
	const sidebarRef = useRef<HTMLElement>(null)

	/**
	 * Shared sidebar drawer behavior (MAANG DRY principle)
	 * 
	 * Handles all common mobile drawer logic in one place:
	 * - Outside click detection (modal-aware)
	 * - Escape key handling (modal-aware)
	 * - Body scroll lock
	 * - Child state reset on close
	 * 
	 * @see useSidebarDrawer for implementation details
	 */
	useSidebarDrawer({
		isOpen,
		isMobile,
		onClose,
		sidebarRef,
		hasOpenModal: settingsModalOpen,
		onSidebarClose: () => setSettingsModalOpen(false),
	})

	// Toggle function for section collapse
	// React Compiler automatically optimizes this callback
	const toggleSection = (sectionId: string) => {
		setCollapsedSections((prev) => {
			const next = new Set(prev)
			if (next.has(sectionId)) {
				next.delete(sectionId)
			} else {
				next.add(sectionId)
			}
			return next
		})
	}

	// Link click handler - React Compiler automatically optimizes this callback
	const handleLinkClick = () => {
		// Close sidebar on mobile when link is clicked
		if (isMobile) {
			onClose()
		}
	}

	// Keyboard handler for overlay accessibility
	// React Compiler automatically optimizes this callback
	const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		// Keyboard support for backdrop (Enter or Space to close)
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			onClose()
		}
	}

	// React Compiler automatically optimizes this callback
	const handleSidebarClick = (e: React.MouseEvent<HTMLElement>) => {
		// Prevent click events from bubbling to overlay (prevents accidental sidebar close)
		e.stopPropagation()
	}

	return (
		<>
			{/* Overlay - visible on all screen sizes when sidebar is open */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
					onClick={onClose}
					onKeyDown={handleOverlayKeyDown}
					role="button"
					tabIndex={-1}
					aria-label="Close sidebar"
					aria-hidden="false"
				/>
			)}

			{/* Sidebar */}
			{/* ESLint: onClick stopPropagation is necessary to prevent sidebar from closing when clicking inside.
			    Keyboard handlers are not needed here - keyboard events don't bubble in the same problematic way.
			    The <aside> element is semantic HTML for navigation, and the click handler is for event propagation control, not interaction. */}
			{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
			<aside
				id="app-sidebar"
				ref={sidebarRef}
				aria-label={ariaLabel}
				className={classNames(
					// Use h-dvh (dynamic viewport height) to account for mobile browser UI (URL bar, navigation)
					// This prevents content from being hidden behind mobile browser chrome
					'fixed top-0 left-0 h-dvh bg-base-200 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-base-300',
					'w-80 lg:w-96 overflow-y-auto overscroll-contain',
					{
						'translate-x-0': isOpen,
						'-translate-x-full': !isOpen,
					}
				)}
				onClick={handleSidebarClick}
				style={{
					boxShadow: isOpen
						? '4px 0 24px rgba(0, 0, 0, 0.15), 2px 0 8px rgba(0, 0, 0, 0.1)'
						: 'none',
				}}
			>
				<div className="flex flex-col h-full max-h-dvh">
					{/* Header */}
					<div className="flex items-center justify-between p-4 md:p-6 border-b border-base-300">
						<h2 className="text-xl md:text-2xl font-semibold text-base-content">MedSource</h2>
						{/* Settings Button */}
						<button
							onClick={() => setSettingsModalOpen(true)}
							className="btn-circle ghost"
							aria-label="Settings"
							title="Settings"
						>
							<Settings size={20} className="text-base-content" />
						</button>
					</div>

					{/* Navigation Content - Scrollable with proper mobile handling */}
					<nav className="flex-1 overflow-y-auto p-4 overscroll-contain">
						{sections.map((section) => (
							<div key={section.id} className="mb-4 md:mb-8">
								{/* Section Header */}
								<div className="mb-3 md:mb-4">
									{section.collapsible ? (
										<button
											onClick={() => toggleSection(section.id)}
											className="flex items-center justify-between w-full text-left"
										>
											<h3 className="text-lg font-semibold text-base-content">{section.title}</h3>
											<ChevronDown
												size={20}
												className={classNames('transition-transform', {
													'': collapsedSections.has(section.id),
													'rotate-180': !collapsedSections.has(section.id),
												})}
											/>
										</button>
									) : (
										<h3 className="text-lg font-bold text-base-content">{section.title}</h3>
									)}
								</div>

								{/* Section Routes */}
								{!collapsedSections.has(section.id) && (
									<ul className="space-y-2">
										{section.routes.map((route) => {
											const _isActive = pathname === route.href

											return (
												<li key={route.id}>
													<Link
														href={route.href}
														onClick={handleLinkClick}
														className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors group"
														target={route.isExternal ? '_blank' : undefined}
														rel={route.isExternal ? 'noopener noreferrer' : undefined}
													>
														{/* Icon */}
														<div className="shrink-0 mt-0.5">
															<NavigationIcon
																icon={route.icon}
																size={24}
																className="text-base-content"
															/>
														</div>

														{/* Content */}
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span className="font-medium text-base-content group-hover:text-primary">
																	{route.label}
																</span>
																{route.isExternal && (
																	<ExternalLink size={16} className="text-base-content/60" />
																)}
															</div>
															{route.description && (
																<p className="text-sm text-base-content/70 mt-1">{route.description}</p>
															)}
														</div>

														{/* Badge */}
														{route.badge && (
															<div className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-content">
																{route.badge}
															</div>
														)}
													</Link>
												</li>
											)
										})}
									</ul>
								)}
							</div>
						))}
					</nav>

					{/* Footer - Safe area padding for mobile browsers */}
				<div className="p-4 pb-safe border-t border-base-300 shrink-0 bg-base-200">
					<Link
						href={Routes.Contact.location}
						onClick={handleLinkClick}
							className="text-sm text-base-content/70 hover:text-base-content transition-colors"
						>
							Report an Issue
						</Link>
					</div>
				</div>
			</aside>

			{/* Settings Modal */}
			<SettingsModal
				isOpen={settingsModalOpen}
				onClose={() => setSettingsModalOpen(false)}
			/>
		</>
	)
}
