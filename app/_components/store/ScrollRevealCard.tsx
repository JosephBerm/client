/**
 * ScrollRevealCard Component
 * 
 * Wrapper component that adds scroll-triggered reveal animations to Product cards.
 * Cards "fall" into place beautifully as they enter the viewport, one at a time.
 * 
 * **Features:**
 * - Uses Intersection Observer for performant scroll detection
 * - Staggered animations (one card at a time)
 * - Respects reduced motion preferences (accessibility)
 * - Row-by-row animation support
 * - Smooth fall-in animation
 * 
 * **Industry Best Practices:**
 * - FAANG-level: Intersection Observer for performance
 * - Accessibility: Respects prefers-reduced-motion
 * - Performance: Efficient observer management
 * - Mobile-first: Works seamlessly on all devices
 * 
 * @module store/ScrollRevealCard
 */

'use client'

import { useMemo } from 'react'
import { useScrollReveal } from '@_shared/hooks/useScrollReveal'
import { useMediaQuery } from '@_shared/hooks'
import classNames from 'classnames'

export interface ScrollRevealCardProps {
	/** Child component to wrap (typically ProductCard) */
	children: React.ReactNode
	/** Index for staggered animation (0-based) */
	index?: number
	/** Custom className */
	className?: string
	/** Stagger delay in milliseconds (default: 60ms base multiplier) */
	staggerDelay?: number
	/** Whether animations are enabled (default: true) */
	enabled?: boolean
}

/**
 * ScrollRevealCard Component
 * 
 * Wraps a Product card with scroll-triggered reveal animation.
 * Cards animate in as they enter the viewport with a beautiful fall-in effect.
 * 
 * @param props - Component props
 * @returns Wrapped component with scroll reveal animation
 * 
 * @example
 * ```tsx
 * <ScrollRevealCard index={0} staggerDelay={100}>
 *   <ProductCard product={product} />
 * </ScrollRevealCard>
 * ```
 */
/**
 * Calculate row-aware animation index for elegant staggered reveals
 * Industry-leading approach: Cards in same row animate together, then next row
 * Creates cohesive, polished appearance similar to Apple/Stripe product pages
 * 
 * Grid layout:
 * - Mobile (< 768px): 1 column
 * - Tablet (768px - 1279px): 2 columns  
 * - Desktop (≥ 1280px): 3 columns
 * 
 * Staggering strategy:
 * - Row delay: 120ms between rows (creates clear row separation, slower pace)
 * - Within-row delay: 60ms between cards in same row (more deliberate, elegant)
 */
function calculateRowAwareIndex(index: number, columnsPerRow: number, staggerDelay: number): number {
	const row = Math.floor(index / columnsPerRow)
	const positionInRow = index % columnsPerRow
	
	// Calculate delay: row-based (120ms) + position within row (60ms)
	// This creates elegant row-by-row reveals with more deliberate, slower staggering
	// The staggerDelay parameter is used as a multiplier for fine-tuning
	const rowDelay = row * 120 // 120ms delay between rows (slower, more deliberate)
	const positionDelay = positionInRow * 60 // 60ms delay within row (slower pace)
	
	// Return combined delay in milliseconds (will be divided by staggerDelay in hook)
	return Math.round((rowDelay + positionDelay) / staggerDelay)
}

export default function ScrollRevealCard({
	children,
	index = 0,
	className = '',
	staggerDelay = 60,
	enabled = true,
}: ScrollRevealCardProps) {
	// OPTIMIZATION: Calculate columns once per card (acceptable overhead)
	// Alternative: Pass columnsPerRow as prop from parent grid (better for 50+ items)
	// For typical use case (<50 products), this is acceptable
	const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)')
	const isDesktop = useMediaQuery('(min-width: 1280px)')
	
	// Calculate columns per row based on viewport
	// SSR-safe: Defaults to 1 (mobile) during SSR, updates on client
	const columnsPerRow = useMemo(() => {
		// During SSR or initial render, default to mobile (1 column)
		if (typeof window === 'undefined') return 1
		
		if (isDesktop) return 3 // xl:grid-cols-3
		if (isTablet) return 2  // md:grid-cols-2
		return 1 // grid-cols-1 (mobile)
	}, [isTablet, isDesktop])
	
	// Calculate row-aware animation index for elegant staggering
	const animationIndex = useMemo(
		() => calculateRowAwareIndex(index, columnsPerRow, staggerDelay),
		[index, columnsPerRow, staggerDelay]
	)
	
	// Responsive rootMargin: Larger on mobile to trigger earlier (better UX on small screens)
	// Mobile viewports are smaller (typically 600-800px), so we need more margin to trigger before cards are visible
	// This ensures cards start animating earlier on mobile, creating a smoother, more responsive feel
	// Desktop: 100px is sufficient (larger viewport, more scroll space)
	// Mobile/Tablet: 200px provides better early trigger (smaller viewport, faster scroll)
	const rootMargin = useMemo(() => {
		// During SSR, default to mobile (more conservative, prevents layout shift)
		if (typeof window === 'undefined') return '0px 0px -200px 0px'
		
		// Desktop (≥ 1280px): Standard trigger (100px before viewport)
		if (isDesktop) {
			return '0px 0px -100px 0px'
		}
		
		// Mobile/Tablet (< 1280px): Earlier trigger (200px before viewport)
		// This compensates for smaller viewport height and faster mobile scrolling
		return '0px 0px -200px 0px'
	}, [isDesktop])
	
	const { ref, hasAnimated } = useScrollReveal({
		threshold: 0.1,
		rootMargin, // Responsive: Larger on mobile for earlier reveal
		staggerDelay, // Base delay multiplier
		index: animationIndex, // Row-aware index for elegant staggering
		enabled,
	})

	// Memoize classes to prevent unnecessary re-renders
	// Industry-leading approach: Start with hidden state, animate to visible
	// PERFORMANCE: willChange hint for GPU acceleration during animation
	const cardClasses = useMemo(
		() =>
			classNames(
				{
					// Initial state: Hidden with elegant positioning
					// Subtle blur and scale create premium, sophisticated feel
					// willChange optimization: Only active during animation
					'opacity-0 translate-y-6 scale-[0.96] blur-sm': !hasAnimated,
					// Animated state: Beautiful reveal with premium easing
					'animate-elegant-reveal': hasAnimated,
				},
				className
			),
		[hasAnimated, className]
	)
	
	// Performance optimization: Remove willChange after animation completes
	// This prevents unnecessary GPU layer retention
	const style = useMemo(() => {
		if (!hasAnimated) {
			return { willChange: 'transform, opacity, filter' } as React.CSSProperties
		}
		return {} as React.CSSProperties
	}, [hasAnimated])

	// Wrap children in a div with the animation classes and ref
	// Note: animationDelay is handled by the hook's internal stagger logic
	// CRITICAL: We wrap in div because ProductCard is a Link, and we can't modify it directly
	// The wrapper preserves all Link functionality while adding animation
	// ACCESSIBILITY: The wrapper div doesn't interfere with Link's keyboard navigation or focus
	return (
		<div ref={ref} className={cardClasses} style={style}>
			{children}
		</div>
	)
}

