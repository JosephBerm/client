/**
 * QuantitySelector UI Component
 * 
 * Reusable quantity selector component with increment/decrement controls.
 * Supports both editable (input) and read-only (display) modes for flexible use cases.
 * 
 * **Features:**
 * - Increment/decrement buttons with icons or text
 * - Editable input mode or read-only display mode
 * - Min/max quantity validation and clamping
 * - Customizable size and styling
 * - Full accessibility support (ARIA labels, roles)
 * - Mobile-first responsive design
 * - Disabled state handling
 * - Theme-aware (DaisyUI)
 * 
 * **Use Cases:**
 * - Product cards (AddToCartButton) - editable mode
 * - Cart page - read-only mode with direct updates
 * - Order forms - editable mode
 * - Any quantity selection interface
 * 
 * **Accessibility:**
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 * 
 * @example
 * ```tsx
 * import QuantitySelector from '@_components/ui/QuantitySelector';
 * 
 * // Editable mode (for product cards)
 * <QuantitySelector
 *   value={quantity}
 *   onChange={setQuantity}
 *   min={1}
 *   max={9999}
 *   editable
 *   ariaLabel="Product quantity"
 * />
 * 
 * // Read-only mode (for cart page)
 * <QuantitySelector
 *   value={item.quantity}
 *   onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
 *   onDecrement={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
 *   min={1}
 *   editable={false}
 *   ariaLabel={`Quantity controls for ${item.name}`}
 * />
 * ```
 * 
 * @module QuantitySelector
 */

'use client'

import { useCallback, useState, useEffect } from 'react'

import classNames from 'classnames'
import { Plus, Minus } from 'lucide-react'

export interface QuantitySelectorProps {
	/** Current quantity value */
	value: number

	/** Callback when quantity changes (for editable mode) */
	onChange?: (newValue: number) => void

	/** Callback when increment button is clicked (for read-only mode) */
	onIncrement?: () => void

	/** Callback when decrement button is clicked (for read-only mode) */
	onDecrement?: () => void

	/** Minimum allowed quantity (default: 1) */
	min?: number

	/** Maximum allowed quantity (default: 9999) */
	max?: number

	/** Whether quantity input is editable (default: true) */
	editable?: boolean

	/** Component size (default: 'sm') */
	size?: 'xs' | 'sm' | 'md'

	/** Button variant style (default: 'ghost') */
	buttonVariant?: 'ghost' | 'outline'

	/** Use icons for buttons (default: true). If false, uses text ("-", "+") */
	useIcons?: boolean

	/** Custom className for container */
	className?: string

	/** Custom className for input/display */
	inputClassName?: string

	/** Custom className for buttons */
	buttonClassName?: string

	/** Disabled state */
	disabled?: boolean

	/** ARIA label for the quantity control group */
	ariaLabel?: string

	/** Width of the input/display field (default: 'w-20') */
	inputWidth?: string

	/** Alignment of the container (default: 'justify-center') */
	align?: 'justify-center' | 'justify-start' | 'justify-end'
}

/**
 * QuantitySelector Component
 * 
 * Flexible quantity selector that works in both editable and read-only modes.
 * Handles validation, clamping, and accessibility automatically.
 * 
 * **Design Philosophy:**
 * - Clean, minimal interface
 * - Consistent with DaisyUI design system
 * - Touch-friendly controls (min 44px tap targets)
 * - Smooth transitions and hover states
 * 
 * @param props - QuantitySelector configuration props
 * @returns QuantitySelector component
 */
