import React, { useRef } from 'react'
import Image from 'next/image'
import UploadedFile from '../classes/UploadedFile'

export interface InputType {
	label?: string | undefined // Add a question mark to make the 'label' property optional
	placeholder?: string | undefined
	disabled?: boolean | undefined
	autofocus?: boolean // Corrected the spelling to "autofocus"
	onChange?: (files: any) => any; // Corrected the spelling to "onchange" and specified the return type as void
	onFileDelete?: (file: any) => any
	multiple?: boolean
	value: UploadedFile[] | File[]
}

const InputFile: React.FC<InputType> = ({
	label,
	placeholder,
	disabled,
	autofocus = false, // Corrected the spelling to "autofocus"
	onChange,
	onFileDelete,
	multiple = false,
	value = []
}) => {

	const randomString = Math.random().toString(36).substring(7); // Generate a random string to use as the input ID
	const inputRef = useRef<HTMLInputElement>(null) // Add a ref for the input element

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
	
		if (!files) return;
	
		const fileArray = Array.from(files);
		if (onChange) {
			onChange(fileArray); // Set the field value to the selected file
		}

		// Clear input value
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	}

	function isUploadedFile(file: UploadedFile | File): file is UploadedFile {
		return (file as UploadedFile).filePath !== undefined;
	  }
	  

	return (
		<div className={`flex flex-col items-center relative`} style={{width:'fit-content'}}>
			<label htmlFor={randomString} className='button'>{label ? label : "Upload"}</label>
			<input
				id={randomString}
				ref={inputRef}
				autoFocus={autofocus}
				title=" "
				placeholder={placeholder}
				type="file" // Set the type to "file"
				disabled={disabled}
				className='border-b border-gray-300'
				multiple={multiple}
				onChange={handleFileChange} // Add an onChange event handler to handle file selection
				onInput={(event) => {console.log(event.target)}}
				style={{ display: 'none' }}	// Hide the input element
			/>

			<div style={{display:'flex', flexDirection:'row', gap: 10, width:'100%'}} className='scroll-horizontal-container scroller mt-10'>
				{value.map((file, index) => (
					<div key={index} style={{width:200, height: 200}}>
						<button className="transparent-button image-delete-button" onClick={() => onFileDelete && onFileDelete(file)} style={{position:'absolute', border: 'none'}}>
							<i className='fa-solid fa-trash' style={{color: 'var(--brand-color-1)'}} />
						</button>
						{isUploadedFile(file) ? 
							<Image src={`${process.env.API_URL}/file/getfilebypath?path=${file.filePath}`} width={200} height={200} alt='Product Image' />
							:
							<Image src={URL.createObjectURL(file as File)} width={200} height={200} alt='Product Image' /> // Display the image as a preview
						}
					</div>
				))}
			</div>
		</div>
	)
}

export default InputFile
