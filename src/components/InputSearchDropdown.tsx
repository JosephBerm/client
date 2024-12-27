import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import classNames from 'classnames'

interface IInputSearchDropdownProps<T> {
	name: keyof T
	options: T[]
	label?: string
	placeholder?: string
	onSearch?: (query: string) => T[]
	value: (item: T) => any
	display: (item: T) => string
	onSelect?: (option: T) => void
}

function InputSearchDropdown<T = any>({
	name,
	options,
	label,
	placeholder,
	onSearch,
	value,
	display,
	onSelect,
}: IInputSearchDropdownProps<T>) {
	const [filteredOptions, setFilteredOptions] = useState<T[]>(options)
	const [searchQuery, setSearchQuery] = useState('') // Change the type to string
	const [activeIndex, setActiveIndex] = useState(-1)
	const [isOpen, setIsOpen] = useState(false)

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (typeof onSearch == 'function') {
			const result = onSearch(event.target.value)
			setFilteredOptions(result)
		} else {
			const filteredOptions = options.filter((option) =>
				display(option).toLowerCase().includes(event.target.value.toLowerCase())
			)
			setFilteredOptions(filteredOptions)
		}
		// Change the event type
		setSearchQuery(event.target.value) // Change the event type
	}

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown') {
			setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1))
		} else if (e.key === 'ArrowUp') {
			setActiveIndex((prev) => Math.max(prev - 1, 0))
		} else if (e.key === 'Enter' && activeIndex >= 0) {
			handleSelect(filteredOptions[activeIndex])
		} else if (e.key === 'Escape') {
			setIsOpen(false)
		}
	}
	const handleSelect = (option: T) => {
		// onSelect(option)
		setIsOpen(false)
	}

	console.log('options', options)

	return (
		<div className='InputSearchDropdown'>
			<input
				type='text'
				value={searchQuery}
				onChange={handleSearchChange}
				placeholder='Search'
				onKeyDown={handleKeyDown}
				onFocus={() => setIsOpen(true)}
			/>
			{isOpen && (
				<div className={classNames({ dropdown: true })}>
					{filteredOptions.map((option, index) => (
						<div
							key={value(option)}
							className={classNames({ clickable: true, active: index === activeIndex })}
							onClick={() => handleSelect(option)}>
							{display(option)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default InputSearchDropdown
