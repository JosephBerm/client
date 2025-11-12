/**
 * Badge UI Component
 * 
 * DaisyUI-styled badge component for displaying status indicators, labels, counts, and tags.
 * Provides multiple color variants, sizes, and outline option for diverse use cases.
 * 
 * **Features:**
 * - 8 color variants (primary, secondary, accent, success, warning, error, info, neutral)
 * - 4 size options (xs, sm, md, lg)
 * - Outline style option
 * - Theme-aware (respects DaisyUI theme)
 * - Inline display (span element)
 * - Customizable with additional classes
 * 
 * **Use Cases:**
 * - Order status indicators (pending, approved, shipped, delivered)
 * - User role badges (Admin, Customer)
 * - Item counts (Cart: 3 items)
 * - Feature tags (New, Popular, Sale)
 * - Category labels
 * - Notification badges
 * 
 * @example
 * ```tsx
 * import Badge from '@_components/ui/Badge';
 * 
 * // Status indicators
 * <Badge variant="success">Approved</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="error">Rejected</Badge>
 * <Badge variant="info">In Progress</Badge>
 * 
 * // Sizes
 * <Badge size="xs" variant="primary">XS Badge</Badge>
 * <Badge size="sm" variant="primary">Small Badge</Badge>
 * <Badge size="md" variant="primary">Medium Badge</Badge>
 * <Badge size="lg" variant="primary">Large Badge</Badge>
 * 
 * // Outline style
 * <Badge variant="primary" outline>Outlined</Badge>
 * <Badge variant="success" outline>Outlined Success</Badge>
 * 
 * // Item counts
 * <button className="btn">
 *   Cart
 *   <Badge variant="accent" size="sm">3</Badge>
 * </button>
 * 
 * // User role badge
 * <div className="flex items-center gap-2">
 *   <span>John Doe</span>
 *   <Badge variant="error" size="xs">Admin</Badge>
 * </div>
 * 
 * // Product tags
 * <div className="flex gap-1">
 *   <Badge variant="success" size="sm">New</Badge>
 *   <Badge variant="warning" size="sm">Sale</Badge>
 *   <Badge variant="info" size="sm">Popular</Badge>
 * </div>
 * ```
 * 
 * @module Badge
 */

import { ReactNode } from 'react'
import classNames from 'classnames'

/**
 * Badge component props interface.
 */
interface BadgeProps {
	/** Badge content (text, number, icon, etc.) */
	children: ReactNode
	
	/** 
	 * Badge color variant.
	 * @default 'neutral'
	 */
	variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
	
	/** 
	 * Badge size.
	 * @default 'md'
	 */
	size?: 'xs' | 'sm' | 'md' | 'lg'
	
	/** 
	 * Outline style (transparent background with colored border).
	 * @default false
	 */
	outline?: boolean
	
	/** Additional custom classes */
	className?: string
}

/**
 * Badge Component
 * 
 * Display component for status indicators, labels, counts, and tags.
 * Uses DaisyUI badge classes for consistent theming.
 * 
 * **Color Variants:**
 * - **primary**: Main brand color, for primary labels
 * - **secondary**: Secondary brand color
 * - **accent**: Accent color for highlights
 * - **success**: Green, for positive states (approved, completed)
 * - **warning**: Yellow/orange, for cautionary states (pending, review)
 * - **error**: Red, for negative states (rejected, failed, admin)
 * - **info**: Blue, for informational states (in progress, processing)
 * - **neutral**: Gray, for neutral states (draft, inactive)
 * 
 * **Sizes:**
 * - **xs**: Extra small (12px height)
 * - **sm**: Small (16px height)
 * - **md**: Medium (20px height) - default
 * - **lg**: Large (24px height)
 * 
 * **Outline Mode:**
 * - Transparent background with colored border and text
 * - Useful for less prominent badges
 * 
 * @param props - Badge configuration props
 * @returns Badge component (span element)
 */
const baseClasses =
	'inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-[0.25em] transition-colors'

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
	primary: 'bg-brand-4 text-white',
	secondary: 'bg-brand-3 text-white',
	accent: 'bg-[var(--teal)] text-white',
	success: 'bg-brand-2 text-white',
	warning: 'bg-[var(--highlight)] text-brand-4',
	error: 'bg-[var(--error-color)] text-white',
	info: 'bg-[var(--link-color)] text-white',
	neutral: 'bg-[var(--light-gray)] text-brand-4',
}

const outlineVariantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
	primary: 'border border-brand-4 text-brand-4',
	secondary: 'border border-brand-3 text-brand-3',
	accent: 'border border-[var(--teal)] text-[var(--teal)]',
	success: 'border border-brand-2 text-brand-2',
	warning: 'border border-[var(--highlight)] text-[var(--highlight)]',
	error: 'border border-[var(--error-color)] text-[var(--error-color)]',
	info: 'border border-[var(--link-color)] text-[var(--link-color)]',
	neutral: 'border border-[var(--light-gray)] text-brand-4',
}

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
	xs: 'px-2 py-1 text-[0.45rem]',
	sm: 'px-3 py-1 text-[0.55rem]',
	md: 'px-4 py-1.5 text-[0.65rem]',
	lg: 'px-5 py-2 text-[0.75rem]',
}

export default function Badge({
	children,
	variant = 'neutral',
	size = 'md',
	outline = false,
	className,
}: BadgeProps) {
	return (
		<span
			className={classNames(
				baseClasses,
				sizeClasses[size],
				outline ? outlineVariantClasses[variant] : variantClasses[variant],
				{
					'bg-transparent': outline,
				},
				className
			)}
		>
			{children}
		</span>
	)
}


