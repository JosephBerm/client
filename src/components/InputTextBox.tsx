'use client'

import React, { useRef } from 'react'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

export interface InputType {
	type: string
	value: string
	label: string
	placeholder?: string
	disabled?: boolean
	readOnly?: boolean
	autofocused?: boolean
	pattern?: string
	inputmode?: inputMode
	// Error: ?
	// Icon: ?
	// VALIDATION: ?
	maxLength?: number
	handleChange: (value: any) => void
	handleBlur?: (value: any) => void
	handleFocus?: () => void
	className?: string
}

const InputTextBox: React.FC<InputType> = ({
	type,
	label,
	value,
	placeholder,
	disabled,
	readOnly,
	autofocused,
	maxLength,
	inputmode,
	pattern,
	handleChange,
	handleBlur,
	handleFocus,
	className,
}) => {
	const inputRef = useRef<HTMLInputElement>(null)

	const focusInput = () => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}

	return (
		<div className='InputTextBox flex flex-col'>
			<label onClick={focusInput} className='m-2'>
				{label}
			</label>
			<input
				ref={inputRef}
				autoFocus={autofocused}
				placeholder={placeholder}
				type={type}
				value={value}
				disabled={disabled}
				readOnly={readOnly}
				maxLength={maxLength}
				inputMode={inputmode}
				pattern={pattern}
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				onFocus={handleFocus}
				className={`${className + ' ' ?? ''}border-b border-gray-300`}
			/>
		</div>
	)
}

export default InputTextBox
