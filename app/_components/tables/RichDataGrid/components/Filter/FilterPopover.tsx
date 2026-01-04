/**
 * FilterPopover - Base Filter Popover Component
 *
 * Provides the container and common UI for column filters.
 * Renders the appropriate filter input based on filter type.
 *
 * **Portal Rendering:**
 * Uses React Portal to render at document.body, ensuring popovers are never
 * clipped by parent containers with overflow:hidden/auto. Essential for filters
 * inside horizontally scrollable tables (MAANG pattern: AG Grid, MUI DataGrid).
 *
 * Following MAANG patterns: composable, accessible, theme-aware.
 *
 * @module FilterPopover
 */

'use client'
'use memo'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Filter, X, Check } from 'lucide-react'

import { usePopoverPosition } from '@_shared/hooks'

import { useClickOutside, useEscapeKey } from '../../hooks/useClickOutside'
import {
	FilterType,
	type ColumnId,
	type ColumnFilterValue,
	type ColumnFilterOptions,
	type FacetData,
	type SelectOption,
	hasValidFilterValue,
} from '../../types'
import { TextFilterInput } from './TextFilterInput'
import { NumberFilterInput } from './NumberFilterInput'
import { DateFilterInput } from './DateFilterInput'
import { SelectFilterInput } from './SelectFilterInput'
import { BooleanFilterInput } from './BooleanFilterInput'

// ============================================================================
// PROPS
// ============================================================================

export interface FilterPopoverProps<TData = unknown> {
	/** Column identifier */
	columnId: ColumnId
	/** Filter type for this column */
	filterType: FilterType
	/** Column filter options (select options, etc.) */
	filterOptions?: ColumnFilterOptions<TData>
	/** Facet data from server for dynamic options (for faceted filters) */
	facetData?: FacetData
	/** Current filter value (if any) */
	currentValue?: ColumnFilterValue
	/** Callback when filter is applied */
	onApply: (value: ColumnFilterValue | null) => void
	/** Column header label for display */
	columnLabel?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Filter popover component.
 * Renders filter icon with dropdown containing type-specific filter controls.
 *
 * @example
 * <FilterPopover
 *   columnId={createColumnId('name')}
 *   filterType={FilterType.Text}
 *   onApply={(filter) => setColumnFilter('name', filter)}
 * />
 */
export function FilterPopover<TData = unknown>({
	columnId,
	filterType,
	filterOptions,
	facetData,
	currentValue,
	onApply,
	columnLabel,
}: FilterPopoverProps<TData>) {
	const [isOpen, setIsOpen] = useState(false)
	const [localValue, setLocalValue] = useState<ColumnFilterValue | null>(currentValue ?? null)
	const [isMounted, setIsMounted] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)

	// SSR-safe: only render portal after hydration
	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Calculate popover position relative to trigger
	const position = usePopoverPosition(triggerRef, isOpen)

	// Sync local state with external value
	useEffect(() => {
		setLocalValue(currentValue ?? null)
	}, [currentValue])

	// Close handlers
	const closePopover = () => {
		setIsOpen(false)
	}

	useClickOutside(popoverRef, closePopover, isOpen)
	useEscapeKey(closePopover, isOpen)

	// Check if filter is active
	const isActive = currentValue && hasValidFilterValue(currentValue)

	// Apply filter
	const handleApply = () => {
		if (localValue && hasValidFilterValue(localValue)) {
			onApply(localValue)
		} else {
			onApply(null)
		}
		setIsOpen(false)
	}

	// Clear filter
	const handleClear = () => {
		setLocalValue(null)
		onApply(null)
		setIsOpen(false)
	}

	// Render filter input based on type
	const renderFilterInput = () => {
		switch (filterType) {
			case FilterType.Text:
				return (
					<TextFilterInput
						value={localValue}
						onChange={setLocalValue}
					/>
				)

			case FilterType.Number:
				return (
					<NumberFilterInput
						value={localValue}
						onChange={setLocalValue}
					/>
				)

			case FilterType.Date:
				return (
					<DateFilterInput
						value={localValue}
						onChange={setLocalValue}
					/>
				)

			case FilterType.Select: {
				// Prefer facet options (dynamic from server) over static options
				const selectOptions: SelectOption[] = facetData
					? facetData.values.map((fc) => ({
							value: fc.value,
							// Use label if available (e.g., category name), otherwise fall back to value
							// Include count in parentheses for faceted display
							label: `${fc.label ?? fc.value} (${fc.count})`,
						}))
					: (filterOptions?.options as SelectOption[] ?? [])

				return (
					<SelectFilterInput
						value={localValue}
						onChange={setLocalValue}
						options={selectOptions}
					/>
				)
			}

			case FilterType.Boolean:
				return (
					<BooleanFilterInput
						value={localValue}
						onChange={setLocalValue}
					/>
				)

			case FilterType.Range:
				return (
					<NumberFilterInput
						value={localValue}
						onChange={setLocalValue}
						isRange
					/>
				)

			default:
				return <p className="text-sm text-base-content/60">Unsupported filter type</p>
		}
	}

	// Popover content - rendered via portal to escape overflow containers
	// Only render when position is calculated to prevent flash from (0,0)
	const popoverContent = isOpen && isMounted && position.isPositioned && (
		<div
			ref={popoverRef}
			className="
				fixed z-[9999]
				bg-base-100 dark:bg-base-200
				border border-base-300 dark:border-base-content/20
				rounded-lg shadow-lg dark:shadow-2xl
				min-w-[280px] max-w-[90vw]
				animate-in fade-in-0 zoom-in-95 duration-150
				origin-top-left
			"
			style={{
				top: position.top,
				left: position.left,
			}}
			role="dialog"
			aria-label={`Filter options for ${columnLabel ?? columnId}`}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2 border-b border-base-200 dark:border-base-content/10">
				<span className="text-sm font-medium text-base-content dark:text-base-content/90">
					Filter: {columnLabel ?? columnId}
				</span>
				<button
					type="button"
					onClick={closePopover}
					className="p-1 rounded hover:bg-base-200 dark:hover:bg-base-content/10 transition-colors"
					aria-label="Close filter"
				>
					<X className="h-4 w-4 text-base-content/60" />
				</button>
			</div>

			{/* Filter Content */}
			<div className="p-3 space-y-3">
				{renderFilterInput()}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between px-3 py-2 border-t border-base-200 dark:border-base-content/10 bg-base-50 dark:bg-base-content/5 rounded-b-lg">
				<button
					type="button"
					onClick={handleClear}
					className="btn btn-ghost btn-sm text-base-content/60 hover:text-base-content"
					disabled={!localValue}
				>
					Clear
				</button>
				<button
					type="button"
					onClick={handleApply}
					className="btn btn-primary btn-sm gap-1"
				>
					<Check className="h-4 w-4" />
					Apply
				</button>
			</div>
		</div>
	)

	return (
		<>
			{/* Filter Icon Button - stays in place */}
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`
					p-1 rounded transition-colors touch-manipulation
					${isActive
						? 'text-primary bg-primary/10 hover:bg-primary/20'
						: 'text-base-content/40 hover:text-base-content/70 hover:bg-base-200/50 dark:hover:bg-base-content/10'
					}
				`}
				aria-label={`Filter ${columnLabel ?? columnId}`}
				aria-expanded={isOpen}
				aria-haspopup="dialog"
			>
				<Filter className="h-3.5 w-3.5" />
			</button>

			{/* Portal: Render popover at document.body to escape overflow containers */}
			{isMounted && createPortal(popoverContent, document.body)}
		</>
	)
}

export default FilterPopover
