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
import classNames from 'classnames'

export interface ScrollRevealCardProps {
	/** Child component to wrap (typically ProductCard) */
	children: React.ReactNode
	/** Index for staggered animation (0-based) */
	index?: number
	/** Custom className */
	className?: string
	/** Stagger delay in milliseconds (default: 100ms) */
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
export default function ScrollRevealCard({
	children,
	index = 0,
	className = '',
	staggerDelay = 100,
	enabled = true,
}: ScrollRevealCardProps) {
	const { ref, hasAnimated } = useScrollReveal({
		threshold: 0.1,
		rootMargin: '0px 0px -100px 0px', // Trigger 100px before entering viewport
		staggerDelay,
		index,
		enabled,
	})

	// Memoize classes to prevent unnecessary re-renders
	const cardClasses = useMemo(
		() =>
			classNames(
				{
					'opacity-0 translate-y-10 scale-95': !hasAnimated,
					'animate-fall-in': hasAnimated,
				},
				className
			),
		[hasAnimated, className]
	)

	// Wrap children in a div with the animation classes and ref
	// Note: animationDelay is handled by the hook's internal stagger logic
	return (
		<div ref={ref} className={cardClasses}>
			{children}
		</div>
	)
}

