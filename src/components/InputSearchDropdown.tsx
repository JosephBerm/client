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
	const [searchQuery, setSearchQuery] = useState('')
	const [selected, setSelected] = useState<T | null>(null)

	const { addDropdown, removeDropdown, toggleDropdown, closeAll, isDropdownOpen } = useDropdownStore()
	const idRef = useRef<number | null>(null)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const randomGuid = crypto.randomUUID()

	useEffect(() => {
		if (options.length > 0) {
			handleSearchChange({ target: { value: searchQuery } } as ChangeEvent<HTMLInputElement>)
		}
	}, [options])

	useEffect(() => {
		if (!dropdownRef) return

		const id = addDropdown(dropdownRef)
		idRef.current = id

		return () => {
			if (idRef.current !== null) removeDropdown(idRef.current)
		}
	}, [dropdownRef, addDropdown, removeDropdown])

	// Add event listener to prevent popover from closing when clicking inside
	useEffect(() => {
		const handlePopoverMouseDown = (e: MouseEvent) => {
			e.preventDefault()
		}

		const popover = document.getElementById(randomGuid)
		popover?.addEventListener('mousedown', handlePopoverMouseDown)

		return () => {
			popover?.removeEventListener('mousedown', handlePopoverMouseDown)
		}
	}, [randomGuid])

	// Position the dropdown
	useEffect(() => {
		const positionDropdown = () => {
			const input = dropdownRef.current?.querySelector('input')
			const dropdown = document.getElementById(randomGuid)

			if (input && dropdown) {
				const rect = input.getBoundingClientRect()
				dropdown.style.top = `${rect.bottom + window.scrollY}px`
				dropdown.style.left = `${rect.left + window.scrollX}px`
				dropdown.style.width = `${rect.width}px`
			}
		}

		positionDropdown()
		window.addEventListener('resize', positionDropdown)

		return () => {
			window.removeEventListener('resize', positionDropdown)
		}
	}, [randomGuid])

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
		setSearchQuery(event.target.value)
	}

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
			const popover = document.getElementById(randomGuid)
			if (popover) {
				(popover as any).hidePopover()
			}
			setSelected(null)
		}
	}

	const handleSelect = (option: T) => {
		setSelected(option)
		setSearchQuery(display(option))
		if (onSelect) onSelect(option)

		const input = dropdownRef.current?.querySelector('input')
		if (input) {
			input.blur()
		}
	}


	const handleBlur = (event: ChangeEvent<HTMLInputElement>) => {
		const popover = document.getElementById(randomGuid)
		if (popover) {
			(popover as any).hidePopover()
		}
	}

	const handleFocus = () => {
		if (idRef.current !== null) {
			closeAll()
			const popover = document.getElementById(randomGuid)
			if (popover) {
				(popover as any).showPopover({ signal: AbortSignal.timeout(10000) });
			}
		}
	}

	const isOpen = idRef.current !== null && isDropdownOpen(idRef.current)

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
				handleBlur={handleBlur}
				disabled={isLoading}
				popovertarget={randomGuid}
			/>
			<div
				className='dropdown'
				id={randomGuid}
				popover="manual"
			>
				{isLoading && (
					<div className='loading-text'>
						<i className='fa-solid fa-spinner animate-spin' />
						Loading dropdown items...
					</div>
				)}
				{!isLoading &&
					filteredOptions.map((option) => (
						<div
							key={value(option)}
							className={classNames({
								option: true,
								clickable: true,
								active: selected === option
							})}
							onClick={() => handleSelect(option)}
						>
							{display(option)}
						</div>
					))}
			</div>
		</div>
	)
}

export default InputSearchDropdown