/**
 * Reveal Animation Component
 * 
 * Scroll-triggered reveal animation that respects reduced motion preferences.
 * FAANG-level implementation with accessibility, performance, and DRY principles.
 * 
 * **Features:**
 * - Intersection Observer API for performant scroll detection
 * - Multiple animation variants (fade, slide, scale, blur)
 * - Respects prefers-reduced-motion (system + user override)
 * - Optimized with useMemo and useCallback
 * - Type-safe with no type casting
 * - Uses CSS custom properties for easing
 * 
 * **Accessibility:**
 * - WCAG 2.1 AAA compliance for motion
 * - Instant reveal for reduced motion users
 * - No vestibular triggers
 * 
 * **Performance:**
 * - GPU-accelerated transforms (opacity, scale, transform)
 * - will-change hints for browser optimization
 * - Efficient intersection observer
 * 
 * @module components/common/animations/Reveal
 */

'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useMemo, useEffect, useState, type ReactNode } from 'react'
import classNames from 'classnames'
import { logger } from '@_core'
import {
	getAnimationVariants,
	checkReducedMotion,
	REDUCED_MOTION_VARIANTS,
	ANIMATION_EASING,
	type BaseAnimationProps,
} from './types'

export interface RevealProps extends BaseAnimationProps {
	/** Content to animate */
	children: ReactNode
	/** Easing curve key */
	easing?: keyof typeof ANIMATION_EASING
}

/**
 * Reveal Component
 * 
 * Animates children into view when they enter the viewport.
 * Respects reduced motion preferences for accessibility.
 * 
 * @example
 * ```tsx
 * <Reveal variant="fade" delay={0.2} duration={0.5}>
 *   <div>Content that fades in</div>
 * </Reveal>
 * 
 * <Reveal variant="slide" direction="up" distance={30}>
 *   <div>Content that slides up</div>
 * </Reveal>
 * 
 * <Reveal variant="scale" once={false}>
 *   <div>Content that scales in (repeats)</div>
 * </Reveal>
 * ```
 */
export default function Reveal({
	children,
	variant = 'fade',
	direction = 'up',
	delay = 0,
	duration = 0.5,
	distance = 20,
	threshold = 0.2,
	once = true,
	className,
	width = '100%',
	easing = 'smooth',
}: RevealProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

	// Check reduced motion preference (system + user override)
	useEffect(() => {
		if (typeof window === 'undefined') return

		// Initial check
		setPrefersReducedMotion(checkReducedMotion())

		// Listen to system preference changes
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => {
			setPrefersReducedMotion(checkReducedMotion())
		}

		// Listen to user override changes (data-reduced-motion attribute)
		const observer = new MutationObserver(handleChange)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-reduced-motion'],
		})

		mediaQuery.addEventListener('change', handleChange)

		return () => {
			mediaQuery.removeEventListener('change', handleChange)
			observer.disconnect()
		}
	}, [])

	// Use Intersection Observer to detect when element is in view
	// Type-safe: No need for 'as' casting
	const isInView = useInView(ref, {
		once,
		amount: threshold,
	})

	// Memoize variants to prevent recreation on every render
	// FAANG optimization: Expensive calculations cached
	const animationVariants = useMemo(() => {
		try {
			// Use instant reveal for reduced motion users
			if (prefersReducedMotion) {
				return REDUCED_MOTION_VARIANTS
			}

			return getAnimationVariants(variant, direction, distance, easing)
		} catch (error) {
			// FAANG best practice: Log animation errors
			logger.error('Reveal - Failed to create animation variants', {
				component: 'Reveal',
				variant,
				direction,
				distance,
				easing,
				error,
			})
			// Fallback to reduced motion variants on error
			return REDUCED_MOTION_VARIANTS
		}
	}, [variant, direction, distance, easing, prefersReducedMotion])

	// Memoize transition config
	const transition = useMemo(
		() => ({
			duration: prefersReducedMotion ? 0.001 : duration,
			delay: prefersReducedMotion ? 0 : delay,
		}),
		[duration, delay, prefersReducedMotion]
	)

	// Memoize will-change hint for performance
	// GPU acceleration for transform and opacity
	const style = useMemo(
		() => ({
			width,
			willChange: isInView ? 'auto' : 'opacity, transform',
		}),
		[width, isInView]
	)

	return (
		<motion.div
			ref={ref}
			variants={animationVariants}
			initial="hidden"
			animate={isInView ? 'visible' : 'hidden'}
			transition={transition}
			className={classNames(className)}
			style={style}
		>
			{children}
		</motion.div>
	)
}
