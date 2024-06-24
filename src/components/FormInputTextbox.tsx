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
	// why do we need validation here? we can handle that in the validate() function inside the Formik element wrapping this component. Inside the validate method, when whatever condition is false, you would do something like form.error.username = "Invalid username because..."
	maxLength?: number
	className?: string
	rows?: number
}

const FormInputTextBox: (props: InputType) => JSX.Element = ({
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
	className: cssClass,
	rows,
}) => {
	const getComponentClass = () => {
		let className = 'InputTextBox'

		if (cssClass) className += ` ${cssClass}`

		return className
	}

	const formikContext = useFormikContext()
	return (
		<div className={`${getComponentClass()} flex flex-col items-center relative`}>
			<label>{label}</label>
			<Field
				as={type === 'textarea' ? 'textarea' : 'input'}
				name={name}
				autoFocus={autofocused}
				placeholder={placeholder}
				type={type}
				value={(formikContext.values as Record<string, any>)[name as string]}
				disabled={disabled}
				readOnly={readOnly}
				maxLength={maxLength}
				inputMode={inputmode}
				pattern={pattern}
				className='border-b border-gray-300'
				rows={type === 'textarea' && rows ? rows : 4} // Add this line to set the number of rows for textarea
			/>

			<div className='error-message-container'>
				<ErrorMessage name={name as string} component='span' className='error-message two-line-limit' />
			</div>
		</div>
	)
}

export default FormInputTextBox
