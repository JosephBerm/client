/**
 * Stagger Animation Component
 * 
 * Container for staggered entrance animations with reduced motion support.
 * FAANG-level implementation following Apple/Stripe patterns.
 * 
 * **Features:**
 * - Staggered child animations (cascade effect)
 * - Intersection Observer for scroll triggering
 * - Respects prefers-reduced-motion
 * - DRY principle with shared variant logic
 * - Type-safe implementation
 * 
 * **Usage Pattern:**
 * Use `Stagger` as a container with `StaggerItem` children.
 * Items will animate in sequence with configurable delay.
 * 
 * **Accessibility:**
 * - Instant reveal for reduced motion users
 * - No vestibular triggers
 * - WCAG 2.1 AAA compliant
 * 
 * @module components/common/animations/Stagger
 */

'use client'

import { motion, useInView, type Variants } from 'framer-motion'
import { useRef, useMemo, useEffect, useState, type ReactNode } from 'react'
import classNames from 'classnames'
import {
	getAnimationVariants,
	checkReducedMotion,
	REDUCED_MOTION_VARIANTS,
	type AnimationVariant,
	type AnimationDirection,
} from './types'

/**
 * Stagger Container Props
 */
export interface StaggerProps {
	/** Children to animate (should be StaggerItem components) */
	children: ReactNode
	/** Delay between each child animation in seconds (default: 0.1) */
	staggerDelay?: number
	/** Initial delay before starting animations in seconds */
	delay?: number
	/** Threshold (0-1) of visibility to trigger animations */
	threshold?: number
	/** Custom CSS class names */
	className?: string
	/** Whether to trigger only once */
	once?: boolean
	/** Width of the container */
	width?: string
}

/**
 * Stagger Container Component
 * 
 * Coordinates staggered animations for child StaggerItem components.
 * 
 * @example
 * ```tsx
 * <Stagger staggerDelay={0.15} delay={0.2}>
 *   <StaggerItem>Item 1</StaggerItem>
 *   <StaggerItem>Item 2</StaggerItem>
 *   <StaggerItem>Item 3</StaggerItem>
 * </Stagger>
 * ```
 */
export default function Stagger({
	children,
	staggerDelay = 0.1,
	delay = 0,
	threshold = 0.2,
	className,
	once = true,
	width = '100%',
}: StaggerProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

	// Check reduced motion preference
	useEffect(() => {
		if (typeof window === 'undefined') return

		setPrefersReducedMotion(checkReducedMotion())

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => {
			setPrefersReducedMotion(checkReducedMotion())
		}

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

	const isInView = useInView(ref, {
		once,
		amount: threshold,
	})

	// Container variants with stagger configuration
	const containerVariants: Variants = useMemo(
		() => ({
		hidden: {},
		visible: {
			transition: {
					// Instant for reduced motion, staggered otherwise
					staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
					delayChildren: prefersReducedMotion ? 0 : delay,
			},
		},
		}),
		[staggerDelay, delay, prefersReducedMotion]
	)

	const style = useMemo(() => ({ width }), [width])

	return (
		<motion.div
			ref={ref}
			variants={containerVariants}
			initial="hidden"
			animate={isInView ? 'visible' : 'hidden'}
			className={className}
			style={style}
		>
			{children}
		</motion.div>
	)
}

/**
 * Stagger Item Props
 */
export interface StaggerItemProps {
	/** Content to animate */
	children: ReactNode
	/** Custom CSS class names */
	className?: string
	/** Animation variant (default: 'fade') */
	variant?: AnimationVariant
	/** Direction for slide animations */
	direction?: AnimationDirection
	/** Distance to travel in pixels */
	distance?: number
	/** Width override */
	width?: string
}

/**
 * Stagger Item Component
 * 
 * Individual item within a Stagger container.
 * Inherits animation timing from parent Stagger component.
 * 
 * @example
 * ```tsx
 * <StaggerItem variant="fade">
 *   <div>Fades in</div>
 * </StaggerItem>
 * 
 * <StaggerItem variant="slide" direction="up" distance={30}>
 *   <div>Slides up</div>
 * </StaggerItem>
 * ```
 */
export function StaggerItem({
	children,
	className,
	variant = 'fade',
	direction = 'up',
	distance = 20,
	width,
}: StaggerItemProps) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

	// Check reduced motion preference
	useEffect(() => {
		if (typeof window === 'undefined') return

		setPrefersReducedMotion(checkReducedMotion())

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => {
			setPrefersReducedMotion(checkReducedMotion())
		}

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

	// Memoize variants (DRY: Uses shared utility)
	const itemVariants = useMemo(() => {
		if (prefersReducedMotion) {
			return REDUCED_MOTION_VARIANTS
		}

		return getAnimationVariants(variant, direction, distance, 'smooth')
	}, [variant, direction, distance, prefersReducedMotion])

	const style = useMemo(() => ({ width }), [width])

	return (
		<motion.div variants={itemVariants} className={classNames(className)} style={style}>
			{children}
		</motion.div>
	)
}
