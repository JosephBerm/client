import React, { useRef } from 'react'
import { ErrorMessage, useFormikContext } from 'formik'

type inputMode = 'search' | 'email' | 'tel' | 'text' | 'url' | 'none' | 'numeric' | 'decimal' | undefined

export interface InputType<T> {
	type?: string
	value?: Uint8Array | null | undefined
	label: string
	name: keyof T
	placeholder?: string
	disabled?: boolean
	readOnly?: boolean
	autofocus?: boolean // Corrected the spelling to "autofocus"
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

const FormInputFile: <T>(props: InputType<T>) => JSX.Element = ({
	type = 'text',
	label,
	value,
	name,
	placeholder,
	disabled,
	readOnly,
	autofocus,
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
	const inputRef = useRef<HTMLInputElement>(null) // Add a ref for the input element

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		const reader = new FileReader()
	
		reader.onload = () => {
			const byteArray = reader.result as string
	
			if (file) {
				formikContext.setFieldValue(name as string, byteArray) // Set the field value to the selected file
			}
		}
	
		if (file) {
			reader.readAsDataURL(file)
		}
	}

	return (
		<div className={`${getComponentClass()} flex flex-col items-center relative`}>
			<label>{label}</label>
			<input
				ref={inputRef}
				name={name as string }
				autoFocus={autofocus}
				placeholder={placeholder}
				type="file" // Set the type to "file"
				disabled={disabled}
				readOnly={readOnly}
				inputMode={inputmode}
				pattern={pattern}
				className='border-b border-gray-300'
				onChange={handleFileChange} // Add an onChange event handler to handle file selection
				onInput={(event) => {console.log(event.target)}}
			/>

			<div className='error-message-container'>
				<ErrorMessage name={name as string} component='span' className='error-message two-line-limit' />
			</div>
		</div>
	)
}

export default FormInputFile
