/**
 * Internal App Shell Component
 * 
 * FAANG-level internal application layout with permanent sidebar navigation.
 * Industry best practice: Sidebar always visible on desktop (like Notion, Linear, Stripe).
 * 
 * **Design Philosophy:**
 * - Portal-style navigation (sidebar is part of the layout, not hidden)
 * - Easy access to all sections (reduces clicks, improves UX)
 * - Consistent with industry leaders (Google, LinkedIn, Stripe, Notion, AWS)
 * - Mobile-first responsive (drawer on mobile, permanent on desktop)
 * 
 * **Features:**
 * - PERMANENT sidebar on desktop (>= 1024px) - NON-COLLAPSIBLE
 * - Drawer sidebar on mobile (< 1024px) - toggleable via hamburger menu
 * - Hamburger menu in top-left (industry standard)
 * - Role-based navigation sections
 * - Auto-generated breadcrumb trail
 * - Responsive layout
 * - Keyboard navigation support
 * 
 * **Responsive Behavior:**
 * - **Mobile (< 1024px):**
 *   - Fixed header with hamburger menu (top-left)
 *   - Sidebar as overlay drawer (toggleable)
 *   - Backdrop with click-to-close
 *   - Breadcrumb trail (truncated to last 2)
 * - **Desktop (>= 1024px):**
 *   - Sidebar ALWAYS VISIBLE (non-collapsible)
 *   - Fixed width sidebar (384px)
 *   - Content area adapts with left margin
 *   - No hamburger menu (not needed)
 *   - Full breadcrumb trail
 * 
 * **Hamburger Menu Pattern (FAANG Standard):**
 * - Location: Top-left corner (matches Google, LinkedIn, Stripe)
 * - Icon: Traditional 3-bar menu icon
 * - Behavior: Opens/closes sidebar drawer on mobile
 * - Hidden on desktop (sidebar is permanent)
 * 
 * **Accessibility:**
 * - WCAG AA compliant
 * - Proper landmarks (nav, main)
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 * - aria-controls connects hamburger to sidebar
 * - aria-expanded indicates drawer state
 * 
 * @example
 * ```tsx
 * // In app/app/layout.tsx
 * import { InternalAppShell } from './_components'
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <InternalAppShell user={user}>
 *       {children}
 *     </InternalAppShell>
 *   )
 * }
 * ```
 * 
 * @module InternalAppShell
 */

'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'

import classNames from 'classnames'
import { Menu } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { useMediaQuery } from '@_shared'

import type { IUser } from '@_classes/User'

import Button from '@_components/ui/Button'
import Logo from '@_components/ui/Logo'

import Breadcrumb from './Breadcrumb'
import InternalSidebar from './InternalSidebar'

/**
 * Synchronizes server-fetched user data to client auth store.
 * Uses ref to ensure one-time initialization (React-safe pattern).
 */
function useAuthSync(user: IUser | null | undefined): void {
	const initialized = useRef(false)

	// Run synchronously on first render only (before children mount)
	if (!initialized.current && user) {
		const currentUser = useAuthStore.getState().user
		if (!currentUser || currentUser.id !== user.id) {
			useAuthStore.getState().setUser(user)
		}
		initialized.current = true
	}

	// Handle user prop changes after initial mount
	useEffect(() => {
		if (!user) return
		
		const currentUser = useAuthStore.getState().user
		if (currentUser?.id !== user.id) {
			useAuthStore.getState().setUser(user)
			logger.info('Auth store updated with new user', {
				userId: user.id ?? 'unknown user',
				component: 'InternalAppShell',
			})
		}
	}, [user])
}

/**
 * InternalAppShell component props interface.
 */
interface InternalAppShellProps {
	/**
	 * Page content to render in main area.
	 */
	children: ReactNode
	/**
	 * User data from server-side authentication.
	 * Used to initialize client-side auth store.
	 * 
	 * **Validation:**
	 * - Must be a valid User instance
	 * - Should have a valid id (though null is technically allowed by type)
	 * - Component handles missing/invalid user gracefully
	 */
	user: IUser
}

