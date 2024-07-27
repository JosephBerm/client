import React, { ChangeEvent } from 'react'
import InputTextBox, { InputType } from './InputTextBox'
import '@/styles/inputcomponents.css'

interface InputNumberType extends Omit<InputType, 'type' | 'handleChange'> {
	min?: number
	max?: number
	handleChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

const InputNumber: React.FC<InputNumberType> = ({
	value,
	min = Number.MIN_VALUE,
	max = Number.MAX_VALUE,
	handleChange = () => {},
	...rest
}) => {
	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const parsedValue = parseInt(event.currentTarget.value, 10)
		if (!isNaN(parsedValue) && (parsedValue >= min || !min) && (parsedValue <= max || !max)) {
			handleChange(event) // Pass event to handleChange
		}
	}

	return (
		<InputTextBox
			{...rest}
			type='number'
			value={value}
			handleChange={handleInputChange} // Correctly use handleChange here
			inputmode='numeric'
			pattern='[0-9]*'
			className='InputNumber'
		/>
	)
}

export default InputNumber
