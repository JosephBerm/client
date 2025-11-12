/**
 * Select UI Component
 * 
 * Accessible select/dropdown component with DaisyUI styling.
 * Provides a consistent interface for dropdown selections across the application.
 * 
 * **Features:**
 * - Theme-aware styling via DaisyUI
 * - Accessible (proper ARIA attributes)
 * - Supports placeholder
 * - Full-width or fixed-width options
 * - Mobile-friendly
 * - Optional custom className
 * 
 * @example
 * ```tsx
 * import Select from '@_components/ui/Select';
 * 
 * const options = [
 *   { value: 'winter', label: 'Winter' },
 *   { value: 'luxury', label: 'Luxury' },
 * ];
 * 
 * <Select
 *   value={selectedTheme}
 *   onChange={(e) => setTheme(e.target.value)}
 *   options={options}
 *   placeholder="Select a theme"
 * />
 * ```
 * 
 * @module Select
 */

'use client'

import React from 'react'

/**
 * Option interface for select dropdown.
 */
export interface SelectOption {
	/** Value of the option (stored in state) */
	value: string
	/** Display label for the option */
	label: string
}

/**
 * Select component props interface.
 */
interface SelectProps {
	/** Current selected value */
	value: string
	/** Callback when selection changes */
	onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
	/** Array of options to display */
	options: SelectOption[]
	/** Optional placeholder text (shows when no value selected) */
	placeholder?: string
	/** Optional additional CSS classes */
	className?: string
	/** Whether the select should take full width */
	fullWidth?: boolean
	/** ARIA label for accessibility */
	'aria-label'?: string
}

/**
 * Select Component
 * 
 * Accessible dropdown/select component with DaisyUI styling.
 * 
 * **Behavior:**
 * - Displays options in a dropdown list
 * - Calls onChange with the selected value
 * - Supports placeholder when no value is selected
 * 
 * @param props - Select configuration props
 * @returns Select component
 */
export default function Select({
	value,
	onChange,
	options,
	placeholder,
	className = '',
	fullWidth = true,
	'aria-label': ariaLabel,
}: SelectProps) {
	return (
		<select
			value={value}
			onChange={onChange}
			className={`select select-bordered ${
				fullWidth ? 'w-full' : ''
			} ${className}`}
			aria-label={ariaLabel}
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}

