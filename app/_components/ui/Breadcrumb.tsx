/**
 * Breadcrumb Component - Unified Presentation Layer
 * 
 * FAANG-level reusable breadcrumb component for both internal and public pages.
 * Separates presentation from data source for maximum flexibility.
 * 
 * **Design Principles:**
 * - Pure presentation component (UI only)
 * - Data source agnostic (manual or auto-generated)
 * - Mobile-first responsive
 * - WCAG AA accessible
 * - Zero business logic
 * - DRY compliant
 * 
 * **Features:**
 * - Responsive truncation (mobile/desktop)
 * - Keyboard navigation
 * - Screen reader support
 * - Touch-friendly tap targets
 * - Smooth animations (respects prefers-reduced-motion)
 * - Theme-aware (DaisyUI)
 * 
 * **Usage Patterns:**
 * 
 * Pattern 1: Manual Items (Public Pages)
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Store', href: '/store' },
 *     { label: 'Product', href: '/store/product/123', isCurrent: true }
 *   ]}
 * />
 * ```
 * 
 * Pattern 2: Auto-Generated (Internal Pages)
 * ```tsx
 * import { useBreadcrumbs } from '@_shared/hooks'
 * 
 * function InternalPage() {
 *   const breadcrumbs = useBreadcrumbs() // Auto-generates from pathname + role
 *   return <Breadcrumb items={breadcrumbs} />
 * }
 * ```
 * 
 * Pattern 3: Responsive Truncation
 * ```tsx
 * <Breadcrumb
 *   items={breadcrumbs}
 *   mobileLimit={2}        // Show last 2 on mobile
 *   showEllipsis={true}    // Show "..." when truncated
 * />
 * ```
 * 
 * @module Breadcrumb
 */

'use client'

import { useMemo } from 'react'

import Link from 'next/link'

import classNames from 'classnames'
import { ChevronRight } from 'lucide-react'

import type { BreadcrumbItem } from '@_types/navigation'

// Re-export for convenience (consumers can import from here or from @_types/navigation)
export type { BreadcrumbItem }

/**
 * Breadcrumb component props interface.
 */
export interface BreadcrumbProps {
	/**
	 * Array of breadcrumb items to display.
	 * Can be manually defined or auto-generated from a hook.
	 */
	items: BreadcrumbItem[]

	/**
	 * Number of breadcrumbs to show on mobile (< 768px).
	 * Shows last N items. Desktop always shows all items.
	 * @default undefined (no truncation)
	 */
	mobileLimit?: number

	/**
	 * Whether to show ellipsis when truncated on mobile.
	 * Only applies when mobileLimit is set.
	 * @default true
	 */
	showEllipsis?: boolean

	/**
	 * Optional custom class name for styling.
	 */
	className?: string

	/**
	 * Optional aria-label for the nav element.
	 * @default "Breadcrumb navigation"
	 */
	ariaLabel?: string
}

/**
 * Breadcrumb Component
 * 
 * Pure presentation component for rendering breadcrumb navigation.
 * Data source agnostic - accepts any array of BreadcrumbItem.
 * 
 * **Responsive Behavior:**
 * - Desktop (≥768px): Shows all breadcrumbs
 * - Mobile (<768px): Shows last N breadcrumbs (if mobileLimit set)
 * - Ellipsis indicator when truncated
 * 
 * **Accessibility:**
 * - Semantic `<nav>` landmark
 * - Ordered list structure (`<ol>`)
 * - `aria-current="page"` for current item
 * - Keyboard navigable links
 * - Screen reader friendly
 * - Touch-friendly (min 44px tap targets)
 * 
 * **Performance:**
 * - Memoized mobile breadcrumbs
 * - Minimal re-renders
 * - No unnecessary calculations
 * 
 * @param props - Component props
 * @returns Breadcrumb navigation component
 */
export default function Breadcrumb({
	items,
	mobileLimit,
	showEllipsis = true,
	className,
	ariaLabel = 'Breadcrumb navigation',
}: BreadcrumbProps) {
	// Memoize mobile breadcrumbs (truncated)
	const mobileBreadcrumbs = useMemo(() => {
		if (!mobileLimit || items.length <= mobileLimit) {
			return items
		}
		return items.slice(-mobileLimit)
	}, [items, mobileLimit])

	// Check if truncation occurred
	const isTruncated = useMemo(() => {
		return Boolean(mobileLimit && items.length > mobileLimit)
	}, [items.length, mobileLimit])

	// Don't render if no breadcrumbs
	if (!items || items.length === 0) {
		return null
	}

	return (
		<nav
			aria-label={ariaLabel}
			className={classNames(
				'flex items-center gap-2',
				'text-sm text-base-content/60',
				className
			)}
		>
			{/* Desktop Breadcrumbs - Full Trail */}
			<ol
				className={classNames(
					'flex items-center gap-2 flex-wrap',
					mobileLimit ? 'hidden md:flex' : 'flex'
				)}
			>
				{items.map((item, index) => (
					<li key={item.href} className="flex items-center gap-2">
						{/* Separator (except first item) */}
						{index > 0 && (
							<ChevronRight
								className="h-3.5 w-3.5 text-base-content/30 shrink-0"
								aria-hidden="true"
							/>
						)}

						{/* Breadcrumb Link or Text */}
						{item.isCurrent ? (
							<span
								className="font-medium text-base-content"
								aria-current="page"
							>
								{item.label}
							</span>
						) : (
							<Link
								href={item.href}
								className={classNames(
									'text-base-content/60 hover:text-primary',
									'motion-safe:transition-colors motion-safe:duration-200',
									'hover:underline underline-offset-2',
									'focus-visible:outline-none focus-visible:ring-2',
									'focus-visible:ring-primary focus-visible:ring-offset-2',
									'rounded-sm',
									// Touch-friendly tap target (min 44px)
									'min-h-[44px] md:min-h-0 flex items-center'
								)}
							>
								{item.label}
							</Link>
						)}
					</li>
				))}
			</ol>

			{/* Mobile Breadcrumbs - Last N Items (if mobileLimit set) */}
			{mobileLimit && (
				<ol className="flex md:hidden items-center gap-2 flex-wrap">
					{/* Show ellipsis if truncated */}
					{isTruncated && showEllipsis && (
						<li className="flex items-center gap-2">
							<span className="text-base-content/40" aria-hidden="true">
								...
							</span>
							<ChevronRight
								className="h-3.5 w-3.5 text-base-content/30 shrink-0"
								aria-hidden="true"
							/>
						</li>
					)}

					{mobileBreadcrumbs.map((item, index) => (
						<li key={item.href} className="flex items-center gap-2">
							{/* Separator (except first mobile item) */}
							{index > 0 && (
								<ChevronRight
									className="h-3.5 w-3.5 text-base-content/30 shrink-0"
									aria-hidden="true"
								/>
							)}

							{/* Breadcrumb Link or Text */}
							{item.isCurrent ? (
								<span
									className="font-medium text-base-content"
									aria-current="page"
								>
									{item.label}
								</span>
							) : (
								<Link
									href={item.href}
									className={classNames(
										'text-base-content/60 hover:text-primary',
										'motion-safe:transition-colors motion-safe:duration-200',
										'hover:underline underline-offset-2',
										'focus-visible:outline-none focus-visible:ring-2',
										'focus-visible:ring-primary focus-visible:ring-offset-2',
										'rounded-sm',
										// Touch-friendly tap target (min 44px)
										'min-h-[44px] flex items-center'
									)}
								>
									{item.label}
								</Link>
							)}
						</li>
					))}
				</ol>
			)}
		</nav>
	)
}

