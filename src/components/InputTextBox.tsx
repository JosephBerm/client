'use client'

import React, { useRef } from 'react'

interface InputType {
	type: string
	value: string
	label: string
	placeholder?: string
	disabled?: boolean
	readOnly?: boolean
	autofocused?: boolean
	// Error: ?
	// Icon: ?
	// VALIDATION: ?
	maxLength?: number
	handleChange: (value: string) => void
	handleBlur: () => void
	handleFocus: () => void
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
	handleChange,
	handleBlur,
	handleFocus,
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
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				onFocus={handleFocus}
				className='border-b border-gray-300'
			/>
		</div>
	)
}

export default InputTextBox