/**
 * Internal App Shell Component
 * 
 * Portal-style layout with permanent sidebar (industry best practice).
 * Inspired by Google, LinkedIn, Stripe, Notion, and other top-tier applications.
 * 
 * **Layout Structure (Mobile-First):**
 * 
 * **Mobile (< 1024px):**
 * ```
 * ┌──────────────────────────────────────┐
 * │ [☰ Menu]  MedSource                  │ ← Fixed header with hamburger
 * ├──────────────────────────────────────┤
 * │                                      │
 * │  Breadcrumb → Page Content           │
 * │                                      │
 * └──────────────────────────────────────┘
 * 
 * [Sidebar] ← Overlay drawer (when open)
 * ```
 * 
 * **Desktop (>= 1024px):**
 * ```
 * ┌──────────────────────────────────────────────────┐
 * │  [Sidebar]  │  [Main Content]                    │
 * │             │  - Breadcrumb                      │
 * │  Navigation │  - Page Content                    │
 * │  (Permanent)│                                    │
 * │             │                                    │
 * └──────────────────────────────────────────────────┘
 * ```
 * 
 * **State Management:**
 * - Sidebar open state (mobile only): Local useState
 * - No desktop state needed (sidebar is always visible)
 * - Responsive breakpoint: useMediaQuery hook
 * 
 * **Responsive Behavior:**
 * - **Mobile (<1024px)**:
 *   - Fixed header with hamburger menu (top-left)
 *   - Sidebar as overlay drawer
 *   - Toggleable via hamburger button
 *   - Backdrop with click-to-close
 *   - Closes on link click
 *   - Body scroll lock when open
 * 
 * - **Desktop (>=1024px)**:
 *   - Sidebar PERMANENT (always visible)
 *   - Fixed 384px width
 *   - Main content has fixed left margin
 *   - No hamburger menu (not needed)
 *   - No collapse functionality (portal design)
 * 
 * **Performance:**
 * - Minimal state (mobile only)
 * - No unnecessary re-renders
 * - Sidebar handles own internal logic
 * 
 * @param props - Component props including children and user
 * @returns Internal app shell layout
 */
export default function InternalAppShell({ children, user }: InternalAppShellProps) {
	// Sync server user data to client auth store (React-safe one-time init)
	useAuthSync(user)

	// Mobile drawer state (desktop sidebar is always visible)
	const [sidebarOpen, setSidebarOpen] = useState(false)

	const isMobile = useMediaQuery('(max-width: 1023px)')
	const prevIsMobile = useRef<boolean | null>(null)

	// Close drawer when transitioning mobile → desktop
	useEffect(() => {
		if (prevIsMobile.current === null) {
			prevIsMobile.current = isMobile
			return
		}
		if (!isMobile && prevIsMobile.current && sidebarOpen) {
			setSidebarOpen(false)
		}
		prevIsMobile.current = isMobile
	}, [isMobile, sidebarOpen])

	const toggleSidebar = () => setSidebarOpen((prev) => !prev)
	const closeSidebar = () => setSidebarOpen(false)

	return (
		<div className="relative flex min-h-screen w-full bg-base-100">
			{/* Internal Sidebar Navigation */}
			{/* Mobile: Overlay drawer (controlled by sidebarOpen) */}
			{/* Desktop: Always visible, permanent (isOpen=true) */}
			{/* Internal Sidebar Navigation */}
			{/* Mobile: Overlay drawer (controlled by sidebarOpen) */}
			{/* Desktop: Always visible, permanent (isOpen=true) */}
			{/* 
				Defensive: InternalSidebar handles its own error boundaries internally
				If sidebar fails, app continues to function (graceful degradation)
			*/}
			<InternalSidebar
				isOpen={isMobile ? sidebarOpen : true}
				onClose={closeSidebar}
			/>

			{/* Main Content Area */}
			<main
				id="main-content"
				className={classNames(
					'relative flex-1 bg-base-100',
					'min-h-screen',
					'px-4 pb-16 sm:px-6 lg:px-8 xl:px-12',
					'motion-safe:transition-[margin] motion-safe:duration-300 motion-safe:ease-in-out',
					'overflow-x-hidden w-full min-w-0',
					// Desktop: Fixed left margin for permanent sidebar (384px)
					// Mobile: No margin (sidebar is overlay)
					'lg:ml-96',
					// Mobile: Top padding for fixed header + breathing room
					// FAANG standard: 64px header + 24px spacing = 88px total
					'pt-24 sm:pt-24 lg:pt-8'
				)}
			>
				{/* Mobile: Hamburger Menu Header */}
				{/* Industry standard: Top-left hamburger (Google, LinkedIn, Stripe, Notion) */}
				{/* Mobile-first approach: Hidden on desktop (lg:hidden) */}
				{isMobile && (
					<div
						className={classNames(
							'fixed top-0 left-0 right-0 z-30',
							'h-16 px-4',
							'bg-base-200/95 backdrop-blur-sm',
							'border-b border-base-300',
							'flex items-center gap-4',
							'lg:hidden' // Hide on desktop (permanent sidebar instead)
						)}
					>
					{/* Hamburger Button */}
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleSidebar}
						aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
						aria-expanded={sidebarOpen}
						aria-controls="internal-sidebar"
						className="w-10 h-10 p-0 min-h-0"
					>
						<Menu className="w-6 h-6" aria-hidden="true" />
					</Button>

						{/* Mobile Header Logo */}
					<div className="flex-1 min-w-0 flex items-center">
						<Logo
							href={Routes.Dashboard.location}
							showText
							size="sm"
							className="min-w-0"
							textClassName="truncate"
						/>
					</div>
					</div>
				)}

				{/* Breadcrumb Navigation - FAANG-level spacing (mobile-first) */}
				<Breadcrumb className="mb-5 sm:mb-6 lg:mb-6" />

				{/* Page Content */}
				<div className="mx-auto max-w-screen-2xl">
					{children}
				</div>
			</main>
		</div>
	)
}

