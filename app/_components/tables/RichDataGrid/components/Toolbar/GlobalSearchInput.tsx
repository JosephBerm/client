/**
 * GlobalSearchInput - Debounced Search Input for RichDataGrid
 *
 * Provides global search across all searchable columns.
 * Follows Google/Meta pattern with debounced input.
 *
 * @module GlobalSearchInput
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useRichDataGridFilters } from '../../context/RichDataGridContext'

import Input from '@_components/ui/Input'
import Button from '@_components/ui/Button'

// ============================================================================
// PROPS
// ============================================================================

export interface GlobalSearchInputProps {
	/** Placeholder text */
	placeholder?: string
	/** Additional CSS classes */
	className?: string
	/** Auto focus on mount */
	autoFocus?: boolean
	/** Size variant */
	size?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Global search input with debounced updates.
 * Connects to RichDataGrid context for state management.
 *
 * @example
 * <GlobalSearchInput placeholder="Search products..." />
 */
export function GlobalSearchInput({
	placeholder = 'Search...',
	className = '',
	autoFocus = false,
	size = 'md',
}: GlobalSearchInputProps) {
	const { globalFilter, setGlobalFilter } = useRichDataGridFilters()
	const [localValue, setLocalValue] = useState(globalFilter)
	const inputRef = useRef<HTMLInputElement>(null)

	// Sync local value with context value
	useEffect(() => {
		setLocalValue(globalFilter)
	}, [globalFilter])

	// Handle input change
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setLocalValue(value)
		setGlobalFilter(value)
	}

	// Handle clear
	const handleClear = () => {
		setLocalValue('')
		setGlobalFilter('')
		inputRef.current?.focus()
	}

	// Handle keyboard shortcuts
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			handleClear()
		}
	}

	// Size classes
	const sizeClasses = {
		sm: 'h-8 text-sm pl-8 pr-8',
		md: 'h-10 text-base pl-10 pr-10',
		lg: 'h-12 text-lg pl-12 pr-12',
	}

	const iconSizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	}

	const iconLeftClasses = {
		sm: 'left-2',
		md: 'left-3',
		lg: 'left-4',
	}

	const iconRightClasses = {
		sm: 'right-2',
		md: 'right-3',
		lg: 'right-4',
	}

	const inputSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'

	return (
		<div className={`relative ${className}`}>
			<Input
				ref={inputRef}
				type='text'
				size={inputSize}
				value={localValue}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				autoFocus={autoFocus}
				leftIcon={<Search className={iconSizeClasses[size]} />}
				rightElement={
					localValue ? (
						<Button
							type='button'
							variant='ghost'
							size='xs'
							onClick={handleClear}
							className='h-auto p-1.5 sm:p-1 rounded-full touch-manipulation'
							aria-label='Clear search'>
							<X className={iconSizeClasses[size]} />
						</Button>
					) : undefined
				}
				aria-label='Search table'
				role='searchbox'
			/>
		</div>
	)
}

export default GlobalSearchInput
