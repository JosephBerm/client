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
	/** Long animations (scroll indicators, special effects) */
	long: 1,
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
	/** Very long delay (scroll indicators, delayed reveals) */
	veryLong: 1.5,
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
	/** Hero stagger (original about page timing) */
	hero: 0.2,
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
	/** Feature section movement (original about page timing) */
	feature: 50,
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

/**
 * Modal animation configuration
 * MAANG-level modal animations following industry best practices
 * 
 * **Design Principles:**
 * - Spring physics for natural, organic feel (Apple, Linear, Notion)
 * - Subtle scale and y-translate for depth perception
 * - Fast, snappy transitions (200-300ms industry standard)
 * - Backdrop fade separate from content animation
 */
export const MODAL_ANIMATION = {
	/** Modal content animation timing */
	content: {
		/** Spring physics for natural motion */
		spring: {
			type: 'spring' as const,
			stiffness: 400,
			damping: 30,
			mass: 0.8,
		},
		/** Exit animation (faster, ease-out) */
		exit: {
			duration: 0.15,
			ease: [0.4, 0, 1, 1] as const, // ease-in for exit
		},
	},
	/** Backdrop animation timing */
	backdrop: {
		duration: 0.2,
		ease: [0.4, 0, 0.2, 1] as const, // Material Design standard
	},
	/** Animation distances */
	distance: {
		y: 16, // Subtle vertical movement
		scale: 0.98, // Subtle scale (closer to 1 = more premium)
	},
} as const

/**
 * Tabs indicator animation configuration
 * Material Design-inspired sliding indicator with spring physics
 *
 * **Design Principles:**
 * - Reuses modal spring physics for consistency
 * - Fast, responsive feel (matches user interaction speed)
 * - Reduced motion fallback for accessibility
 */
export const TABS_INDICATOR_ANIMATION = {
	/** Spring physics for smooth sliding (same as modal for consistency) */
	spring: {
		type: 'spring' as const,
		stiffness: 400,
		damping: 30,
		mass: 0.8,
	},
	/** Fallback for reduced motion preference */
	reducedMotion: {
		duration: 0.001,
	},
} as const

