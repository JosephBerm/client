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

import { useMemo, useEffect, useState } from 'react'

import classNames from 'classnames'

import { useGridColumns } from '@_shared/hooks/useGridColumns'
import { useScrollReveal } from '@_shared/hooks/useScrollReveal'

export interface ScrollRevealCardProps {
	/** Child component to wrap (typically ProductCard) */
	children: React.ReactNode
	/** Index for staggered animation (0-based) */
	index?: number
	/** Custom className */
	className?: string
	/** Stagger delay in milliseconds (default: 50ms for smooth cascade) */
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
 * FAANG-level approach: Overlapping cascading animations with natural flow
 * Creates fluid, organic appearance similar to Apple/Stripe/Linear product pages
 * 
 * Grid layout:
 * - Mobile (< 768px): 1 column
 * - Tablet (768px - 1279px): 2 columns  
 * - Desktop (≥ 1280px): 3 columns
 * 
 * Staggering strategy (FAANG best practice):
 * - Base stagger: 50ms between cards (Apple standard: 40-60ms)
 * - Creates smooth waterfall effect with natural flow
 * - No artificial row gaps - animations overlap organically
 * - Result: Fluid, continuous cascade instead of rigid row-by-row
 */
function calculateRowAwareIndex(index: number, columnsPerRow: number, staggerDelay: number): number {
	const row = Math.floor(index / columnsPerRow)
	const _positionInRow = index % columnsPerRow
	
	// FAANG pattern: Simple linear stagger with slight row emphasis
	// Each card delays by base amount (50ms), with subtle row multiplier
	// This creates natural flow without rigid row boundaries
	// Row multiplier (1.2x) adds gentle visual grouping without breaking flow
	const BASE_STAGGER = 50 // ms - Apple/Stripe standard for smooth cascade
	const _ROW_MULTIPLIER = 1.2 // Subtle emphasis on row grouping
	
	// Calculate continuous delay with subtle row emphasis
	const linearDelay = index * BASE_STAGGER
	const rowEmphasis = row * (BASE_STAGGER * 0.2) // 20% extra per row for grouping
	
	// Return combined delay (will be divided by staggerDelay in hook)
	return Math.round((linearDelay + rowEmphasis) / staggerDelay)
}

export default function ScrollRevealCard({
	children,
	index = 0,
	className = '',
	staggerDelay = 50, // Optimized for smooth cascade (Apple/Stripe standard)
	enabled = true,
}: ScrollRevealCardProps) {
	// FAANG optimization: Use shared hook to calculate columns
	// This reduces from 2 useMediaQuery calls per card to shared state
	// Significantly more efficient for 20+ product cards
	// Single media query listener instead of 40+ listeners
	const columnsPerRow = useGridColumns()
	
	// Calculate isDesktop for rootMargin calculation
	// Note: This could be further optimized by passing rootMargin as prop
	// For now, this is acceptable as it's only used for rootMargin calculation
	const _isDesktop = useMemo(() => columnsPerRow === 3, [columnsPerRow])
	
	// Calculate row-aware animation index for elegant staggering
	const animationIndex = useMemo(
		() => calculateRowAwareIndex(index, columnsPerRow, staggerDelay),
		[index, columnsPerRow, staggerDelay]
	)
	
	// Responsive rootMargin: Trigger animations BEFORE elements enter viewport
	// FAANG best practice (Apple/Stripe): Anticipatory animations for smooth perceived performance
	// Positive bottom margin = trigger X pixels BEFORE element enters viewport
	// This creates fluid experience where content animates as you scroll toward it
	// 
	// Desktop: 200px anticipation (larger viewport, more scroll momentum)
	// Mobile/Tablet: 150px anticipation (smaller viewport, compensates for touch scrolling)
	const rootMargin = useMemo(() => {
		// During SSR, default to mobile (more conservative)
		if (typeof window === 'undefined') {return '0px 0px 150px 0px'}
		
		// Desktop (3 columns): Earlier trigger (200px BEFORE viewport entry)
		// Animations start as user scrolls toward content, not after it's visible
		if (columnsPerRow === 3) {
			return '0px 0px 200px 0px'
		}
		
		// Mobile/Tablet (1-2 columns): Earlier trigger (150px BEFORE viewport entry)
		// Slightly less aggressive on mobile but still anticipatory
		return '0px 0px 150px 0px'
	}, [columnsPerRow])
	
	// Industry best practice: First 10 products animate elegantly on initial load
	// FAANG pattern: Above-the-fold content should have smooth entrance animations
	// This ensures content is visible immediately while maintaining premium feel
	// Improves perceived performance and SEO (content visible on initial load)
	const shouldAnimateOnMount = index < 10
	
	// State for mount-triggered animations (first 10 products)
	// FAANG approach: Use state to trigger animation after mount with proper stagger
	const [hasMounted, setHasMounted] = useState(false)
	
	// For products after index 10, use intersection observer for scroll-triggered animation
	const { ref, hasAnimated: hasScrollAnimated } = useScrollReveal({
		threshold: 0.1,
		rootMargin, // Responsive: Larger on mobile for earlier reveal
		staggerDelay, // Base delay multiplier
		index: animationIndex, // Row-aware index for elegant staggering
		enabled: enabled && !shouldAnimateOnMount, // Only use scroll animation for products after index 10
	})
	
	// FAANG pattern: Trigger elegant row-by-row animation on mount for first 10 products
	// Industry best practice: True row-by-row cascade with proper timing
	// Apple/Netflix approach: Complete one row before starting the next for elegant flow
	// Animation duration: 750ms (from elegant-reveal animation)
	useEffect(() => {
		if (!shouldAnimateOnMount || !enabled) {return}
		
		// Check for reduced motion preference (accessibility)
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (prefersReducedMotion) {
			// For reduced motion: Show immediately without animation
			setHasMounted(true)
			return
		}
		
		// Calculate row and position for this card
		const row = Math.floor(index / columnsPerRow)
		const _positionInRow = index % columnsPerRow
		
		// FAANG best practice: Overlapping cascade with natural flow
		// Apple/Stripe pattern: Each card starts before previous finishes
		// Creates fluid waterfall effect instead of rigid row-by-row
		// 
		// Example (3 columns, 600ms animation, 80ms stagger):
		// Card 0: 0ms    → animates 0-600ms
		// Card 1: 80ms   → animates 80-680ms (overlap: 520ms)
		// Card 2: 160ms  → animates 160-760ms (overlap: 440ms)
		// Card 3: 280ms  → animates 280-880ms (slight row pause: 40ms)
		// 
		// Result: Smooth cascade with subtle row emphasis, not mechanical steps
		const _ANIMATION_DURATION = 600 // ms - matches elegant-reveal (snappier, Apple standard)
		const BASE_STAGGER = 80 // ms - smooth cascade (Apple: 60-100ms for fluidity)
		const ROW_EMPHASIS = 40 // ms - subtle extra delay per row (creates gentle grouping)
		
		// Calculate overlapping delays for natural flow
		// Linear progression with subtle row emphasis (not rigid row waits)
		const cardDelay = index * BASE_STAGGER
		const rowEmphasisDelay = row * ROW_EMPHASIS
		const totalDelay = cardDelay + rowEmphasisDelay
		
		// Minimal initial delay for snappier feel (FAANG pattern: 50-100ms)
		// Just enough for DOM ready + browser paint optimization
		const INITIAL_DELAY = 60
		const timeoutId = setTimeout(() => {
			setHasMounted(true)
		}, INITIAL_DELAY + totalDelay)
		
		return () => clearTimeout(timeoutId)
	}, [shouldAnimateOnMount, enabled, index, columnsPerRow])
	
	// Determine effective animation state
	// First 10: Use mount-triggered animation
	// After 10: Use scroll-triggered animation
	const effectiveHasAnimated = shouldAnimateOnMount ? hasMounted : hasScrollAnimated

	// Memoize classes to prevent unnecessary re-renders
	// FAANG-level approach: Start with hidden state, animate to visible
	// PERFORMANCE: willChange hint for GPU acceleration during animation
	// Apple/Stripe pattern: Same elegant animation for both mount and scroll triggers
	const cardClasses = useMemo(
		() =>
			classNames(
				{
					// Initial state: Matches keyframe 0% for seamless animation start
					// Apple standard: Subtle transforms + blur for depth and premium feel
					// translateY(20px) scale(0.95) blur(8px) opacity(0)
					'opacity-0 translate-y-5 scale-95 blur-[8px]': !effectiveHasAnimated,
					// Animated state: Spring-like reveal with natural bounce
					// Same elegant-reveal animation for both mount and scroll triggers
					// Creates cohesive, fluid experience (FAANG pattern)
					'animate-elegant-reveal': effectiveHasAnimated,
				},
				className
			),
		[effectiveHasAnimated, className]
	)
	
	// Performance optimization: Remove willChange after animation completes
	// This prevents unnecessary GPU layer retention
	// FAANG best practice: Only apply willChange during active animation
	const style = useMemo(() => {
		if (!effectiveHasAnimated) {
			return { willChange: 'transform, opacity, filter' } as React.CSSProperties
		}
		return {} as React.CSSProperties
	}, [effectiveHasAnimated])

	// Wrap children in a div with the animation classes and ref
	// Note: animationDelay for first 10 is handled by useEffect stagger logic
	// Note: animationDelay for products after 10 is handled by hook's internal stagger logic
	// CRITICAL: We wrap in div because ProductCard is a Link, and we can't modify it directly
	// The wrapper preserves all Link functionality while adding animation
	// ACCESSIBILITY: The wrapper div doesn't interfere with Link's keyboard navigation or focus
	// FAANG pattern: First 10 use mount-triggered animation, rest use scroll-triggered
	// This creates elegant flow: Above-fold animates on load, below-fold animates on scroll
	return (
		<div ref={shouldAnimateOnMount ? undefined : ref} className={cardClasses} style={style}>
			{children}
		</div>
	)
}

