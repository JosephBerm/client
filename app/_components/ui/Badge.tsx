/**
 * Badge UI Component - DaisyUI 5 Native Implementation
 *
 * Modern, powerful badge component using native DaisyUI 5 classes.
 * Fully theme-aware - automatically adapts to any DaisyUI theme.
 *
 * **DaisyUI 5 Features Used:**
 * - Native `badge` base class
 * - Color variants: `badge-{primary|secondary|accent|success|warning|error|info|neutral}`
 * - Size variants: `badge-{xs|sm|md|lg|xl}`
 * - Style variants: `badge-soft` (subtle), `badge-outline`, `badge-dash`, `badge-ghost`
 *
 * **Theme Awareness:**
 * - Uses DaisyUI semantic color tokens (--p, --s, --su, --wa, --er, --in, --n)
 * - Automatically responds to `data-theme` attribute changes
 * - Zero hardcoded colors - all from theme
 *
 * **Use Cases:**
 * - Status indicators (order status, payment status)
 * - Item counts (category counts, cart items, notifications)
 * - Labels and tags (product tags, feature labels)
 * - Selection state indicators
 *
 * @example
 * ```tsx
 * import Badge from '@_components/ui/Badge'
 *
 * // Solid badges (default badgeStyle)
 * <Badge variant="success">Approved</Badge>
 * <Badge variant="error">Rejected</Badge>
 * <Badge variant="warning">Pending</Badge>
 *
 * // Soft badges (subtle background)
 * <Badge variant="success" badgeStyle="soft">Active</Badge>
 * <Badge variant="info" badgeStyle="soft">New</Badge>
 *
 * // Outline badges
 * <Badge variant="primary" badgeStyle="outline">Featured</Badge>
 *
 * // With icons
 * <Badge variant="success">
 *   <CheckIcon className="size-[1em]" />
 *   Complete
 * </Badge>
 *
 * // Sizes
 * <Badge size="xs">XS</Badge>
 * <Badge size="sm">SM</Badge>
 * <Badge size="md">MD</Badge>
 * <Badge size="lg">LG</Badge>
 * <Badge size="xl">XL</Badge>
 * ```
 *
 * @see https://daisyui.com/components/badge/
 * @module Badge
 */

import type { ReactNode } from 'react'

import classNames from 'classnames'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Badge color variants - maps to DaisyUI badge-{variant} classes
 */
export type BadgeVariant =
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral'

/**
 * Badge style variants - maps to DaisyUI modifier classes
 * - solid: Default filled style (no modifier needed)
 * - soft: Softer appearance with transparent background (badge-soft)
 * - outline: Bordered with transparent background (badge-outline)
 * - dash: Dashed border style (badge-dash)
 * - ghost: Minimal styling (badge-ghost)
 */
export type BadgeStyle = 'solid' | 'soft' | 'outline' | 'dash' | 'ghost'

/**
 * Badge size variants - maps to DaisyUI badge-{size} classes
 */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Badge component props interface.
 * Omits 'style' from HTMLSpanElement to avoid conflict with badgeStyle prop.
 */
export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'style'> {
	/** Badge content (text, number, icon, etc.) */
	children: ReactNode

	/**
	 * Badge color variant.
	 * Maps to DaisyUI badge-{variant} classes.
	 * @default 'neutral'
	 */
	variant?: BadgeVariant

	/**
	 * Badge visual style.
	 * - solid: Default filled style
	 * - soft: Softer with transparent background (DaisyUI 5 badge-soft)
	 * - outline: Bordered transparent (badge-outline)
	 * - dash: Dashed border (badge-dash)
	 * - ghost: Minimal (badge-ghost)
	 * @default 'solid'
	 */
	badgeStyle?: BadgeStyle

	/**
	 * Badge size.
	 * Maps to DaisyUI badge-{size} classes.
	 * @default 'md'
	 */
	size?: BadgeSize
}

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

/**
 * Maps variant prop to DaisyUI class
 */
const variantClasses: Record<BadgeVariant, string> = {
	primary: 'badge-primary',
	secondary: 'badge-secondary',
	accent: 'badge-accent',
	success: 'badge-success',
	warning: 'badge-warning',
	error: 'badge-error',
	info: 'badge-info',
	neutral: 'badge-neutral',
}

/**
 * Maps badgeStyle prop to DaisyUI modifier class
 * Note: 'solid' is the default and doesn't need a class
 */
const styleClasses: Record<BadgeStyle, string> = {
	solid: '', // Default DaisyUI badge style
	soft: 'badge-soft',
	outline: 'badge-outline',
	dash: 'badge-dash',
	ghost: 'badge-ghost',
}

/**
 * Maps size prop to DaisyUI class
 * Note: 'md' is the default and doesn't need a class
 */
const sizeClasses: Record<BadgeSize, string> = {
	xs: 'badge-xs',
	sm: 'badge-sm',
	md: '', // Default DaisyUI badge size
	lg: 'badge-lg',
	xl: 'badge-xl',
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Badge Component
 *
 * Native DaisyUI 5 badge with full theme support.
 * Uses semantic color tokens that automatically adapt to any theme.
 *
 * **Key Benefits:**
 * - 100% theme-aware (light/dark/custom themes)
 * - Zero custom CSS - pure DaisyUI classes
 * - Accessible contrast ratios (handled by DaisyUI)
 * - Consistent with DaisyUI design system
 *
 * @param props - Badge configuration props
 * @returns Badge component (span element)
 */
export default function Badge({
	children,
	variant = 'neutral',
	badgeStyle = 'solid',
	size = 'md',
	className,
	...rest
}: BadgeProps) {
	return (
		<span
			className={classNames(
				'badge',
				variantClasses[variant],
				styleClasses[badgeStyle],
				sizeClasses[size],
				className
			)}
			{...rest}
		>
			{children}
		</span>
	)
}
