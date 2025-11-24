/**
 * Animation Types & Utilities
 * 
 * Shared types and utilities for animation components.
 * FAANG-level: DRY principle, type safety, performance optimization.
 * 
 * @module components/common/animations/types
 */

import type { Variants } from 'framer-motion'

/**
 * Animation variant types
 */
export type AnimationVariant = 'fade' | 'slide' | 'scale' | 'blur'

/**
 * Animation direction (for slide variant)
 */
export type AnimationDirection = 'up' | 'down' | 'left' | 'right'

/**
 * Common animation props shared across components
 */
export interface BaseAnimationProps {
	/** Animation variant style */
	variant?: AnimationVariant
	/** Direction of movement (for slide variant) */
	direction?: AnimationDirection
	/** Delay in seconds before animation starts */
	delay?: number
	/** Duration of animation in seconds */
	duration?: number
	/** Distance to travel in pixels (for slide/fade variants) */
	distance?: number
	/** Threshold (0-1) of element visibility to trigger animation */
	threshold?: number
	/** Whether animation triggers only once (on first view) */
	once?: boolean
	/** Custom CSS class names */
	className?: string
	/** Width of the container */
	width?: string
}

/**
 * Animation easing presets from globals.css
 * Industry standard: Reference CSS custom properties for consistency
 */
export const ANIMATION_EASING = {
	/** Default easing: cubic-bezier(0.645, 0.045, 0.355, 1) - Smooth, natural */
	default: [0.645, 0.045, 0.355, 1] as const,
	/** Smooth easing: cubic-bezier(0.4, 0, 0.2, 1) - Material Design standard */
	smooth: [0.4, 0, 0.2, 1] as const,
	/** Bounce easing: cubic-bezier(0.68, -0.55, 0.265, 1.55) - Playful overshoot */
	bounce: [0.68, -0.55, 0.265, 1.55] as const,
	/** Spring easing: cubic-bezier(0.34, 1.56, 0.64, 1) - Apple-inspired natural spring */
	spring: [0.34, 1.56, 0.64, 1] as const,
	/** Original About page easing: cubic-bezier(0.25, 0.1, 0.25, 1) - Custom smooth */
	aboutHero: [0.25, 0.1, 0.25, 1] as const,
	/** EaseOut: cubic-bezier(0, 0, 0.2, 1) - CSS ease-out equivalent */
	easeOut: [0, 0, 0.2, 1] as const,
} as const

/**
 * Generate Framer Motion variants for animations
 * FAANG-level: Centralized logic, DRY principle, type-safe
 * 
 * @param variant - Animation variant type
 * @param direction - Movement direction (for slide variant)
 * @param distance - Travel distance in pixels
 * @param easing - Easing curve (defaults to 'smooth')
 * @returns Framer Motion variants object
 */
export function getAnimationVariants(
	variant: AnimationVariant,
	direction: AnimationDirection = 'up',
	distance: number = 20,
	easing: keyof typeof ANIMATION_EASING = 'smooth'
): Variants {
	const easingCurve = ANIMATION_EASING[easing]

	switch (variant) {
		case 'slide': {
			const x = direction === 'left' ? distance : direction === 'right' ? -distance : 0
			const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0
			return {
				hidden: { opacity: 0, x, y },
				visible: {
					opacity: 1,
					x: 0,
					y: 0,
					transition: { ease: easingCurve },
				},
			}
		}

		case 'scale':
			return {
				hidden: { opacity: 0, scale: 0.95 },
				visible: {
					opacity: 1,
					scale: 1,
					transition: { ease: easingCurve },
				},
			}

		case 'blur':
			return {
				hidden: { opacity: 0, filter: 'blur(10px)' },
				visible: {
					opacity: 1,
					filter: 'blur(0px)',
					transition: { ease: easingCurve },
				},
			}

		case 'fade':
		default:
			// Default fade with slight upward movement (industry standard)
			return {
				hidden: { opacity: 0, y: distance },
				visible: {
					opacity: 1,
					y: 0,
					transition: { ease: easingCurve },
				},
			}
	}
}

/**
 * Check if reduced motion is preferred
 * Checks both system preference and user override
 * Industry best practice: Accessibility-first design
 * 
 * @returns true if reduced motion is preferred
 */
export function checkReducedMotion(): boolean {
	if (typeof window === 'undefined') {return false}

	// Check user override first (data-reduced-motion attribute)
	const userOverride = document.documentElement.getAttribute('data-reduced-motion')
	if (userOverride === 'true') {return true}

	// Fall back to system preference
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Reduced motion animation variants (instant or quick fade)
 * WCAG 2.1 compliance: Respect user preferences
 */
export const REDUCED_MOTION_VARIANTS: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.001 }, // Instant (Safari needs non-zero)
	},
}

