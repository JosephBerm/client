/**
 * Surface UI Component
 *
 * A lightweight container for content grouping that's visually lighter than Card.
 * Part of the "Surfaces, Not Containers" design philosophy for 2025-2026 enterprise dashboards.
 *
 * **Philosophy:**
 * Instead of wrapping everything in cards, use a layered surface system:
 * - Page Background (base-100)
 *   └── Content Region (Surface with subtle variant)
 *        └── Data Groups (no explicit container, just spacing)
 *             └── Interactive Elements (Cards only when truly needed)
 *
 * **Use Cases:**
 * - Data tables wrapper (minimal chrome, focus on data)
 * - Form sections (background grouping without heavy borders)
 * - Static info panels (de-emphasized container)
 * - Action button groups (logical grouping)
 *
 * **When to use Surface vs Card:**
 * | Use Case              | Component              | Why                                    |
 * |-----------------------|------------------------|----------------------------------------|
 * | Data tables           | Surface or no wrapper  | Minimal chrome, focus on data          |
 * | Form sections         | Surface variant="subtle"| Background grouping without heavy borders |
 * | Stats/KPIs with hover | Card variant="stat"    | Needs interactive hover                |
 * | Clickable items       | Card                   | Needs elevation feedback               |
 * | Static info panels    | Surface variant="inset"| De-emphasize container                 |
 * | Action button groups  | Surface variant="default" | Logical grouping                    |
 * | Empty states          | No wrapper             | Let illustration breathe               |
 *
 * @example
 * ```tsx
 * import Surface from '@_components/ui/Surface';
 *
 * // Subtle surface for form sections
 * <Surface variant="subtle" padding="lg">
 *   <h3>Account Settings</h3>
 *   <form>...</form>
 * </Surface>
 *
 * // Inset surface for static info
 * <Surface variant="inset" padding="md">
 *   <p>System information displayed here</p>
 * </Surface>
 *
 * // Elevated surface for important content
 * <Surface variant="elevated" padding="lg" rounded>
 *   <h2>Dashboard Summary</h2>
 *   <p>Key metrics go here</p>
 * </Surface>
 *
 * // No padding for data grids
 * <Surface variant="subtle" padding="none">
 *   <RichDataGrid columns={columns} fetcher={fetcher} />
 * </Surface>
 * ```
 *
 * @module Surface
 * @see {@link Card} For interactive containers that need hover effects
 */

'use client'

import type { HTMLAttributes, ReactNode, JSX } from 'react'

import classNames from 'classnames'

/**
 * Surface variant types defining visual weight and purpose
 * - default: Plain background, minimal styling
 * - subtle: Light tint with semi-transparent border
 * - inset: Sunken appearance for de-emphasized content
 * - elevated: Raised appearance with shadow (similar to Card but lighter)
 */
type SurfaceVariant = 'default' | 'subtle' | 'inset' | 'elevated'

/**
 * Padding options for Surface
 * - none: No padding (for data grids, custom layouts)
 * - sm: 12px (0.75rem) - Compact sections
 * - md: 16px (1rem) - Default, balanced spacing
 * - lg: 24px (1.5rem) - Comfortable sections
 */
type SurfacePadding = 'none' | 'sm' | 'md' | 'lg'

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
	/** Content to render inside the surface */
	children: ReactNode
	/** Visual variant controlling background and borders */
	variant?: SurfaceVariant
	/** Internal padding amount */
	padding?: SurfacePadding
	/** Whether to apply border radius (default: true) */
	rounded?: boolean
}

/**
 * Variant classes using DaisyUI semantic colors
 * Designed to be visually lighter than Card variants
 */
const variantClasses: Record<SurfaceVariant, string> = {
	default: 'bg-base-100',
	// Subtle: Uses base-200 (not base-100) for visible contrast against page background
	subtle: 'bg-base-200/50 border border-base-300/50',
	// Inset: Sunken appearance with darker background
	inset: 'bg-base-200/60 border border-base-300/40',
	elevated: 'bg-base-100 shadow-[var(--shadow-card-rest)]',
}

/**
 * Padding classes using Tailwind spacing scale
 */
const paddingClasses: Record<SurfacePadding, string> = {
	none: '',
	sm: 'p-3',
	md: 'p-4',
	lg: 'p-6',
}

/**
 * Surface component - A lightweight container for content regions
 *
 * @param children - Content to render
 * @param variant - Visual variant (default: 'default')
 * @param padding - Internal padding (default: 'md')
 * @param rounded - Whether to apply border radius (default: true)
 * @param className - Additional CSS classes
 * @param props - Additional HTML div attributes
 */
export default function Surface({
	children,
	variant = 'default',
	padding = 'md',
	rounded = true,
	className,
	...props
}: SurfaceProps): JSX.Element {
	return (
		<div
			className={classNames(
				variantClasses[variant],
				paddingClasses[padding],
				rounded && 'rounded-xl',
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}
