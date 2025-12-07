/**
 * Logo UI Component
 * 
 * MedSource brand logo component with purple square icon and optional text.
 * 
 * **Features:**
 * - Size variants (xs, sm, md, lg, xl)
 * - Optional text display
 * - Automatic Link wrapper when href is provided
 * - Hover animations
 * - Theme-aware (DaisyUI)
 * - Fully accessible
 * 
 * @example
 * ```tsx
 * // Icon only
 * <Logo />
 * 
 * // With text
 * <Logo showText />
 * 
 * // As link (href automatically wraps in Link)
 * <Logo href="/" showText size="lg" />
 * 
 * // With click handler
 * <Logo href="/" onClick={handleClick} showText />
 * ```
 * 
 * @module Logo
 */

'use client'

import Link from 'next/link'

import classNames from 'classnames'

/**
 * Logo size variants with corresponding dimensions.
 */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Logo component props interface.
 */
export interface LogoProps {
	/** Size variant. @default 'md' */
	size?: LogoSize
	
	/** Display "MedSource" text alongside icon. @default false */
	showText?: boolean
	
	/** URL for link. When provided, automatically wraps in Next.js Link. */
	href?: string
	
	/** Click handler. */
	onClick?: (event?: React.MouseEvent<HTMLElement>) => void
	
	/** Show hover effects. @default true */
	interactive?: boolean
	
	/** Custom className for container. */
	className?: string
	
	/** Custom className for icon container. */
	iconClassName?: string
	
	/** Custom className for text. */
	textClassName?: string
	
	/** Custom text instead of "MedSource". */
	customText?: string
	
	/** Hide text on mobile. @default false */
	hideTextOnMobile?: boolean
}

/**
 * Size-specific class mappings for icon container.
 * Defines width, height, and ensures minimum touch target (44x44px for accessibility).
 * Uses rounded-md for consistency with Button component.
 */
const iconSizeClasses: Record<LogoSize, string> = {
	xs: 'w-6 h-6 min-w-[24px] min-h-[24px]',        // 24px (compact)
	sm: 'w-8 h-8 min-w-[32px] min-h-[32px]',        // 32px (mobile)
	md: 'w-10 h-10 min-w-[40px] min-h-[40px]',      // 40px (default)
	lg: 'w-12 h-12 min-w-[44px] min-h-[44px]',     // 48px (WCAG touch target)
	xl: 'w-16 h-16 min-w-[64px] min-h-[64px]',      // 64px (hero)
}

/**
 * Size-specific class mappings for icon letter (M).
 * Defines font size and weight with proper line-height.
 */
const letterSizeClasses: Record<LogoSize, string> = {
	xs: 'text-xs font-bold leading-none',      // 12px
	sm: 'text-sm font-bold leading-none',      // 14px
	md: 'text-base font-bold leading-none',    // 16px
	lg: 'text-lg font-bold leading-none',      // 18px
	xl: 'text-xl font-bold leading-none',      // 20px
}

/**
 * Size-specific class mappings for text label.
 * Industry-leading brand typography: bold, prominent, powerful.
 * Mobile-first: scales responsively with larger base sizes for impact.
 * 
 * Typography principles (Apple, Stripe, Linear, Google):
 * - Bold font weight (700) for authority
 * - Larger sizes for prominence
 * - Tight letter spacing for modern elegance
 * - Proper line-height for visual weight
 */
const textSizeClasses: Record<LogoSize, string> = {
	xs: 'text-sm sm:text-base font-bold tracking-tight leading-tight',      // 14px → 16px
	sm: 'text-base sm:text-lg font-bold tracking-tight leading-tight',       // 16px → 18px
	md: 'text-lg sm:text-xl font-bold tracking-tight leading-tight',         // 18px → 20px
	lg: 'text-xl sm:text-2xl font-bold tracking-tight leading-tight',         // 20px → 24px
	xl: 'text-2xl sm:text-3xl font-bold tracking-tight leading-tight',       // 24px → 30px
}

/**
 * Logo Component
 * 
 * MedSource brand logo with purple square icon containing "M" letter.
 * Automatically renders as Link when href is provided.
 * 
 * @param props - Logo component props
 * @returns Logo component
 */
export default function Logo({
	size = 'md',
	showText = false,
	href,
	onClick,
	interactive = true,
	className,
	iconClassName,
	textClassName,
	customText,
	hideTextOnMobile = false,
}: LogoProps) {
	// Icon container: theme-aware, accessible, with smooth transitions
	const iconContainerClasses = classNames(
		// Base styles
		'bg-primary rounded-md flex items-center justify-center text-primary-content',
		'shrink-0', // Prevent icon from shrinking
		// Size
		iconSizeClasses[size],
		// Interactive states (only when interactive is true)
		// Industry best practice: explicit base scale ensures proper state reset
		interactive && [
			'scale-100', // Explicit base state - ensures return to normal after click/hover ends
			'transition-transform duration-300 ease-out',
			'group-hover:scale-105', // Hover state
			'group-active:scale-95', // Active only during click (brief moment, auto-resets on release)
		],
		iconClassName
	)

	// Text label: powerful brand typography, responsive, accessible
	const textClasses = classNames(
		// Base styles
		'text-base-content whitespace-nowrap', // Prevent text wrapping
		// Size and typography (bold, tight tracking for modern power)
		textSizeClasses[size],
		// Mobile-first: hide on mobile if specified
		hideTextOnMobile && 'hidden sm:inline',
		textClassName
	)

	// Container: flex layout with proper spacing and interaction states
	const containerClasses = classNames(
		// Base layout
		'inline-flex items-center gap-2 sm:gap-3', // Responsive gap: 8px mobile, 12px desktop
		// Interactive states with proper state hierarchy
		// Industry best practice: explicit base state ensures proper state reset
		interactive && [
			'opacity-100', // Explicit base state - ensures return to normal after click/hover ends
			'transition-opacity duration-300 ease-out',
			'hover:opacity-80', // Hover state
			'active:opacity-70', // Active only during click (brief moment, auto-resets on release)
		],
		// Focus states for keyboard navigation (accessibility)
		(href || onClick) && [
			'focus-visible:outline-none',
			'focus-visible:ring-2 focus-visible:ring-offset-2',
			'focus-visible:ring-primary/30',
			'focus-visible:rounded-md', // Match icon border radius
		],
		// Cursor
		(href || onClick) && 'cursor-pointer',
		// Touch target: ensure minimum 44px height for accessibility
		(href || onClick) && 'min-h-[44px]',
		className
	)

	const logoContent = (
		<>
			<div className={iconContainerClasses} aria-hidden="true">
				<span className={letterSizeClasses[size]}>M</span>
			</div>
			{showText && (
				<span className={textClasses}>
					{customText ?? 'MedSource'}
				</span>
			)}
		</>
	)

	// Render as Link if href is provided
	if (href) {
		return (
			<Link
				href={href}
				className={containerClasses}
				onClick={onClick}
				aria-label="MedSource - Go to home page"
			>
				{logoContent}
			</Link>
		)
	}

	// Render as clickable div if onClick is provided
	if (onClick) {
		return (
			<div
				className={classNames(containerClasses, 'cursor-pointer')}
				onClick={onClick}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						onClick()
					}
				}}
				aria-label="MedSource logo"
			>
				{logoContent}
			</div>
		)
	}

	// Render as static div
	return (
		<div className={containerClasses} aria-label="MedSource logo">
			{logoContent}
		</div>
	)
}
