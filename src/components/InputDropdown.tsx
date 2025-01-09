import React, { useState, useMemo } from 'react'
import classNames from 'classnames'

type InputDropdownProps<T> = {
	sync?: any
	syncState?: (newValue: any) => any
	options: T[]
	display: ((item: T) => string) | keyof T
	value: ((arg: T) => string | number) | keyof T
	handleChange?: (selectedItem: React.ChangeEvent<HTMLSelectElement>) => void // Optional. Parent's callback if needed.
	label?: string
	placeholder?: string
	customClass?: string
	disabled?: boolean
}
function InputDropdown<T>({
	sync,
	syncState,
	value,
	options,
	placeholder,
	customClass,
	display: getDisplay,
	handleChange,
	label,
	disabled,
}: InputDropdownProps<T>) {
	const [internalValue, setInternalValue] = useState<string | number | undefined>(sync)

	// Determine the value to use (controlled by parent or internal state).
	const currentValue = sync ?? internalValue

	const handleChangeInternal = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = e.currentTarget.value
		const selectedItem = options.find((item) =>
			value instanceof Function
				? value(item).toString().toLowerCase() === selectedValue.toString().toLowerCase()
				: item[value as keyof T] === selectedValue
		)
		console.log('selectedValue', selectedValue)
		if (selectedItem) {
			// Update internal state if not controlled by parent.
			const newValue = value instanceof Function ? value(selectedItem) : selectedItem[value as keyof T]
			if (syncState) {
				syncState(newValue as T)
			}
			setInternalValue(newValue as string | number)
		}

		if (handleChange) {
			handleChange(e) // Notify parent if callback is provided.
		}
	}

	const valueToUse = useMemo<string | number | undefined>(() => {
		const selectedItem = options.find((item) =>
			value instanceof Function ? value(item) === currentValue : item[value as keyof T] === currentValue
		)
		return selectedItem
			? value instanceof Function
				? value(selectedItem) // Ensure this resolves to a string or number
				: (selectedItem[value as keyof T] as unknown as string | number) // Explicit cast to valid type
			: '-99'
	}, [currentValue, options, value])

	return (
		<div className={classNames('InputDropdown', customClass)}>
			{!!label && <label>{label}</label>}
			<select value={valueToUse || ''} onChange={handleChangeInternal} disabled={disabled}>
				<option disabled value='-99' className='default-option'>
					{placeholder ?? ''}
				</option>
				{options.map((item, index) => (
					<option
						key={index}
						value={value instanceof Function ? value(item) : (item[value as keyof T] as string | number)}>
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
