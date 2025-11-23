/**
 * Internal App Breadcrumb Component
 * 
 * Convenience wrapper around the unified Breadcrumb component.
 * Auto-generates breadcrumbs for internal application pages.
 * 
 * **Purpose:**
 * - Simplifies breadcrumb usage for internal pages
 * - Auto-generates from pathname + user role
 * - Default mobile truncation (last 2 items)
 * - Structured logging
 * 
 * **Features:**
 * - Auto-generation via useBreadcrumbs hook
 * - Role-based filtering
 * - Dynamic route handling ([id])
 * - Responsive truncation (mobile vs desktop)
 * - WCAG AA accessible
 * 
 * **Architecture:**
 * - Thin wrapper around unified Breadcrumb component
 * - Uses useBreadcrumbs hook for data
 * - Adds internal app-specific defaults
 * - Structured logging for monitoring
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

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import classNames from 'classnames'
import { useBreadcrumbs } from '@_shared/hooks'
import UnifiedBreadcrumb from '@_components/ui/Breadcrumb'
import { logger } from '@_core'

/**
 * Internal app breadcrumb component props.
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
}

/**
 * Internal App Breadcrumb Component
 * 
 * Auto-generates breadcrumbs from pathname and user role.
 * Uses the unified Breadcrumb component for rendering.
 * 
 * **Implementation:**
 * - Calls useBreadcrumbs() hook for auto-generation
 * - Passes items to unified Breadcrumb component
 * - Adds structured logging
 * - Applies default mobile truncation
 * 
 * **Styling:**
 * - Adds margin-bottom for internal app layout
 * - Inherits all styling from unified component
 * 
 * @param props - Component props
 * @returns Breadcrumb navigation component
 */
export default function Breadcrumb({
	className,
	mobileLimit = 2,
}: BreadcrumbProps) {
	const pathname = usePathname()
	const breadcrumbs = useBreadcrumbs()

	// Log breadcrumb changes (monitoring)
	useEffect(() => {
		logger.debug('Internal breadcrumb navigation updated', {
			pathname,
			breadcrumbCount: breadcrumbs.length,
			mobileLimit,
			component: 'InternalBreadcrumb',
		})
	}, [pathname, breadcrumbs.length, mobileLimit])

	// Use unified Breadcrumb component with internal app defaults
	return (
		<UnifiedBreadcrumb
			items={breadcrumbs}
			mobileLimit={mobileLimit}
			showEllipsis={true}
			className={classNames('mb-4 md:mb-6', className)}
			ariaLabel="Internal navigation breadcrumb"
		/>
	)
}
