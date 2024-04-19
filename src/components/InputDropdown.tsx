import React, { useRef } from 'react'
import classNames from 'classnames'

type InputDropdownProps<T> = {
	options: T[]
	display: keyof T | ((item: T) => string)
	value: string | number
	handleChange: (value: string) => void
	label?: string
	placeholder?: string
	customClass?: string
	filterIfSelected?: () => T[]
}
function InputDropdown<T extends { id: string; name: string }>({
	value,
	options,
	placeholder,
	customClass,
	display: getDisplay,
	handleChange,
	filterIfSelected,
	label,
}: InputDropdownProps<T>) {
	const handleChangeInternal = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = e.target.value
		handleChange(selectedValue)
	}

	const getOptions = () => {
		if (!filterIfSelected) return options

		return options.filter((option) => !filterIfSelected().find((item) => item.id === option.id))
	}

	return (
		<div className={classNames('InputDropdown', customClass)}>
			{label ? <label>{label}</label> : <></>}
			<select value={value} onChange={handleChangeInternal}>
				<option disabled value='' className='default-option'>
					{placeholder}
				</option>
				{getOptions().map((item, index) => (
					<option key={index} value={item.id}>
						{typeof getDisplay === 'string'
							? (item[getDisplay] as string)
							: typeof getDisplay === 'function'
							? getDisplay(item)
							: ''}
					</option>
				))}
			</select>
		</div>
	)
}

export default InputDropdown