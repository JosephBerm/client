'use client'

import React, { useRef } from 'react'
import { Field, ErrorMessage, useFormikContext } from 'formik'

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
	cssClass?: string
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
	cssClass,
}) => {


	const getComponentClass = () => {
		let className = 'InputTextBox'

		// if (cssClass) className += ` ${cssClass}`

		return className
	}

	const formikContext = useFormikContext()
	return (
		<div className={`${getComponentClass()} flex flex-col items-center relative`}>
			<label>{label}</label>
			<Field
				name={name}
				autoFocus={autofocused}
				placeholder={placeholder}
				type={type}
				value={(formikContext.values as Record<string, any>)[name]}
				disabled={disabled}
				readOnly={readOnly}
				maxLength={maxLength}
				inputMode={inputmode}
				pattern={pattern}
				className='border-b border-gray-300'
			/>

			<div className='error-message-container'>
				<ErrorMessage name={name} component='span' className='error-message two-line-limit' />
			</div>
		</div>
	)
}

export default FormInputTextBox
