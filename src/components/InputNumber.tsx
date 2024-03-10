import React from 'react'
import InputTextBox, { InputType } from './InputTextBox'

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
		const parsedValue = parseFloat(newValue)
		if (!isNaN(parsedValue) && (parsedValue >= min || !min) && (parsedValue <= max || !max)) {
			handleChange(parsedValue)
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
		/>
	)
}

export default InputNumber
