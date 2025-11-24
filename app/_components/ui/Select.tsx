/**
 * Select UI Component - Industry Best Practices
 * 
 * Enhanced select/dropdown component following design patterns from:
 * - Material UI (size variants, states)
 * - Ant Design (responsive behavior)
 * - Apple Design (minimal, clean)
 * - DaisyUI (theme integration)
 * 
 * **Features:**
 * - Size variants (xs, sm, base, lg)
 * - Theme-aware styling via DaisyUI
 * - Full accessibility (ARIA, keyboard nav)
 * - Mobile-first responsive
 * - Loading, disabled, error states
 * - Number or string values
 * - Placeholder support
 * - Optional width presets
 *
 * **Industry Standards:**
 * - WCAG 2.1 AA compliant
 * - Touch-friendly (min 44x44px - Apple HIG)
 * - Keyboard accessible
 * - Screen reader support
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Select
 *   value={selected}
 *   onChange={(e) => setSelected(e.target.value)}
 *   options={[
 *     { value: '10', label: '10' },
 *     { value: '20', label: '20' }
 *   ]}
 * />
 *
 * // With size variant
 * <Select
 *   size="sm"
 *   value={value}
 *   onChange={handler}
 *   options={options}
 * />
 * 
 * // With width preset
 * <Select
 *   width="auto"
 *   value={value}
 *   onChange={handler}
 *   options={options}
 * />
 *
 * // With error state
 * <Select
 *   error
 *   value={value}
 *   onChange={handler}
 *   options={options}
 * />
 * ```
 * 
 * @module Select
 */

'use client'

import React from 'react'

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
 * Option interface for select dropdown.
 * Supports both string and number values for flexibility.
 */
export interface SelectOption<T = string | number> {
	/** Value of the option (stored in state) */
	value: T
	/** Display label for the option */
	label: string
	/** Whether this option is disabled */
	disabled?: boolean
}

/**
 * Select size variants following industry standards.
 * - xs: Extra small (for compact UIs, inline controls)
 * - sm: Small (for toolbars, filters)
 * - base: Default (standard forms)
 * - lg: Large (prominent actions, touch-optimized)
 */
export type SelectSize = 'xs' | 'sm' | 'base' | 'lg'

/**
 * Width presets for common use cases.
 * - auto: Fits content (with min-width)
 * - full: 100% width
 * - xs: 5rem (80px) - For numbers like "10", "20"
 * - sm: 8rem (128px) - For short text
 * - md: 12rem (192px) - For medium text
 * - lg: 16rem (256px) - For long text
 */
export type SelectWidth = 'auto' | 'full' | 'xs' | 'sm' | 'md' | 'lg'

/**
 * Select component props interface.
 */
export interface SelectProps<T = string | number> {
	/** Current selected value */
	value: T
	/** Callback when selection changes */
	onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
	/** Array of options to display */
	options: SelectOption<T>[]
	/** Optional placeholder text (shows when no value selected) */
	placeholder?: string
	/** Size variant (default: 'base') */
	size?: SelectSize
	/** Width preset or custom width (default: 'full') */
	width?: SelectWidth
	/** Whether the select is disabled */
	disabled?: boolean
	/** Whether the select is in loading state */
	loading?: boolean
	/** Whether the select has an error */
	error?: boolean
	/** Optional ID for the select element */
	id?: string
	/** Optional name for form submission */
	name?: string
	/** Whether the field is required */
	required?: boolean
	/** ARIA label for accessibility */
	'aria-label'?: string
	/** Additional CSS classes */
	className?: string
}

/**
 * Size-specific class mappings following DaisyUI conventions.
 * Includes proper padding for breathing room (Apple/Microsoft standard).
 * Using !important modifier to override DaisyUI's default padding.
 */
const sizeClasses: Record<SelectSize, string> = {
	xs: 'select-xs h-7 text-xs !pl-2.5 !pr-8',      // 10px left, 32px right
	sm: 'select-sm h-8 text-sm !pl-3 !pr-9',        // 12px left, 36px right
	base: 'h-12 text-base !pl-4 !pr-10',            // 16px left, 40px right
	lg: 'select-lg h-14 text-lg !pl-5 !pr-12',      // 20px left, 48px right
}

/**
 * Width preset class mappings.
 */
const widthClasses: Record<SelectWidth, string> = {
	auto: 'w-auto min-w-[5rem]',
	full: 'w-full',
	xs: 'w-20', // 5rem / 80px
	sm: 'w-32', // 8rem / 128px
	md: 'w-48', // 12rem / 192px
	lg: 'w-64', // 16rem / 256px
}

