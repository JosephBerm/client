import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import classNames from 'classnames'
import InputTextBox from '@/components/InputTextBox'
import useDropdownStore from '../stores/useDropdownStore'

interface IInputSearchDropdownProps<T> {
	name: keyof T
	options: T[]
	label?: string
	isLoading?: boolean
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
	isLoading,
	placeholder,
	onSearch,
	value,
	display,
	onSelect,
}: IInputSearchDropdownProps<T>) {
	const [filteredOptions, setFilteredOptions] = useState<T[]>(options)
	const [searchQuery, setSearchQuery] = useState('') // Change the type to string
	const [activeIndex, setActiveIndex] = useState(-1)

	const { addDropdown, removeDropdown, toggleDropdown, closeAll, isDropdownOpen } = useDropdownStore()
	const idRef = useRef<number | null>(null)
	const dropdownRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		handleSearchChange({ target: { value: searchQuery } } as ChangeEvent<HTMLInputElement>)
		console.log('options changed')
	}, [options])

	useEffect(() => {
		const id = addDropdown() // Add dropdown to the store and get a unique ID
		idRef.current = id

		return () => {
			if (idRef.current !== null) removeDropdown(idRef.current) // Cleanup on unmount
		}
	}, [addDropdown, removeDropdown])

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
			if (idRef.current !== null) toggleDropdown(idRef.current, false)
		}
	}
	const handleSelect = (option: T) => {
		if (onSelect) onSelect(option)
		if (idRef.current !== null) toggleDropdown(idRef.current, false)
	}

	const handleFocus = () => {
		if (idRef.current !== null) {
			closeAll() // Close all other dropdowns
			toggleDropdown(idRef.current, true) // Open the current dropdown
		}
	}

	const isOpen = idRef.current !== null && isDropdownOpen(idRef.current)
	console.log('component rendered')
	return (
		<div className='InputSearchDropdown' ref={dropdownRef}>
			<InputTextBox
				type={'text'}
				value={searchQuery}
				handleChange={handleSearchChange}
				placeholder='Search'
				handleKeyDown={handleKeyDown}
				handleFocus={handleFocus}
			/>
			{isOpen && !isLoading && (
				<div className='dropdown' ref={dropdownRef}>
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
			{isLoading && <div>show that isLoading is true</div>}
		</div>
	)
}

export default InputSearchDropdown
