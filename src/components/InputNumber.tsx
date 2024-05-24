import React, { ChangeEvent } from 'react'
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
	const handleInputChange = (newValue: ChangeEvent<HTMLInputElement>) => {
		const parsedValue = parseInt(newValue.currentTarget.value)
		if (!isNaN(parsedValue) && (parsedValue >= min || !min) && (parsedValue <= max || !max)) {
			handleChange(newValue)
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
			className='InputNumber'
		/>
	)
}

export default InputNumber
