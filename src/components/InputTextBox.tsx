'use client'

import React, { useRef, ChangeEvent } from 'react'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

export interface InputType {
	type: string
	value: string
	label?: string
	placeholder?: string
	iconClass?: string
	disabled?: boolean
	readOnly?: boolean
	autofocused?: boolean
	pattern?: string
	inputmode?: inputMode
	// Error: ?
	// Icon: ?
	// VALIDATION: ?
	maxLength?: number
	handleChange: (value: ChangeEvent<HTMLInputElement>) => void
	handleBlur?: (value: ChangeEvent<HTMLInputElement>) => void
	handleFocus?: () => void
	className?: string
}

const InputTextBox: React.FC<InputType> = ({
	type,
	label,
	value,
	placeholder,
	iconClass,
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

	const getIcon = () => {
		if (!iconClass) return <></>

		return (
			<div className='icon-container'>
				<i className={iconClass}></i>
			</div>
		)
	}

	return (
		<div className='InputTextBox flex flex-col'>
			{label ? (
				<label onClick={focusInput} className='m-2'>
					{label}
				</label>
			) : (
				<></>
			)}
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
				onChange={(e) => handleChange(e)}
				onBlur={handleBlur}
				onFocus={handleFocus}
				className={`${className + ' ' ?? ''}border-b border-gray-300`}
			/>

			{getIcon()}
		</div>
	)
}

export default InputTextBox
