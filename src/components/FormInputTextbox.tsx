'use client'

import React, { useRef } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

export interface InputType {
	type?: string
	value?: string
	label: string
	name: string
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
}

const FormInputTextBox: React.FC<InputType> = ({
	type = 'text',
	label,
	value,
	name,
	placeholder,
	disabled,
	readOnly,
	autofocused,
	maxLength,
	inputmode,
	pattern,
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
			<Field
				name={name}
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
				className='border-b border-gray-300'
			/>

			<ErrorMessage name={name} component='div' />
		</div>
	)
}

export default FormInputTextBox
