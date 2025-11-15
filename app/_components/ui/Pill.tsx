/**
 * Pill UI Component
 *
 * Enterprise-grade label badge built on MedSource brand tokens.
 * Ideal for inline status chips, feature tags, or metrics callouts.
 * Fully responsive with mobile-first design following FAANG-level best practices.
 *
 * **Features:**
 * - 7 color tones (brand, accent, primary, success, warning, info, neutral)
 * - 3 size options (sm, md, lg) with responsive scaling
 * - Shadow support (none, sm, lg)
 * - Icon support (left-positioned, properly aligned on wrap)
 * - Responsive typography (adaptive font size and letter-spacing)
 * - Smart text wrapping (optimized line-height and word-breaking)
 * - Mobile-first design (optimized padding and spacing)
 * - Theme-aware colors (uses DaisyUI semantic tokens)
 * - WCAG-compliant contrast ratios
 *
 * **Design Philosophy:**
 * - Mobile-first: Optimized for small screens, enhanced for larger
 * - Readability: Adaptive letter-spacing and line-height
 * - Elegant wrapping: Keeps related words together when possible
 * - Performance: Zero JavaScript, pure CSS solution
 * - Accessibility: Proper contrast and readable text sizes
 *
 * @example
 * ```tsx
 * import Pill from '@_components/ui/Pill';
 *
 * // Basic usage
 * <Pill>New Feature</Pill>
 *
 * // With icon (status indicator)
 * <Pill icon={<StatusDot />}>Active</Pill>
 *
 * // Hero badge with responsive typography
 * <Pill size="md" shadow="sm" tone="neutral">
 *   Medical Supply Specialists
 * </Pill>
 * 
 * // Section labels with different tones
 * <Pill tone="accent">Why MedSource Pro</Pill>
 * <Pill tone="primary">Featured Inventory</Pill>
 * <Pill tone="info">Product Catalog</Pill>
 * <Pill tone="warning">FAQ</Pill>
 * ```
 */

import { ReactNode } from 'react'
import classNames from 'classnames'

type PillTone = 'brand' | 'accent' | 'primary' | 'success' | 'warning' | 'info' | 'neutral'
type PillSize = 'sm' | 'md' | 'lg'
type PillShadow = 'none' | 'sm' | 'lg'

export interface PillProps {
	/** Pill content (text, etc.) */
	children: ReactNode
	/** Color tone/variant */
	tone?: PillTone
	/** Size variant - responsive scaling applied automatically */
	size?: PillSize
	/** Shadow level */
	shadow?: PillShadow
	/** Icon displayed before text (aligned with first line when wrapping) */
	icon?: ReactNode
	/** Font weight */
	fontWeight?: 'medium' | 'semibold'
	/** Additional custom classes */
	className?: string
}

const toneClasses: Record<PillTone, string> = {
	brand: 'bg-primary/10 text-primary',      // Legacy alias for primary (backward compatible)
	accent: 'bg-accent/10 text-accent',        // Accent color for highlights
	primary: 'bg-primary/10 text-primary',     // Primary brand color
	success: 'bg-success/10 text-success',     // Success states
	warning: 'bg-warning/20 text-warning',     // Warning/caution states
	info: 'bg-info/15 text-info',              // Informational states
	neutral: 'bg-base-300/40 text-base-content', // Neutral/muted states
}

/**
 * Responsive size classes following mobile-first approach:
 * - Mobile (< 640px): Compact padding with adequate vertical spacing for wrapped text
 * - Tablet (640px+): Balanced spacing, moderate letter-spacing
 * - Desktop (768px+): Full spacing with optimal letter-spacing for brand impact
 * 
 * Font size strategy:
 * - Mobile: text-xs (12px) - WCAG minimum for readability
 * - Tablet+: text-xs sm:text-sm - Slightly larger for better presence (lg only)
 * 
 * Letter-spacing strategy:
 * - Mobile: tracking-[0.1em] - Very tight for narrow screens to prevent wrapping
 * - Tablet: sm:tracking-[0.18em] - Medium spacing for better readability
 * - Desktop: md:tracking-[0.3em] - Full brand spacing for visual impact
 * 
 * Padding strategy (optimized for wrapped text):
 * - Mobile: px-2.5 py-2 (adequate vertical padding for 2-line text)
 * - Tablet: sm:px-4 sm:py-2.5 (balanced horizontal and vertical)
 * - Desktop: md:px-6 md:py-4 (generous spacing for brand presence)
 * 
 * Line-height strategy:
 * - Mobile: leading-[1.4] (compact but readable)
 * - Tablet+: sm:leading-relaxed (1.5) (comfortable spacing when wrapping)
 */
const sizeClasses: Record<PillSize, string> = {
	sm: 'px-2.5 py-2 sm:px-4 sm:py-2.5 gap-1 sm:gap-2 text-xs leading-[1.4] sm:leading-relaxed tracking-[0.1em] sm:tracking-[0.18em] md:tracking-[0.25em]',
	md: 'px-2.5 py-2 sm:px-4 sm:py-3 gap-1 sm:gap-2 text-xs leading-[1.4] sm:leading-relaxed tracking-[0.1em] sm:tracking-[0.18em] md:tracking-[0.3em]',
	lg: 'px-3 py-2.5 sm:px-5 sm:py-3.5 md:px-6 md:py-4 gap-1.5 sm:gap-2.5 md:gap-3 text-xs sm:text-sm leading-[1.4] sm:leading-relaxed tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.35em]',
}

const shadowClasses: Record<PillShadow, string> = {
	none: '',
	sm: 'shadow-sm',
	lg: 'shadow-lg',
}

const fontWeightClasses: Record<NonNullable<PillProps['fontWeight']>, string> = {
	medium: 'font-medium',
	semibold: 'font-semibold',
}

export default function Pill({
	children,
	tone = 'brand',
	size = 'md',
	shadow = 'none',
	icon,
	fontWeight = 'semibold',
	className,
}: PillProps) {
		return (
		<span
			className={classNames(
				// Base styles - always center items vertically for consistent icon alignment
				// Use flex-nowrap to keep icon and text side-by-side (they never wrap apart)
				'inline-flex items-center flex-nowrap rounded-full',
				// Smooth transitions
				'transition-colors duration-150',
				// Minimum width to prevent awkwardly narrow pills on tiny screens
				'min-w-fit',
				// Size and spacing (includes responsive typography)
				sizeClasses[size],
				// Font weight
				fontWeightClasses[fontWeight],
				// Color tone
				toneClasses[tone],
				// Shadow
				shadowClasses[shadow],
				// Custom overrides
				className
			)}
		>
			{icon && (
				// Icon wrapper: Always centered vertically, never wraps away from text
				// shrink-0 prevents icon from shrinking
				// items-center ensures icon stays vertically centered
				<span className="flex shrink-0 items-center text-current">
					{icon}
				</span>
			)}
			{/* Text wrapper: Can wrap internally, but stays next to icon */}
			{/* min-w-0 allows text to shrink below content width for proper wrapping on small screens */}
			{/* break-words allows breaking long words for even distribution */}
			<span className="text-current leading-inherit whitespace-normal break-words uppercase min-w-0">
				{children}
			</span>
		</span>
	)
}

