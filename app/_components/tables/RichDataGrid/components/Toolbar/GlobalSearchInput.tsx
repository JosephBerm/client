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

	return (
		<div className={`relative ${className}`}>
			{/* Search Icon */}
			<div className={`absolute ${iconLeftClasses[size]} top-1/2 -translate-y-1/2 text-base-content/50 dark:text-base-content/40 pointer-events-none`}>
				<Search className={iconSizeClasses[size]} />
			</div>

			{/* Input */}
			<input
				ref={inputRef}
				type="text"
				value={localValue}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				autoFocus={autoFocus}
				className={`
					input input-bordered w-full
					${sizeClasses[size]}
					focus:input-primary
					dark:bg-base-200 dark:border-base-content/20
					dark:focus:border-primary
					dark:placeholder:text-base-content/40
					transition-all duration-200
				`}
				aria-label="Search table"
				role="searchbox"
			/>

			{/* Clear Button - Touch-friendly */}
			{localValue && (
				<button
					type="button"
					onClick={handleClear}
					className={`
						absolute ${iconRightClasses[size]} top-1/2 -translate-y-1/2
						text-base-content/50 hover:text-base-content
						dark:text-base-content/40 dark:hover:text-base-content/70
						transition-colors duration-200
						p-1.5 sm:p-1 rounded-full 
						hover:bg-base-200 dark:hover:bg-base-content/10
						touch-manipulation
					`}
					aria-label="Clear search"
				>
					<X className={iconSizeClasses[size]} />
				</button>
			)}
		</div>
	)
}

export default GlobalSearchInput