export default function QuantitySelector({
	value,
	onChange,
	onIncrement,
	onDecrement,
	min = 1,
	max = 9999,
	editable = true,
	size = 'sm',
	buttonVariant = 'ghost',
	useIcons = true,
	className = '',
	inputClassName = '',
	buttonClassName = '',
	disabled = false,
	ariaLabel = 'Quantity',
	inputWidth = 'w-20',
	align = 'justify-center',
}: QuantitySelectorProps) {
	// Internal state for editable mode (to handle invalid input)
	const [internalValue, setInternalValue] = useState<string>(value.toString())

	// Sync internal value with external value
	useEffect(() => {
		setInternalValue(value.toString())
	}, [value])

	// Clamp value to min/max bounds
	const clampValue = useCallback(
		(val: number): number => {
			return Math.max(min, Math.min(max, Math.floor(val)))
		},
		[min, max]
	)

	// Handle increment (works for both modes)
	const handleIncrement = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()

			if (disabled) {return}

			if (editable && onChange) {
				// Editable mode: update via onChange
				const newValue = clampValue(value + 1)
				onChange(newValue)
			} else if (onIncrement) {
				// Read-only mode: call onIncrement callback
				onIncrement()
			}
		},
		[disabled, editable, onChange, onIncrement, value, clampValue]
	)

	// Handle decrement (works for both modes)
	const handleDecrement = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()

			if (disabled) {return}

			if (editable && onChange) {
				// Editable mode: update via onChange
				const newValue = clampValue(value - 1)
				onChange(newValue)
			} else if (onDecrement) {
				// Read-only mode: call onDecrement callback
				onDecrement()
			}
		},
		[disabled, editable, onChange, onDecrement, value, clampValue]
	)

	// Handle input change (editable mode only)
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value

			// Allow empty input while typing
			if (inputValue === '') {
				setInternalValue('')
				return
			}

			const numValue = parseInt(inputValue, 10)

			// If invalid number, reset to min
			if (isNaN(numValue)) {
				setInternalValue(min.toString())
				if (onChange) {
					onChange(min)
				}
				return
			}

			// Clamp and update
			const clamped = clampValue(numValue)
			setInternalValue(clamped.toString())
			if (onChange) {
				onChange(clamped)
			}
		},
		[onChange, min, clampValue]
	)

	// Handle input blur (editable mode only) - ensure valid value
	const handleInputBlur = useCallback(() => {
		const numValue = parseInt(internalValue, 10)

		// If empty or invalid, set to min
		if (isNaN(numValue) || internalValue === '') {
			const clamped = min
			setInternalValue(clamped.toString())
			if (onChange) {
				onChange(clamped)
			}
		} else {
			// Ensure value is clamped
			const clamped = clampValue(numValue)
			if (clamped !== numValue) {
				setInternalValue(clamped.toString())
				if (onChange) {
					onChange(clamped)
				}
			}
		}
	}, [internalValue, min, clampValue, onChange])

	// Size classes - Mobile-first responsive sizing
	const sizeClasses = {
		xs: {
			button: 'btn-xs min-h-[36px] min-w-[36px]',
			input: 'input-xs text-xs',
			display: 'text-xs',
			icon: 'h-3 w-3',
		},
		sm: {
			button: 'btn-sm min-h-[44px] min-w-[44px]',
			input: 'input-sm text-sm',
			display: 'text-sm sm:text-base',
			icon: 'h-4 w-4',
		},
		md: {
			button: 'btn-md min-h-[48px] min-w-[48px]',
			input: 'input-base text-base',
			display: 'text-base',
			icon: 'h-5 w-5',
		},
	}

	const currentSize = sizeClasses[size]

	// Button variant classes
	const variantClasses = {
		ghost: 'btn-ghost',
		outline: 'btn-outline',
	}

	const isDecrementDisabled = disabled || value <= min
	const isIncrementDisabled = disabled || value >= max

	return (
		<div
			className={classNames('flex items-center gap-2', align, className)}
			role="group"
			aria-label={ariaLabel}
		>
			{/* Decrement Button */}
			<button
				type="button"
				onClick={handleDecrement}
				disabled={isDecrementDisabled}
				className={classNames(
					'btn btn-circle shrink-0 transition-all duration-200',
					currentSize.button,
					variantClasses[buttonVariant],
					{
						'disabled:opacity-50 disabled:cursor-not-allowed': isDecrementDisabled,
					},
					buttonClassName
				)}
				aria-label={`Decrease quantity${editable ? '' : ` to ${Math.max(min, value - 1)}`}`}
			>
				{useIcons ? (
					<Minus className={currentSize.icon} aria-hidden="true" />
				) : (
					<span aria-hidden="true">-</span>
				)}
			</button>

			{/* Quantity Input/Display */}
			{editable ? (
				<input
					type="number"
					min={min}
					max={max}
					value={internalValue}
					onChange={handleInputChange}
					onBlur={handleInputBlur}
					disabled={disabled}
					className={classNames(
						'input input-bordered text-center font-medium disabled:opacity-50 transition-colors duration-200',
						currentSize.input,
						inputWidth,
						inputClassName
					)}
					aria-label={`${ariaLabel} input`}
					aria-live="polite"
					aria-atomic="true"
				/>
			) : (
				<span
					className={classNames(
						'input input-bordered text-center font-medium transition-colors duration-200 flex items-center justify-center pointer-events-none',
						currentSize.input,
						inputWidth,
						inputClassName
					)}
					aria-live="polite"
					aria-atomic="true"
					role="status"
				>
					{value}
				</span>
			)}

			{/* Increment Button */}
			<button
				type="button"
				onClick={handleIncrement}
				disabled={isIncrementDisabled}
				className={classNames(
					'btn btn-circle shrink-0 transition-all duration-200',
					currentSize.button,
					variantClasses[buttonVariant],
					{
						'disabled:opacity-50 disabled:cursor-not-allowed': isIncrementDisabled,
					},
					buttonClassName
				)}
				aria-label={`Increase quantity${editable ? '' : ` to ${Math.min(max, value + 1)}`}`}
			>
				{useIcons ? (
					<Plus className={currentSize.icon} aria-hidden="true" />
				) : (
					<span aria-hidden="true">+</span>
				)}
			</button>
		</div>
	)
}

