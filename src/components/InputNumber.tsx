import React from 'react'
import InputTextBox, { InputType } from './InputTextBox'
import '@/styles/inputcomponents.css'

interface InputNumberType extends Omit<InputType, 'type'> {
	min?: number
	max?: number
}

const InputNumber: React.FC<InputNumberType> = ({
	value,
	min = Number.MIN_VALUE,
	max = Number.MAX_VALUE,
	handleChange,
	...rest
}) => {
	const handleInputChange = (newValue: string) => {
		const parsedValue = parseInt(newValue)
		if (!isNaN(parsedValue) && (parsedValue >= min || !min) && (parsedValue <= max || !max)) {
			handleChange(parsedValue)
		} else {
			handleChange(null)
		}
	}

	return (
		<InputTextBox
			{...rest}
			type='number'
			value={value}
			handleChange={handleInputChange}
			inputmode='numeric'
			pattern='[0-9]*'
			className='inputNumber'
		/>
	)
}

export default InputNumber
