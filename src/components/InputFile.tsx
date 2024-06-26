import React, { useRef } from 'react'
import { ErrorMessage } from 'formik'

export interface InputType {
	label?: string | undefined // Add a question mark to make the 'label' property optional
	placeholder?: string | undefined
	disabled?: boolean | undefined
	autofocus?: boolean // Corrected the spelling to "autofocus"
	onChange?: (files: any) => any; // Corrected the spelling to "onchange" and specified the return type as void
	multiple?: boolean
}

const InputFile: React.FC<InputType> = ({
	label,
	placeholder,
	disabled,
	autofocus = false, // Corrected the spelling to "autofocus"
	onChange,
	multiple = false
}) => {

	const inputRef = useRef<HTMLInputElement>(null) // Add a ref for the input element

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
	
		if (!files) return;
	
		const fileArray = Array.from(files);
		if (onChange) {
			onChange(fileArray); // Set the field value to the selected file
		}
	}

	return (
		<div className={`flex flex-col items-center relative`}>
			<label>{label}</label>
			<input
				ref={inputRef}
				autoFocus={autofocus}
				placeholder={placeholder}
				type="file" // Set the type to "file"
				disabled={disabled}
				className='border-b border-gray-300'
				multiple={multiple}
				onChange={handleFileChange} // Add an onChange event handler to handle file selection
				onInput={(event) => {console.log(event.target)}}
			/>

			<div className='error-message-container'>
				<ErrorMessage name="name" component='span' className='error-message two-line-limit' />
			</div>
		</div>
	)
}

export default InputFile
