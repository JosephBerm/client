/**
 * Shared Form Field Styles - Industry Best Practices
 * 
 * Centralized styling utilities for form input components (Input, Select, etc.).
 * Ensures consistent, elegant border/outline styling across all form fields.
 * 
 * **Design Philosophy:**
 * - Elegant, subtle focus states (no aggressive scaling)
 * - Consistent visual language across components
 * - Accessible focus indicators
 * - Smooth transitions
 * 
 * **Usage:**
 * ```tsx
 * import { getFormFieldClasses } from '@_components/ui/formFieldStyles';
 * 
 * const classes = getFormFieldClasses({
 *   isDisabled: false,
 *   hasError: false,
 *   customClasses: 'custom-class'
 * });
 * ```
 * 
 * @module formFieldStyles
 */

import classNames from 'classnames'

/**
 * Options for form field styling.
 */
export interface FormFieldStyleOptions {
	/** Whether the field is disabled */
	isDisabled?: boolean
	/** Whether the field has an error */
	hasError?: boolean
	/** Custom additional classes */
	customClasses?: string
}

/**
 * Base form field classes - shared across Input, Select, and other form components.
 * Provides consistent border, shadow, and transition styling.
 */
export const formFieldBaseClasses = [
	// Modern transitions - smooth and performant
	'transition-all',
	'duration-300',
	'ease-out',
	
	// Subtle shadows - Input-like feel
	'shadow-sm',
	
	// Border & Background - Clean and modern
	'border-base-300',
	'bg-base-100',
	
	// Rounded corners - Soft and friendly
	'rounded-lg',
].join(' ')

/**
 * Hover state classes for form fields.
 * Applied when field is not disabled.
 */
export const formFieldHoverClasses = (isDisabled: boolean) =>
	!isDisabled
		? [
				// Hover state - Subtle and refined
				'hover:border-primary/50',
				'hover:shadow-md',
		  ].join(' ')
		: ''

/**
 * Focus state classes for form fields.
 * Elegant, gentle focus indication without aggressive scaling or animation.
 */
export const formFieldFocusClasses = [
	// Focus state - Clear and accessible (gentle, elegant, no animation)
	'focus:border-primary',
	'focus:outline-none',
	'focus:ring-2',
	'focus:ring-primary/20',
	'focus:ring-offset-0', // No offset for elegant, centered ring
	'focus:shadow-sm', // Keep same shadow as default (no lift effect)
	'focus:transition-none', // Disable transitions on focus to prevent animation
].join(' ')

/**
 * Error state classes for form fields.
 */
export const formFieldErrorClasses = (hasError: boolean) =>
	hasError
		? [
				// Error state - Clear but not aggressive
				'border-error/70',
				'focus:ring-error/20',
		  ].join(' ')
		: ''

/**
 * Disabled state classes for form fields.
 */
export const formFieldDisabledClasses = (isDisabled: boolean) =>
	isDisabled
		? [
				// Disabled state - Elegant degradation
				'opacity-60',
				'cursor-not-allowed',
				'bg-base-200/50',
				'hover:shadow-sm',
				'hover:border-base-300',
		  ].join(' ')
		: ''

/**
 * Loading state classes for form fields.
 */
export const formFieldLoadingClasses = (isLoading: boolean) =>
	isLoading
		? [
				// Loading state - Subtle indication
				'opacity-75',
				'cursor-wait',
		  ].join(' ')
		: ''

/**
 * Text styling classes for form fields.
 */
export const formFieldTextClasses = [
	// Text styling - Clean and readable
	'font-medium',
	'text-base-content',
].join(' ')

/**
 * Get complete form field classes with all states applied.
 * 
 * @param options - Style options including disabled, error states, and custom classes
 * @returns Combined class string for form field styling
 * 
 * @example
 * ```tsx
 * const inputClasses = getFormFieldClasses({
 *   isDisabled: false,
 *   hasError: formState.errors.email,
 *   customClasses: 'input input-bordered'
 * });
 * ```
 */
export function getFormFieldClasses(options: FormFieldStyleOptions = {}): string {
	const { isDisabled = false, hasError = false, customClasses = '' } = options

	return classNames(
		formFieldBaseClasses,
		formFieldHoverClasses(isDisabled),
		formFieldFocusClasses,
		formFieldErrorClasses(hasError),
		formFieldDisabledClasses(isDisabled),
		formFieldTextClasses,
		customClasses
	)
}

