'use client'

import React, { useRef } from 'react'

interface InputType {
	type: string
	value: string
	label: string
	isAutoFocused?: boolean
	handleChange: (value: string) => void
	handleBlur: () => void
	handleFocus: () => void
}

const InputTextBox: React.FC<InputType> = ({
	type,
	label,
	value,
	isAutoFocused = false,
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
				autoFocus={isAutoFocused}
				type={type}
				value={value}
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				onFocus={handleFocus}
				className='border-b border-gray-300'
			/>
		</div>
	)
}

export default InputTextBox
