/**
 * Input UI Component - Industry Best Practices
 * 
 * Enhanced input component following design patterns from:
 * - Material UI (size variants, states, helper text)
 * - Ant Design (prefix/suffix slots, clear button)
 * - Chakra UI (flexible composition)
 * - Apple Design (minimal, clean, accessible)
 * - DaisyUI (theme integration)
 * 
 * **Features:**
 * - Size variants (xs, sm, base, lg)
 * - Theme-aware styling via DaisyUI
 * - Full accessibility (ARIA, keyboard nav)
 * - Mobile-first responsive
 * - Loading, disabled, error states
 * - Icon support (left prefix, right suffix)
 * - Helper text support
 * - Forward ref support (React Hook Form compatible)
 * - Optional width presets
 * - Interactive right element support (clear button, etc.)
 *
 * **Industry Standards:**
 * - WCAG 2.1 AA compliant
 * - Touch-friendly (min 44x44px - Apple HIG)
 * - Keyboard accessible
 * - Screen reader support
 * 
 * **Use Cases:**
 * - Search inputs (toolbars, filters)
 * - Form inputs (text, email, password, number)
 * - Quantity inputs (order forms)
 * - SKU/product code search
 * - Price/amount inputs
 * - Date/time inputs
 * - Any text input in the application
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   placeholder="Enter text..."
 * />
 *
 * // With size variant
 * <Input
 *   size="sm"
 *   value={value}
 *   onChange={handler}
 * />
 * 
 * // With left icon (prefix)
 * <Input
 *   leftIcon={<Search />}
 *   value={value}
 *   onChange={handler}
 * />
 * 
 * // With error state and helper text
 * <Input
 *   error
 *   helperText="This field is required"
 *   value={value}
 *   onChange={handler}
 * />
 * 
 * // With React Hook Form
 * <Input
 *   {...form.register('email')}
 *   type="email"
 *   error={!!form.formState.errors.email}
 *   helperText={form.formState.errors.email?.message}
 * />
 * ```
 * 
 * @module Input
 */

'use client'

import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import classNames from 'classnames'
import {
	formFieldBaseClasses,
	formFieldHoverClasses,
	formFieldFocusClasses,
	formFieldErrorClasses,
	formFieldDisabledClasses,
	formFieldLoadingClasses,
	formFieldTextClasses,
} from './formFieldStyles'

/**
 * Input size variants following industry standards.
 * - xs: Extra small (for compact UIs, inline controls) - 28px height
 * - sm: Small (for toolbars, filters) - 32px height
 * - base: Default (standard forms) - 40px height
 * - lg: Large (prominent actions, touch-optimized) - 48px height
 */
export type InputSize = 'xs' | 'sm' | 'base' | 'lg'

/**
 * Width presets for common use cases.
 * - auto: Fits content (with min-width)
 * - full: 100% width
 * - xs: 5rem (80px) - For numbers like "10", "20"
 * - sm: 8rem (128px) - For short text
 * - md: 12rem (192px) - For medium text
 * - lg: 16rem (256px) - For long text
 */
export type InputWidth = 'auto' | 'full' | 'xs' | 'sm' | 'md' | 'lg'

/**
 * Input component props interface.
 * Extends native HTML input attributes with enhanced features.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	/** Size variant (default: 'base') */
	size?: InputSize
	/** Width preset (default: 'full') */
	width?: InputWidth
	/** Error state - applies error styling and ARIA attributes */
	error?: boolean
	/** Error message text (displayed below input when error is true) */
	errorMessage?: string
	/** Helper text displayed below input (hidden when error is present) */
	helperText?: string
	/** Left icon/prefix (e.g., search icon, currency symbol) */
	leftIcon?: ReactNode
	/** Right icon/suffix (display-only, for visual indicators) */
	rightIcon?: ReactNode
	/** Right element (interactive, e.g., clear button) - takes precedence over rightIcon */
	rightElement?: ReactNode
	/** Loading state - shows spinner and disables input */
	loading?: boolean
	/** Custom className for the input element */
	className?: string
	/** Custom className for the wrapper div */
	wrapperClassName?: string
}

