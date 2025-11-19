/**
 * Animation Configuration Constants
 * 
 * Centralized animation configuration for DRY principle and consistency.
 * Single source of truth for all animation timing and defaults across the application.
 * 
 * **Benefits:**
 * - DRY: One place to update timing values
 * - Consistency: All animations use same timing
 * - Type-safe: Exported with proper types
 * - Maintainable: Easy to adjust globally
 * 
 * @module components/common/animations/config
 */

import type { AnimationVariant, AnimationDirection } from './types'

/**
 * Standard animation durations (in seconds)
 * Industry best practice: 0.5-0.6s for professional feel
 */
export const ANIMATION_DURATION = {
	/** Quick animations (carousels, simple fades) */
	quick: 0.5,
	/** Standard animations (most sections) */
	standard: 0.6,
	/** Slow animations (hero sections, emphasis) */
	slow: 0.7,
} as const

/**
 * Standard animation delays (in seconds)
 * Staggered between sections for natural progression
 */
export const ANIMATION_DELAY = {
	/** No delay (immediate) */
	none: 0,
	/** Quick delay (first sections) */
	quick: 0.1,
	/** Standard delay (middle sections) */
	standard: 0.15,
	/** Long delay (final sections) */
	long: 0.2,
} as const

/**
 * Stagger delays for card/item animations (in seconds)
 * Used for sequential reveals within a section
 */
export const STAGGER_DELAY = {
	/** Very fast stagger (4+ items, quick cascade) */
	fast: 0.08,
	/** Standard stagger (2-4 items, comfortable pace) */
	standard: 0.1,
	/** Slow stagger (2-3 items, deliberate) */
	slow: 0.12,
} as const

/**
 * Animation distances (in pixels)
 * Distance elements travel during slide/fade animations
 */
export const ANIMATION_DISTANCE = {
	/** Subtle movement */
	sm: 20,
	/** Standard movement */
	md: 30,
	/** Prominent movement */
	lg: 40,
} as const

/**
 * Common animation preset configurations
 * Pre-configured animation props for common use cases
 */
export const ANIMATION_PRESETS = {
	/** Section reveal - Professional slide-up entrance */
	sectionSlideUp: {
		variant: 'slide' as AnimationVariant,
		direction: 'up' as AnimationDirection,
		distance: ANIMATION_DISTANCE.sm,
		duration: ANIMATION_DURATION.standard,
	},
	
	/** Section fade - Simple fade entrance */
	sectionFade: {
		variant: 'fade' as AnimationVariant,
		duration: ANIMATION_DURATION.standard,
	},
	
	/** Card fade-up - Standard card reveal */
	cardFadeUp: {
		variant: 'fade' as AnimationVariant,
		direction: 'up' as AnimationDirection,
		distance: ANIMATION_DISTANCE.sm,
	},
	
	/** Card scale - Attention-grabbing pop-in */
	cardScale: {
		variant: 'scale' as AnimationVariant,
	},
	
	/** CTA slide-up - Emphasizes call-to-action */
	ctaSlideUp: {
		variant: 'slide' as AnimationVariant,
		direction: 'up' as AnimationDirection,
		distance: ANIMATION_DISTANCE.md,
	},
} as const

/**
 * Stagger configuration presets
 * Pre-configured stagger settings for common patterns
 */
export const STAGGER_PRESETS = {
	/** Feature cards (2-4 items, comfortable pace) */
	featureCards: {
		staggerDelay: STAGGER_DELAY.standard,
		delay: 0.3,
	},
	
	/** Product cards (4+ items, efficient reveal) */
	productCards: {
		staggerDelay: STAGGER_DELAY.fast,
		delay: 0.2,
	},
	
	/** Contact methods (2-3 items, clear separation) */
	contactMethods: {
		staggerDelay: STAGGER_DELAY.slow,
		delay: 0.3,
	},
} as const

