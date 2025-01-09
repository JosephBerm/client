import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import classNames from 'classnames'
import InputTextBox from '@/components/InputTextBox'
import useDropdownStore from '../stores/useDropdownStore'

interface IInputSearchDropdownProps<T> {
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
	options,
	label,
	isLoading = false,
	placeholder,
	onSearch,
	value,
	display,
	onSelect,
}: IInputSearchDropdownProps<T>) {
	const [filteredOptions, setFilteredOptions] = useState<T[]>(options)
	const [searchQuery, setSearchQuery] = useState('') // Change the type to string
	const [selected, setSelected] = useState<T | null>(null)

	const { addDropdown, removeDropdown, toggleDropdown, closeAll, isDropdownOpen } = useDropdownStore()
	const idRef = useRef<number | null>(null)
	const dropdownRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (options.length > 0) {
			handleSearchChange({ target: { value: searchQuery } } as ChangeEvent<HTMLInputElement>)
		}
	}, [options])

	useEffect(() => {
		if (!dropdownRef) return

		const id = addDropdown(dropdownRef) // Add dropdown to the store and get a unique ID
		idRef.current = id

		return () => {
			if (idRef.current !== null) removeDropdown(idRef.current) // Cleanup on unmount
		}
	}, [dropdownRef, addDropdown, removeDropdown])

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
		if (filteredOptions.length === 0) return
		if (selected === null) {
			setSelected(filteredOptions[0])
			return
		}
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault()
			const currentIndex = filteredOptions.indexOf(selected)
			let nextIndex = currentIndex
			if (e.key === 'ArrowDown') {
				nextIndex = currentIndex === filteredOptions.length - 1 ? 0 : currentIndex + 1
			} else if (e.key === 'ArrowUp') {
				nextIndex = currentIndex === 0 ? filteredOptions.length - 1 : currentIndex - 1
			}
			setSelected(filteredOptions[nextIndex])
		} else if (e.key === 'Enter' && selected !== null) {
			handleSelect(selected)
		} else if (e.key === 'Escape') {
			if (idRef.current !== null) toggleDropdown(idRef.current, false)
			setSelected(null)
		}
	}
	const handleSelect = (option: T) => {
		setSelected(option)
		setSearchQuery(display(option)) // Change the property name;
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

	console.log('Rendering Input Search Dropdown')
	return (
		<div className='InputSearchDropdown' ref={dropdownRef}>
			<InputTextBox
				label={label}
				type={'text'}
				value={searchQuery}
				handleChange={handleSearchChange}
				placeholder={placeholder ?? "Search"}
				handleKeyDown={handleKeyDown}
				handleFocus={handleFocus}
				disabled={isLoading}
			/>
			{isOpen && (
				<div className='dropdown'>
					{isLoading && (
						<div className='loading-text'>
							<i className='fa-solid fa-spinner animate-spin' />
							Loading dropdown items...
						</div>
					)}
					{!isLoading &&
						filteredOptions.map((option, index) => (
							<div
								key={value(option)}
								className={classNames({ option: true, clickable: true, active: selected === option })}
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