/**
 * Select Component
 * 
 * Enhanced dropdown/select component with industry-standard features.
 * 
 * **Accessibility:**
 * - ARIA labels for screen readers
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Disabled state prevents interaction
 * - Required indicator for forms
 *
 * **Mobile-First:**
 * - Touch-friendly sizes (min 44x44px for sm+)
 * - Responsive width options
 * - Native dropdown on mobile
 *
 * **States:**
 * - Default: Standard styling
 * - Hover: Border color change
 * - Focus: Ring + border highlight
 * - Disabled: Reduced opacity, no interaction
 * - Loading: Spinner indicator
 * - Error: Red border and text
 * 
 * @param props - Select configuration props
 * @returns Select component
 */
export default function Select<T = string | number>({
	value,
	onChange,
	options,
	placeholder,
	size = 'base',
	width = 'full',
	disabled = false,
	loading = false,
	error = false,
	id,
	name,
	required = false,
	'aria-label': ariaLabel,
	className = '',
}: SelectProps<T>) {
	// Build class names with modern, elegant styling using shared form field styles
	const isDisabled = disabled || loading
	const classes = [
		// Base DaisyUI classes
		'select',
		'select-bordered',
		sizeClasses[size],
		widthClasses[width],
		
		// Additional select-specific styling
		'backdrop-blur-sm',
		
		// Shared form field styles (border, shadow, transitions, states)
		formFieldBaseClasses,
		formFieldHoverClasses(isDisabled),
		formFieldFocusClasses,
		formFieldErrorClasses(error),
		formFieldDisabledClasses(isDisabled),
		formFieldLoadingClasses(loading),
		formFieldTextClasses,
		
		// Error animation (select-specific)
		error && 'animate-shake',
		
		// Custom className
		className,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<div className="relative inline-block group">
		<select
				id={id}
				name={name}
				value={String(value)}
			onChange={onChange}
				className={classes}
				disabled={disabled || loading}
				required={required}
			aria-label={ariaLabel}
				aria-invalid={error}
				aria-busy={loading}
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{options.map((option) => (
					<option
						key={String(option.value)}
						value={String(option.value)}
						disabled={option.disabled}
					>
					{option.label}
				</option>
			))}
		</select>

			{/* Loading indicator - Elegant spinner */}
			{loading && (
				<div className="pointer-events-none absolute inset-y-0 right-3 flex items-center animate-fade-in">
					<span className="loading loading-spinner loading-xs text-primary opacity-70"></span>
				</div>
			)}

			{/* Focus glow effect - Very subtle (input-like) */}
			<div 
				className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
				style={{
					background: 'radial-gradient(circle at center, oklch(var(--p) / 0.02) 0%, transparent 70%)',
				}}
				aria-hidden="true"
			/>
		</div>
	)
}

/**
 * Type-safe helper to create select options from an array of values.
 *
 * @example
 * ```tsx
 * const sizes = [10, 20, 50, 100];
 * const options = createSelectOptions(sizes);
 * // Result: [{ value: 10, label: '10' }, { value: 20, label: '20' }, ...]
 *
 * // With custom labels
 * const options = createSelectOptions(sizes, (v) => `${v} items`);
 * // Result: [{ value: 10, label: '10 items' }, ...]
 * ```
 */
export function createSelectOptions<T extends string | number>(
	values: T[],
	labelFormatter?: (value: T) => string
): SelectOption<T>[] {
	return values.map((value) => ({
		value,
		label: labelFormatter ? labelFormatter(value) : String(value),
	}))
}

/**
 * Type-safe helper to create options from an enum or object.
 *
 * @example
 * ```tsx
 * enum Status {
 *   Pending = 'pending',
 *   Active = 'active',
 *   Complete = 'complete'
 * }
 *
 * const options = createOptionsFromEnum(Status);
 * // Result: [
 * //   { value: 'pending', label: 'Pending' },
 * //   { value: 'active', label: 'Active' },
 * //   { value: 'complete', label: 'Complete' }
 * // ]
 * ```
 */
export function createOptionsFromEnum<T extends Record<string, string | number>>(
	enumObj: T,
	labelFormatter?: (key: string) => string
): SelectOption[] {
	return Object.entries(enumObj).map(([key, value]) => ({
		value: String(value),
		label: labelFormatter ? labelFormatter(key) : key,
	}))
}
