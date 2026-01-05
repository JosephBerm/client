/**
 * Animation Components Barrel Export
 * 
 * Centralized export for all animation components, utilities, and configuration.
 * FAANG-level: Clean API surface, organized exports, DRY principle.
 * 
 * @module components/common/animations
 */

// Components
export { default as Reveal } from './Reveal'
export type { RevealProps } from './Reveal'

export { default as Stagger, StaggerItem } from './Stagger'
export type { StaggerProps, StaggerItemProps } from './Stagger'

// Types
export type {
	AnimationVariant,
	AnimationDirection,
	BaseAnimationProps,
} from './types'

// Utilities
export {
	getAnimationVariants,
	checkReducedMotion,
	ANIMATION_EASING,
	REDUCED_MOTION_VARIANTS,
} from './types'

// Configuration (DRY principle)
export {
	ANIMATION_DURATION,
	ANIMATION_DELAY,
	STAGGER_DELAY,
	ANIMATION_DISTANCE,
	ANIMATION_PRESETS,
	STAGGER_PRESETS,
	MODAL_ANIMATION,
	TABS_INDICATOR_ANIMATION,
} from './config'
