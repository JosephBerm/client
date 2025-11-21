/**
 * Breadcrumb Component
 * 
 * Auto-generated breadcrumb navigation for internal application pages.
 * Displays navigation trail with clickable links and current page indicator.
 * 
 * **Features:**
 * - Auto-generates from current pathname
 * - Role-based filtering
 * - Dynamic route handling ([id])
 * - Responsive truncation (mobile vs desktop)
 * - Accessible navigation landmark
 * - Keyboard navigation support
 * 
 * **Mobile-First:**
 * - Shows last 2 items on mobile (< 768px)
 * - Full trail on desktop (>= 768px)
 * - Ellipsis indicator when truncated
 * - Touch-friendly tap targets
 * 
 * **Accessibility:**
 * - WCAG AA compliant
 * - `nav` landmark with aria-label
 * - `aria-current="page"` for current item
 * - Keyboard navigable links
 * - Screen reader friendly
 * 
 * @example
 * ```tsx
 * import { Breadcrumb } from '@/app/app/_components'
 * 
 * // Automatic generation from pathname
 * <Breadcrumb />
 * 
 * // Path: /app/orders/123
 * // Desktop: Dashboard > Orders > Order #123
 * // Mobile: Orders > Order #123
 * ```
 * 
 * @module Breadcrumb
 */

'use client'

import { useMemo, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import classNames from 'classnames'
import { useAuthStore } from '@_features/auth'
import { generateBreadcrumbs, getResponsiveBreadcrumbs, isTruncated } from '../_lib'
import { logger } from '@_core'

/**
 * Breadcrumb component props interface.
 */
export interface BreadcrumbProps {
	/**
	 * Optional custom class name for styling.
	 */
	className?: string

	/**
	 * Number of breadcrumbs to show on mobile.
	 * @default 2
	 */
	mobileLimit?: number

	/**
	 * Whether to show icons in breadcrumbs.
	 * @default false
	 */
	showIcons?: boolean
}

/**
 * Breadcrumb Item Type
 * Re-exported from lib for convenience
 */
export interface BreadcrumbItem {
	label: string
	href: string
	isCurrent?: boolean
	icon?: string
}

/**
 * Breadcrumb Component
 * 
 * Auto-generates breadcrumb navigation from current pathname.
 * Adapts to mobile/desktop with responsive truncation.
 * 
 * **Implementation:**
 * - Uses `usePathname()` to get current route
 * - Calls `generateBreadcrumbs()` with user role
 * - Memoizes breadcrumbs for performance
 * - Renders with responsive visibility
 * 
 * **Styling:**
 * - Uses DaisyUI tokens for theming
 * - Mobile-first responsive design
 * - Smooth hover transitions
 * - Clean, modern aesthetics
 * 
 * @param props - Component props
 * @returns Breadcrumb navigation component
 */
export default function Breadcrumb({
	className,
	mobileLimit = 2,
	showIcons = false,
}: BreadcrumbProps) {
	const pathname = usePathname()
	const user = useAuthStore((state) => state.user)

	// Generate breadcrumbs based on pathname and user role
	const desktopBreadcrumbs = useMemo(() => {
		return generateBreadcrumbs(pathname, user?.role)
	}, [pathname, user?.role])

	// Generate responsive breadcrumbs for mobile
	const mobileBreadcrumbs = useMemo(() => {
		return getResponsiveBreadcrumbs(pathname, user?.role, mobileLimit)
	}, [pathname, user?.role, mobileLimit])

	// Check if breadcrumbs are truncated on mobile
	const showEllipsis = useMemo(() => {
		return isTruncated(pathname, user?.role, mobileLimit)
	}, [pathname, user?.role, mobileLimit])

	// Log breadcrumb changes (not every render - performance optimization)
	useEffect(() => {
		logger.debug('Breadcrumb navigation updated', {
			pathname,
			desktopCount: desktopBreadcrumbs.length,
			mobileCount: mobileBreadcrumbs.length,
			truncated: showEllipsis,
			component: 'Breadcrumb',
		})
	}, [pathname, desktopBreadcrumbs.length, mobileBreadcrumbs.length, showEllipsis])

	// Don't render if no breadcrumbs (shouldn't happen, but defensive)
	if (desktopBreadcrumbs.length === 0) {
		return null
	}

	return (
		<nav
			aria-label="Breadcrumb navigation"
			className={classNames(
				'flex items-center gap-2 text-sm',
				'mb-4 md:mb-6',
				className
			)}
		>
			{/* Desktop Breadcrumbs - Full Trail */}
			<ol className="hidden md:flex items-center gap-2 flex-wrap">
				{desktopBreadcrumbs.map((item, index) => (
					<li key={item.href} className="flex items-center gap-2">
						{/* Separator (except first item) */}
						{index > 0 && (
							<ChevronRight
								className="w-4 h-4 text-base-content/40 shrink-0"
								aria-hidden="true"
							/>
						)}

						{/* Breadcrumb Link or Text */}
						{item.isCurrent ? (
							<span
								className="text-base-content font-medium"
								aria-current="page"
							>
								{item.label}
							</span>
						) : (
							<Link
								href={item.href}
								className={classNames(
									'text-base-content/70 hover:text-primary',
									'motion-safe:transition-colors motion-safe:duration-200',
									'hover:underline underline-offset-2',
									'focus-visible:outline-none focus-visible:ring-2',
									'focus-visible:ring-primary focus-visible:ring-offset-2',
									'rounded-sm'
								)}
							>
								{item.label}
							</Link>
						)}
					</li>
				))}
			</ol>

			{/* Mobile Breadcrumbs - Last N Items */}
			<ol className="flex md:hidden items-center gap-2 flex-wrap">
				{/* Show ellipsis if truncated */}
				{showEllipsis && (
					<li className="flex items-center gap-2">
						<span className="text-base-content/40" aria-hidden="true">
							...
						</span>
						<ChevronRight
							className="w-4 h-4 text-base-content/40 shrink-0"
							aria-hidden="true"
						/>
					</li>
				)}

				{mobileBreadcrumbs.map((item, index) => (
					<li key={item.href} className="flex items-center gap-2">
						{/* Separator (except first mobile item) */}
						{index > 0 && (
							<ChevronRight
								className="w-4 h-4 text-base-content/40 shrink-0"
								aria-hidden="true"
							/>
						)}

						{/* Breadcrumb Link or Text */}
						{item.isCurrent ? (
							<span
								className="text-base-content font-medium text-sm"
								aria-current="page"
							>
								{item.label}
							</span>
						) : (
							<Link
								href={item.href}
								className={classNames(
									'text-base-content/70 hover:text-primary',
									'motion-safe:transition-colors motion-safe:duration-200',
									'hover:underline underline-offset-2',
									'focus-visible:outline-none focus-visible:ring-2',
									'focus-visible:ring-primary focus-visible:ring-offset-2',
									'rounded-sm text-sm'
								)}
							>
								{item.label}
							</Link>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}