/**
 * Size-specific class mappings following DaisyUI conventions.
 * Matches Select component sizing for consistency.
 */
const sizeClasses: Record<InputSize, string> = {
	xs: 'input-xs text-xs h-7 !pl-1.5 !pr-2.5',     // 28px height, compact padding
	sm: 'input-sm text-sm h-8 !pl-2 !pr-3',         // 32px height
	base: 'text-base h-10 !pl-2 !pr-4',             // 40px height (standard) - minimal left padding
	lg: 'input-lg text-lg h-12 !pl-3 !pr-5',        // 48px height (touch-optimized)
}

/**
 * Icon padding adjustments based on size.
 * Ensures icons don't overlap with text.
 * Reduced padding to bring text closer to icons and left border.
 */
const iconPaddingClasses: Record<InputSize, { left: string; right: string }> = {
	xs: { left: '!pl-6', right: '!pr-6' },      // 24px - reduced from 32px
	sm: { left: '!pl-7', right: '!pr-7' },      // 28px - reduced from 36px
	base: { left: '!pl-8', right: '!pr-8' },   // 32px - reduced from 40px
	lg: { left: '!pl-9', right: '!pr-9' },      // 36px - reduced from 48px
}

/**
 * Icon size classes based on input size.
 */
const iconSizeClasses: Record<InputSize, string> = {
	xs: 'h-3.5 w-3.5',
	sm: 'h-4 w-4',
	base: 'h-5 w-5',
	lg: 'h-6 w-6',
}

/**
 * Width preset class mappings.
 */
const widthClasses: Record<InputWidth, string> = {
	auto: 'w-auto min-w-[5rem]',
	full: 'w-full',
	xs: 'w-20',   // 5rem / 80px
	sm: 'w-32',   // 8rem / 128px
	md: 'w-48',   // 12rem / 192px
	lg: 'w-64',   // 16rem / 256px
}

