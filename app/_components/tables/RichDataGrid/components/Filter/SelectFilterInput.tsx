/**
 * SelectFilterInput - Select/Multi-Select Filter Input Component
 *
 * Provides select filtering with operators: is, isNot, isAnyOf, isNoneOf.
 *
 * @module SelectFilterInput
 */

'use client'
'use memo'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import {
	FilterType,
	SelectFilterOperator,
	type ColumnFilterValue,
	type SelectFilterValue,
	type SelectOption,
	isSelectFilter,
} from '../../types'

// ============================================================================
// PROPS
// ============================================================================

export interface SelectFilterInputProps {
	/** Current filter value */
	value: ColumnFilterValue | null
	/** Callback when value changes */
	onChange: (value: ColumnFilterValue | null) => void
	/** Available options */
	options: SelectOption[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECT_OPERATORS: { value: SelectFilterOperator; label: string; isMulti: boolean }[] = [
	{ value: SelectFilterOperator.Is, label: 'Is', isMulti: false },
	{ value: SelectFilterOperator.IsNot, label: 'Is not', isMulti: false },
	{ value: SelectFilterOperator.IsAnyOf, label: 'Is any of', isMulti: true },
	{ value: SelectFilterOperator.IsNoneOf, label: 'Is none of', isMulti: true },
]

// Regex to parse labels with counts: "Value (42)" -> { text: "Value", count: "42" }
const COUNT_REGEX = /^(.+?)\s*\((\d+)\)$/

/**
 * Parse option label to extract display text and optional count.
 * Handles both plain labels and faceted labels like "Active (42)".
 */
function parseOptionLabel(label: string): { text: string; count: string | null } {
	const match = label.match(COUNT_REGEX)
	if (match) {
		return { text: match[1].trim(), count: match[2] }
	}
	return { text: label, count: null }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Select filter input with operator selection and multi-select support.
 */
export function SelectFilterInput({ value, onChange, options }: SelectFilterInputProps) {
	// Parse current value or use defaults
	const currentFilter = value && isSelectFilter(value) ? value : null

	const [operator, setOperator] = useState<SelectFilterOperator>(
		currentFilter?.operator ?? SelectFilterOperator.Is
	)
	const [selectedValues, setSelectedValues] = useState<string[]>(
		currentFilter?.values ?? []
	)

	// Sync with external value
	useEffect(() => {
		if (value && isSelectFilter(value)) {
			setOperator(value.operator)
			setSelectedValues(value.values)
		} else if (!value) {
			setOperator(SelectFilterOperator.Is)
			setSelectedValues([])
		}
	}, [value])

	// Get current operator config
	const currentOperator = SELECT_OPERATORS.find((op) => op.value === operator)
	const isMultiSelect = currentOperator?.isMulti ?? false

	// Update parent when values change
	const updateFilter = (
		newOperator: SelectFilterOperator = operator,
		newValues: string[] = selectedValues
	) => {
		const filter: SelectFilterValue = {
			filterType: FilterType.Select,
			operator: newOperator,
			values: newValues,
		}
		onChange(filter)
	}

	const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newOperator = e.target.value as SelectFilterOperator
		const newOperatorConfig = SELECT_OPERATORS.find((op) => op.value === newOperator)

		// If switching from multi to single, keep only first value
		let newValues = selectedValues
		if (!newOperatorConfig?.isMulti && selectedValues.length > 1) {
			newValues = selectedValues.slice(0, 1)
			setSelectedValues(newValues)
		}

		setOperator(newOperator)
		updateFilter(newOperator, newValues)
	}

	const handleSingleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newValue = e.target.value
		const newValues = newValue ? [newValue] : []
		setSelectedValues(newValues)
		updateFilter(operator, newValues)
	}

	const handleMultiValueToggle = (optionValue: string) => {
		const newValues = selectedValues.includes(optionValue)
			? selectedValues.filter((v) => v !== optionValue)
			: [...selectedValues, optionValue]
		setSelectedValues(newValues)
		updateFilter(operator, newValues)
	}

	return (
		<div className="space-y-3">
			{/* Operator Select */}
			<div>
				<label className="block text-xs font-medium text-base-content/70 mb-1">
					Condition
				</label>
				<select
					value={operator}
					onChange={handleOperatorChange}
					className="select select-bordered select-sm w-full dark:bg-base-300 dark:border-base-content/20"
				>
					{SELECT_OPERATORS.map((op) => (
						<option key={op.value} value={op.value}>
							{op.label}
						</option>
					))}
				</select>
			</div>

			{/* Single Select Mode */}
			{!isMultiSelect && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						Value
					</label>
					<select
						value={selectedValues[0] ?? ''}
						onChange={handleSingleValueChange}
						className="select select-bordered select-sm w-full dark:bg-base-300 dark:border-base-content/20"
					>
						<option value="">Select a value...</option>
						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Multi-Select Mode */}
			{isMultiSelect && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						Values ({selectedValues.length} selected)
					</label>
					<div className="border border-base-300 dark:border-base-content/20 rounded-lg max-h-48 overflow-y-auto">
						{options.length === 0 ? (
							<p className="px-3 py-2 text-sm text-base-content/50 italic">
								No options available
							</p>
						) : (
							options.map((option) => {
								const isSelected = selectedValues.includes(option.value)
								const { text, count } = parseOptionLabel(option.label)
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => handleMultiValueToggle(option.value)}
										className={`
											w-full flex items-center justify-between px-3 py-2 text-sm text-left
											hover:bg-base-200 dark:hover:bg-base-content/10
											${isSelected ? 'bg-primary/10 dark:bg-primary/20' : ''}
											transition-colors
										`}
										aria-selected={isSelected}
									>
										<span className={isSelected ? 'text-primary font-medium' : ''}>
											{text}
										</span>
										<div className="flex items-center gap-2">
											{/* Facet count badge */}
											{count !== null && (
												<span className="text-xs text-base-content/50 tabular-nums bg-base-200 dark:bg-base-content/10 px-1.5 py-0.5 rounded">
													{count}
												</span>
											)}
											{isSelected && (
												<Check className="h-4 w-4 text-primary flex-shrink-0" />
											)}
										</div>
									</button>
								)
							})
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default SelectFilterInput
