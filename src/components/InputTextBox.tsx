'use client'

import React from 'react'

interface InputType {
	type: string
	value: string
	label: string
	handleChange: (value: string) => void
	handleBlur: () => void
	handleFocus: () => void
}

const InputTextBox: React.FC<InputType> = ({ type, label, value, handleChange, handleBlur, handleFocus }) => {
	return (
		<div className='InputTextBox flex flex-col'>
			<label className='m-2'>{label}</label>
			<input
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
