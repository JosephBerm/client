/**
 * Badge UI Component - Industry Best Practice
 * 
 * Modern, powerful badge component for counts, status indicators, labels, and tags.
 * Built with fixed dimensions, theme awareness, and multiple visual tones.
 * 
 * **Features:**
 * - 8 color variants (primary, secondary, accent, success, warning, error, info, neutral)
 * - 3 visual tones (default, subtle, solid)
 * - 4 size options (xs, sm, md, lg)
 * - Fixed shape (no morphing between states)
 * - Theme-aware (respects DaisyUI theme colors)
 * - Locked dimensions (no size changes on interaction)
 * - Accessible (proper contrast ratios)
 * 
 * **Use Cases:**
 * - Item counts (category counts, cart items, notifications)
 * - Status indicators (order status, payment status)
 * - Labels and tags (product tags, feature labels)
 * - Selection state indicators (selected, partial, default)
 * 
 * @example
 * ```tsx
 * import Badge from '@_components/ui/Badge';
 * 
 * // Count badges (default tone)
 * <Badge>7</Badge>
 * <Badge variant="primary">12</Badge>
 * <Badge variant="accent" size="sm">3</Badge>
 * 
 * // Status indicators (solid tone)
 * <Badge variant="success" tone="solid">Approved</Badge>
 * <Badge variant="error" tone="solid">Rejected</Badge>
 * <Badge variant="warning" tone="solid">Pending</Badge>
 * 
 * // Subtle highlights (subtle tone)
 * <Badge variant="primary" tone="subtle">Featured</Badge>
 * <Badge variant="info" tone="subtle">New</Badge>
 * 
 * // Sizes
 * <Badge size="xs">XS</Badge>
 * <Badge size="sm">SM</Badge>
 * <Badge size="md">MD</Badge>
 * <Badge size="lg">LG</Badge>
 * 
 * // Selection states (CategoryFilter example)
 * <Badge>4</Badge>                              // Default
 * <Badge variant="primary" tone="subtle">4</Badge>  // Partial selection
 * <Badge variant="primary" tone="solid">4</Badge>   // Full selection
 * ```
 * 
 * @module Badge
 */

import { ReactNode } from 'react'
import classNames from 'classnames'

/**
 * Badge component props interface.
 */
export interface BadgeProps {
	/** Badge content (text, number, icon, etc.) */
	children: ReactNode
	
	/** 
	 * Badge color variant.
	 * Determines the color scheme (uses DaisyUI theme colors).
	 * @default 'neutral'
	 */
	variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
	
	/** 
	 * Visual tone/intensity of the badge.
	 * - **default**: Light background, subtle (e.g., bg-base-300)
	 * - **subtle**: Variant color with opacity (e.g., bg-primary/20)
	 * - **solid**: Full variant color (e.g., bg-primary)
	 * @default 'default'
	 */
	tone?: 'default' | 'subtle' | 'solid'
	
	/** 
	 * Badge size (affects padding and dimensions).
	 * @default 'sm'
	 */
	size?: 'xs' | 'sm' | 'md' | 'lg'
	
	/** Additional custom classes */
	className?: string
}

/**
 * Badge Component
 * 
 * Modern badge component with fixed dimensions and consistent shape.
 * Shape never changes - only colors adapt to variant and tone.
 * 
 * **Design Philosophy:**
 * - Fixed circular shape (rounded-full)
 * - Locked minimum dimensions (prevents morphing)
 * - Theme-aware colors (uses DaisyUI semantic tokens)
 * - Smooth color transitions only
 * 
 * **Tone System:**
 * - **default**: Neutral, subtle presence (bg-base-300)
 * - **subtle**: Highlighted with opacity (bg-variant/20)
 * - **solid**: Full color, high prominence (bg-variant)
 * 
 * @param props - Badge configuration props
 * @returns Badge component (span element)
 */

// Base classes - consistent shape, always applied
const baseClasses =
	'flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors duration-150'

// Size classes - fixed dimensions, padding, and text size
const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
	xs: 'px-2 py-0.5 min-w-[24px] min-h-[20px] text-xs',
	sm: 'px-2.5 py-1 min-w-[28px] min-h-[24px] text-xs',
	md: 'px-3 py-1.5 min-w-[32px] min-h-[28px] text-sm',
	lg: 'px-4 py-2 min-w-[36px] min-h-[32px] text-sm',
}

// Tone classes - color combinations per variant
const toneClasses = {
	default: {
		primary: 'bg-base-300 text-base-content/60',
		secondary: 'bg-base-300 text-base-content/60',
		accent: 'bg-base-300 text-base-content/60',
		success: 'bg-base-300 text-base-content/60',
		warning: 'bg-base-300 text-base-content/60',
		error: 'bg-base-300 text-base-content/60',
		info: 'bg-base-300 text-base-content/60',
		neutral: 'bg-base-300 text-base-content/60',
	},
	subtle: {
		primary: 'bg-primary/20 text-primary',
		secondary: 'bg-secondary/20 text-secondary',
		accent: 'bg-accent/20 text-accent',
		success: 'bg-success/20 text-success',
		warning: 'bg-warning/20 text-warning',
		error: 'bg-error/20 text-error',
		info: 'bg-info/20 text-info',
		neutral: 'bg-neutral/20 text-neutral',
	},
	solid: {
		primary: 'bg-primary text-primary-content',
		secondary: 'bg-secondary text-secondary-content',
		accent: 'bg-accent text-accent-content',
		success: 'bg-success text-success-content',
		warning: 'bg-warning text-warning-content',
		error: 'bg-error text-error-content',
		info: 'bg-info text-info-content',
		neutral: 'bg-neutral text-neutral-content',
	},
} as const

export default function Badge({
	children,
	variant = 'neutral',
	tone = 'default',
	size = 'sm',
	className,
}: BadgeProps) {
	return (
		<span
			className={classNames(
				baseClasses,
				sizeClasses[size],
				toneClasses[tone][variant],
				className
			)}
		>
			{children}
		</span>
	)
}


