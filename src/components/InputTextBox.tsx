'use client'

import React, { useRef, ChangeEvent, ReactNode } from 'react'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

type HTMLChildren = {
	children: ReactNode
}
export interface InputType {
	type: string
	value: string
	label?: string
	placeholder?: string
	icon?: string | HTMLChildren
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
	icon,
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
		if (!icon) return <></>
		else if (typeof icon === 'string') {
			return (
				<div className='icon-container'>
					<i className={icon}></i>
				</div>
			)
		}

		return icon.children
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
