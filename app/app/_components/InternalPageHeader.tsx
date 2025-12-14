/**
 * Internal Page Header Component
 * 
 * Lightweight page header for internal application pages.
 * Displays title, description, and action buttons.
 * Works in harmony with InternalAppShell (no container/max-width).
 * 
 * **Design Philosophy:**
 * - Minimal, focused component
 * - No container (InternalAppShell handles layout)
 * - No max-width (InternalAppShell handles constraints)
 * - Just header content (title, description, actions)
 * 
 * **Next.js 16 Optimization:**
 * - Server Component (no 'use client' directive needed)
 * - No useState, useEffect, or event handlers
 * - Actions prop accepts React nodes (can include Client Components)
 * - Better performance: rendered on server, reduces client JS bundle
 * 
 * **Features:**
 * - Responsive title sizing
 * - Optional description text
 * - Optional action buttons (right-aligned on desktop)
 * - Optional loading state
 * - Consistent spacing
 * - Mobile-first design
 * 
 * **Usage:**
 * Place at the top of page content (InternalAppShell handles the rest).
 * 
 * @example
 * ```tsx
 * import { InternalPageHeader } from '@/app/app/_components'
 * import Link from 'next/link'
 * 
 * // Basic usage
 * <InternalPageHeader
 *   title="Orders"
 *   description="Manage all orders in the system"
 * />
 * 
 * // With actions (use Link for navigation - Server Component compatible)
 * <InternalPageHeader
 *   title="Products"
 *   description="Browse and manage product catalog"
 *   actions={
 *     <Link href="/app/products/create">
 *       <Button variant="primary">Create Product</Button>
 *     </Link>
 *   }
 * />
 * 
 * // With loading state
 * <InternalPageHeader
 *   title="Analytics"
 *   description="Track business metrics"
 *   loading={isLoading}
 * />
 * ```
 * 
 * @module InternalPageHeader
 */

import type { ReactNode } from 'react'

import classNames from 'classnames'

/**
 * InternalPageHeader component props interface.
 */
export interface InternalPageHeaderProps {
	/**
	 * Page title (required).
	 * Large, bold text in primary color.
	 */
	title: string

	/**
	 * Optional description text below title.
	 * Smaller, muted text for context.
	 */
	description?: string

	/**
	 * Optional action buttons/elements.
	 * Typically buttons like "Create", "Export", "Filter".
	 * Right-aligned on desktop, stacked on mobile.
	 */
	actions?: ReactNode

	/**
	 * Optional loading state.
	 * Shows skeleton/spinner instead of content.
	 * @default false
	 */
	loading?: boolean

	/**
	 * Additional CSS classes to apply to the header.
	 */
	className?: string
}

/**
 * Internal Page Header Component
 * 
 * Clean, minimal page header for internal app pages.
 * Designed to work with InternalAppShell (no duplication).
 * 
 * **Layout:**
 * - Flex container (column on mobile, row on desktop)
 * - Title + description on left
 * - Actions on right (or below on mobile)
 * - Bottom margin for spacing from content
 * 
 * **Responsive:**
 * - Mobile (< 640px): Stacked, title 2xl
 * - Tablet (640px-1024px): Stacked, title 3xl
 * - Desktop (>= 1024px): Side-by-side, title 3xl
 * 
 * **Loading State:**
 * - Title: Skeleton bar (w-64)
 * - Description: Skeleton bar (w-96)
 * - Actions: Hidden
 * 
 * @param props - Component props
 * @returns InternalPageHeader component
 */
export default function InternalPageHeader({
	title,
	description,
	actions,
	loading = false,
	className,
}: InternalPageHeaderProps) {
	return (
		<header
			className={classNames(
				'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
				// FAANG-level mobile-first spacing: More generous on mobile, elegant on desktop
				'mb-6 sm:mb-7 md:mb-8',
				className
			)}
			aria-busy={loading}
		>
			{/* Title & Description */}
			<div className="flex-1 min-w-0">
				{loading ? (
					<>
						{/* Loading skeleton */}
						<div 
							className="h-8 md:h-10 w-64 bg-base-300 rounded motion-safe:animate-pulse mb-2"
							role="status"
							aria-label="Loading page header"
						/>
						{description && (
							<div 
								className="h-4 md:h-5 w-96 max-w-full bg-base-200 rounded motion-safe:animate-pulse"
								role="status"
								aria-label="Loading description"
							/>
						)}
					</>
				) : (
					<>
						<h1 className="text-2xl md:text-3xl font-bold text-base-content mb-2">
							{title}
						</h1>
						{description && (
							<p className="text-sm md:text-base text-base-content/70">
								{description}
							</p>
						)}
					</>
				)}
			</div>

			{/* Actions */}
			{actions && !loading && (
				<div className="flex gap-2 flex-wrap shrink-0">
					{actions}
				</div>
			)}
		</header>
	)
}

