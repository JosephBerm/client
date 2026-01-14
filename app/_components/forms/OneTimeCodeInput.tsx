/**
 * OneTimeCodeInput Component
 *
 * A segmented input field for 6-digit TOTP codes.
 * Follows MAANG best practices for OTP inputs:
 * - Auto-focus support
 * - Paste handling (strips non-digits, auto-fills)
 * - Arrow key navigation
 * - Backspace handling (deletes and moves previous)
 * - Auto-submit/complete callback
 * - Mobile-optimized (numeric keyboard)
 *
 * NOTE: This component uses raw <input> elements intentionally because:
 * 1. It requires 6 individual inputs with specialized focus management
 * 2. FormInput is designed for single-field forms with labels/errors
 * 3. This is a specialized OTP component, not a general form field
 *
 * @module OneTimeCodeInput
 */

'use client'

import { useRef, useCallback, useEffect } from 'react'

import classNames from 'classnames'

import Input from '@_components/ui/Input'

interface OneTimeCodeInputProps {
	/** The current value of the OTP (up to 6 digits) */
	value: string
	/** Callback when value changes */
	onChange: (value: string) => void
	/** Callback when all 6 digits are filled */
	onComplete?: (code: string) => void
	/** Whether the input is disabled (loading/submitting) */
	disabled?: boolean
	/** Whether there is an error state */
	error?: boolean
	/** Auto focus the first input on mount */
	autoFocus?: boolean
	/** Class name for the container */
	className?: string
}

// Constants
const OTP_LENGTH = 6
const LAST_INDEX = OTP_LENGTH - 1

// Style classes (DRY)
const baseInputClass =
	'!w-12 !min-w-0 !h-14 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20'

export default function OneTimeCodeInput({
	value,
	onChange,
	onComplete,
	disabled = false,
	error = false,
	autoFocus = false,
	className,
}: OneTimeCodeInputProps) {
	const inputs = useRef<(HTMLInputElement | null)[]>([])

	// Focus first input on mount if autoFocus is true
	useEffect(() => {
		if (autoFocus && !disabled) {
			inputs.current[0]?.focus()
		}
	}, [autoFocus, disabled])

	// Handle input changes
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>, index: number) => {
			const { value: val } = e.target

			// Only allow numbers
			if (!/^\d*$/.test(val)) {
				return
			}

			// Handle regular input (single digit)
			if (val.length <= 1) {
				const newValue = value.split('')
				newValue[index] = val
				const newCode = newValue.join('')
				onChange(newCode)

				// Auto-advance to next input if value added
				if (val && index < LAST_INDEX) {
					inputs.current[index + 1]?.focus()
				}

				// Trigger complete if full
				if (newCode.length === OTP_LENGTH && index === LAST_INDEX && val) {
					onComplete?.(newCode)
				}
			}
		},
		[value, onChange, onComplete]
	)

	// Handle keydown for navigation and backspace
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
			switch (e.key) {
				case 'Backspace':
					// If empty and not first, move to previous
					if (!value[index] && index > 0) {
						inputs.current[index - 1]?.focus()
					}
					break
				case 'ArrowLeft':
					if (index > 0) {
						inputs.current[index - 1]?.focus()
					}
					break
				case 'ArrowRight':
					if (index < LAST_INDEX) {
						inputs.current[index + 1]?.focus()
					}
					break
			}
		},
		[value]
	)

	// Handle paste
	const handlePaste = useCallback(
		(e: React.ClipboardEvent) => {
			e.preventDefault()
			const pastedData = e.clipboardData.getData('text').trim()

			// Extract only numbers
			const numericData = pastedData.replace(/\D/g, '').slice(0, OTP_LENGTH)

			if (numericData) {
				onChange(numericData)

				// Focus the appropriate input based on length
				const nextIndex = Math.min(numericData.length, LAST_INDEX)
				inputs.current[nextIndex]?.focus()

				if (numericData.length === OTP_LENGTH) {
					onComplete?.(numericData)
				}
			}
		},
		[onChange, onComplete]
	)

	return (
		<div className={classNames('flex gap-2 justify-center', className)}>
			{Array.from({ length: OTP_LENGTH }).map((_, i) => (
				<Input
					key={i}
					ref={(el) => {
						inputs.current[i] = el
					}}
					type='text'
					inputMode='numeric'
					pattern='\d*'
					maxLength={1}
					value={value[i] ?? ''}
					onChange={(e) => handleChange(e, i)}
					onKeyDown={(e) => handleKeyDown(e, i)}
					onPaste={handlePaste}
					disabled={disabled}
					aria-label={`Digit ${i + 1}`}
					size='sm'
					width='auto'
					wrapperClassName='w-12'
					className={classNames(
						baseInputClass,
						!error && !value[i] && 'border-base-300 bg-base-100',
						error && 'border-error bg-error/10 text-error',
						disabled && 'opacity-50 cursor-not-allowed',
						!error && value[i] && 'border-primary'
					)}
					autoComplete='one-time-code'
				/>
			))}
		</div>
	)
}
