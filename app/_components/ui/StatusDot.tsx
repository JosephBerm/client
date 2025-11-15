/**
 * StatusDot Component
 *
 * Enterprise-grade status indicator using SVG for perfect circular rendering.
 * Provides crisp, pixel-perfect circles at any size without subpixel rendering issues.
 * Follows mobile-first design principles and industry best practices.
 *
 * **Why SVG over CSS?**
 * - Perfect circles at any size (no subpixel rendering artifacts)
 * - Scalable to any size without quality loss
 * - Consistent rendering across all devices and zoom levels
 * - Better performance for small elements
 * - Theme-aware color support
 *
 * **Best Practices (FAANG-level):**
 * - Uses SVG for geometric precision
 * - Mobile-first responsive sizing
 * - Theme-aware colors via DaisyUI tokens
 * - Accessible (WCAG 2.1 compliant ARIA attributes)
 * - Zero JavaScript overhead
 * - Optimized viewBox for scalability
 * - Non-interactive design (decorative/informative only)
 *
 * **Accessibility (WCAG 2.1):**
 * - When decorative (default): Uses aria-hidden="true" and role="presentation"
 * - When informative: Uses role="img" with aria-label or aria-labelledby
 * - Supports screen reader announcements when needed
 * - Follows semantic HTML best practices
 *
 * **Scalability:**
 * - SVG viewBox ensures perfect scaling at any size
 * - Fixed aspect ratio (1:1) maintains circular shape
 * - Size variants designed for different UI densities
 * - Can scale with parent container via CSS
 *
 * **Mobile-First:**
 * - Sizes optimized for touch targets and readability
 * - Works seamlessly in responsive layouts
 * - Scales appropriately with parent text/font size
 * - Minimal visual footprint on small screens
 *
 * @example
 * ```tsx
 * import StatusDot from '@_components/ui/StatusDot';
 *
 * // Basic usage (decorative)
 * <StatusDot variant="success" />
 *
 * // With pulse animation
 * <StatusDot variant="success" animated />
 *
 * // Informative with label
 * <StatusDot variant="success" aria-label="System online" />
 *
 * // Custom size
 * <StatusDot variant="warning" size="sm" />
 * ```
 */

import classNames from 'classnames'

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'primary'

export interface StatusDotProps {
	/** Color variant */
	variant?: StatusVariant
	/** Size variant - optimized for mobile-first responsive design */
	size?: 'xs' | 'sm' | 'md' | 'lg'
	/** Enable pulse animation */
	animated?: boolean
	/** Additional custom classes */
	className?: string
	/** ARIA label for accessibility - if provided, dot is informative; if omitted, dot is decorative */
	'aria-label'?: string
	/** ARIA labelledby - reference to element that labels this dot */
	'aria-labelledby'?: string
}

/**
 * Size mapping following mobile-first approach:
 * - Sizes optimized for readability on small screens
 * - Scales appropriately with parent container
 * - Maintains visual hierarchy across breakpoints
 * 
 * Size breakdown:
 * - xs: 6px (very small, for dense UIs, mobile-optimized)
 * - sm: 8px (standard, for most badges/pills - default)
 * - md: 10px (medium, for emphasis)
 * - lg: 12px (large, for high visibility)
 * 
 * Note: SVG viewBox ensures perfect scaling at any size.
 * The fixed 1:1 aspect ratio maintains circular shape.
 */
const sizeClasses: Record<NonNullable<StatusDotProps['size']>, string> = {
	xs: 'w-1.5 h-1.5', // 6px - Mobile-optimized dense UI
	sm: 'w-2 h-2',     // 8px - Standard size (default)
	md: 'w-2.5 h-2.5', // 10px - Medium emphasis
	lg: 'w-3 h-3',     // 12px - High visibility
}

/**
 * Color variants using DaisyUI theme tokens:
 * - success: Green (active, completed, online)
 * - warning: Yellow/Orange (caution, pending)
 * - error: Red (error, offline, failed)
 * - info: Blue (informational, processing)
 * - primary: Brand color (highlight, featured)
 */
const variantColors: Record<StatusVariant, string> = {
	success: 'fill-success',
	warning: 'fill-warning',
	error: 'fill-error',
	info: 'fill-info',
	primary: 'fill-primary',
}

export default function StatusDot({
	variant = 'success',
	size = 'sm',
	animated = false,
	className,
	'aria-label': ariaLabel,
	'aria-labelledby': ariaLabelledBy,
}: StatusDotProps) {
	// Accessibility: If no aria-label or aria-labelledby, mark as decorative
	// This follows WCAG 2.1 guidelines for decorative images
	const isDecorative = !ariaLabel && !ariaLabelledBy

	return (
		<svg
			className={classNames(
				sizeClasses[size],
				variantColors[variant],
				// shrink-0 prevents SVG from shrinking in flex layouts
				// aspect-square ensures 1:1 aspect ratio for perfect circles
				'shrink-0 aspect-square',
				// Animation support
				{ 'animate-pulse': animated },
				className
			)}
			// ViewBox optimized for perfect circle rendering
			// 0 0 8 8 allows for 1px padding on all sides for stroke if needed
			viewBox="0 0 8 8"
			xmlns="http://www.w3.org/2000/svg"
			// Accessibility attributes following WCAG 2.1 guidelines
			// Decorative images use presentation role and aria-hidden
			// Informative images use img role with appropriate labels
			role={isDecorative ? 'presentation' : 'img'}
			aria-hidden={isDecorative ? 'true' : undefined}
			aria-label={!isDecorative ? (ariaLabel || `${variant} status indicator`) : undefined}
			aria-labelledby={!isDecorative && ariaLabelledBy ? ariaLabelledBy : undefined}
		>
			{/* 
				Perfect circle - center at 4,4 with radius 3
				This creates a 6px diameter circle within an 8x8 viewBox
				The 1px padding on all sides provides space for focus rings
			*/}
			<circle cx="4" cy="4" r="3" />
		</svg>
	)
}

