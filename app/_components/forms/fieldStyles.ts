/**
 * Form Field Styles - Shared Design System
 * 
 * Modern, elegant form styling following industry best practices.
 * Inspired by Apple, Google Material, Stripe, and Linear design systems.
 * 
 * @module forms/fieldStyles
 */

/**
 * Field wrapper - consistent vertical spacing
 * Gap: 1.5 (6px) for tighter label-to-input relationship
 */
export const fieldWrapperClass = 'flex w-full flex-col gap-1.5'

/**
 * Elegant Form Label Styles
 * 
 * **Design Principles (FAANG Standard):**
 * - Sentence case (not uppercase) - modern, approachable
 * - Neutral color - clean hierarchy, lets content stand out
 * - Medium weight - clear without being heavy
 * - Subtle tracking - professional without being loud
 * 
 * **Typography:**
 * - Size: 0.875rem (14px) - optimal for labels (WCAG compliant)
 * - Weight: 500 (medium) - visible but not overpowering
 * - Color: base-content with 80% opacity - elegant muted tone
 * - Line height: 1.4 for optimal readability
 * 
 * **Modern Design Systems Reference:**
 * - Apple: Sentence case, SF Pro medium weight, neutral gray
 * - Google Material: Sentence case, body-small styling
 * - Stripe: Sentence case, subtle gray, clean spacing
 * - Linear: Sentence case, muted colors, minimal
 * 
 * **Accessibility:**
 * - WCAG 2.1 AA compliant contrast (4.5:1 minimum)
 * - Clear visual hierarchy without color dependency
 * - Proper label-input association
 */
export const labelClass = [
	// Typography
	'text-sm',
	'font-medium',
	'leading-[1.4]',
	// Color - neutral, elegant
	'text-base-content/80',
	// Layout
	'flex',
	'items-center',
	'gap-1',
	// Transitions
	'transition-colors',
	'duration-200',
].join(' ')

/**
 * Helper text - subtle guidance below inputs
 */
export const helperClass = 'text-xs text-base-content/60 leading-relaxed mt-1'

/**
 * Error text - validation feedback
 */
export const errorClass = 'text-xs text-error leading-relaxed mt-1'

/**
 * Base input field styles
 * 
 * **Design:**
 * - Rounded corners (lg = 8px) - modern but not excessive
 * - Comfortable padding - touch-friendly
 * - Subtle border - clean, not heavy
 * - Focus ring for accessibility
 */
export const baseFieldClass = [
	// DaisyUI base
	'input',
	'input-bordered',
	'w-full',
	// Shape
	'rounded-lg',
	// Spacing - comfortable for touch
	'px-4',
	'py-2.5',
	// Typography
	'text-base',
	'placeholder:text-base-content/40',
	// Transitions
	'transition-all',
	'duration-200',
	// Focus state
	'focus:ring-2',
	'focus:ring-primary/20',
	'focus:border-primary',
	// States
	'disabled:cursor-not-allowed',
	'disabled:opacity-50',
].join(' ')

/**
 * Error state for input fields
 */
export const errorFieldClass = [
	'border-error',
	'focus:border-error',
	'focus:ring-error/20',
].join(' ')