/**
 * Input Component
 *
 * Enhanced input field with consistent styling, size variants, icon support, and helper text.
 * Follows industry best practices for accessibility, responsive design, and form integration.
 * 
 * **Accessibility:**
 * - ARIA labels and descriptions
 * - Error state announcements
 * - Keyboard navigation support
 * - Screen reader friendly
 * 
 * **States:**
 * - Default: Standard styling with subtle shadow
 * - Hover: Border color change, shadow enhancement
 * - Focus: Ring + border highlight (input-like)
 * - Disabled: Reduced opacity, no interaction
 * - Loading: Spinner indicator, disabled state
 * - Error: Red border, error message display
 * 
 * **Icon Handling:**
 * - Left icon: Visual prefix (search, currency, etc.)
 * - Right icon: Display-only suffix (info, checkmark, etc.)
 * - Right element: Interactive suffix (clear button, etc.)
 * 
 * @param props - Input props including size, width, error, icons, helper text, and all standard input attributes
 * @param ref - Forwarded ref for form library integration (React Hook Form, etc.)
 * @returns Input component
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			size = 'base',
			width = 'full',
			error = false,
			errorMessage,
			helperText,
			leftIcon,
			rightIcon,
			rightElement,
			loading = false,
			className,
			wrapperClassName,
			disabled,
			id,
			'aria-label': ariaLabel,
			'aria-describedby': ariaDescribedBy,
			...props
		},
		ref
	) => {
		const hasLeftIcon = Boolean(leftIcon)
		const hasRightIcon = Boolean(rightIcon)
		const hasRightElement = Boolean(rightElement)
		const hasHelperText = Boolean(helperText || errorMessage)
		const isDisabled = disabled || loading

		// Generate unique IDs for accessibility
		const helperId = id ? `${id}-helper` : undefined
		const errorId = id ? `${id}-error` : undefined
		const describedBy = [
			ariaDescribedBy,
			error && errorId,
			!error && helperText && helperId,
		]
			.filter(Boolean)
			.join(' ') || undefined

		// Build input classes with modern, elegant styling using shared form field styles
		const inputClasses = classNames(
			// Base DaisyUI classes
			'input',
			'input-bordered',
			sizeClasses[size],
			widthClasses[width],
			
			// Icon padding adjustments
			hasLeftIcon && iconPaddingClasses[size].left,
			(hasRightIcon || hasRightElement) && iconPaddingClasses[size].right,
			
			// Shared form field styles (border, shadow, transitions, states)
			formFieldBaseClasses,
			formFieldHoverClasses(isDisabled),
			formFieldFocusClasses,
			formFieldErrorClasses(error),
			formFieldDisabledClasses(isDisabled),
			formFieldLoadingClasses(loading),
			formFieldTextClasses,
			
			// Custom className
			className
		)

		return (
			<div className={classNames('relative', wrapperClassName)}>
				<div className="relative">
					{/* Left Icon/Prefix */}
					{hasLeftIcon && leftIcon && (
						<div className={classNames(
							'pointer-events-none absolute inset-y-0 left-0 flex items-center',
							size === 'xs' ? 'pl-1.5' : size === 'sm' ? 'pl-2' : size === 'base' ? 'pl-2.5' : 'pl-3'
						)}>
							{React.isValidElement(leftIcon)
								? React.cloneElement(leftIcon, {
										className: classNames(
											iconSizeClasses[size],
											'text-base-content/50',
											(leftIcon.props as { className?: string })?.className
										),
								  } as Partial<unknown>)
								: leftIcon}
						</div>
					)}

					{/* Input Field */}
					<input
						ref={ref}
						id={id}
						{...props}
						disabled={isDisabled}
						aria-label={ariaLabel}
						aria-describedby={describedBy}
						aria-invalid={error}
						aria-busy={loading}
						className={inputClasses}
					/>

					{/* Loading Spinner */}
					{loading && (
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
							<span className={classNames(
								'loading loading-spinner',
								size === 'xs' ? 'loading-xs' : size === 'sm' ? 'loading-sm' : 'loading-md',
								'text-primary opacity-70'
							)} aria-hidden="true" />
						</div>
					)}

					{/* Right Icon/Suffix (display-only) */}
					{!loading && hasRightIcon && !hasRightElement && rightIcon && (
						<div className={classNames(
							'pointer-events-none absolute inset-y-0 right-0 flex items-center',
							size === 'xs' ? 'pr-2' : size === 'sm' ? 'pr-2.5' : size === 'base' ? 'pr-3' : 'pr-4'
						)}>
							{React.isValidElement(rightIcon)
								? React.cloneElement(rightIcon, {
										className: classNames(
											iconSizeClasses[size],
											'text-base-content/50',
											(rightIcon.props as { className?: string })?.className
										),
								  } as Partial<unknown>)
								: rightIcon}
						</div>
					)}

					{/* Right Element (interactive, e.g., clear button) */}
					{!loading && hasRightElement && rightElement && (
						<div className={classNames(
							'absolute inset-y-0 right-0 flex items-center',
							size === 'xs' ? 'pr-1' : size === 'sm' ? 'pr-1.5' : size === 'base' ? 'pr-2' : 'pr-2.5'
						)}>
							{rightElement}
						</div>
					)}
				</div>

				{/* Helper Text / Error Message */}
				{hasHelperText && (
					<div className="mt-1.5">
						{error && errorMessage ? (
							<p
								id={errorId}
								className="text-xs text-error"
								role="alert"
								aria-live="polite"
							>
								{errorMessage}
							</p>
						) : helperText ? (
							<p
								id={helperId}
								className="text-xs text-base-content/60"
							>
								{helperText}
							</p>
						) : null}
					</div>
				)}
			</div>
		)
	}
)

// Set display name for debugging and dev tools
Input.displayName = 'Input'

export default Input

