/**
 * NumberFilterInput - Number Filter Input Component
 *
 * Provides number filtering with operators: equals, greater than, less than, between, etc.
 *
 * @module NumberFilterInput
 */

'use client'
'use memo'

import { useState, useEffect } from 'react'
import {
	FilterType,
	NumberFilterOperator,
	type ColumnFilterValue,
	type NumberFilterValue,
	type RangeFilterValue,
	isNumberFilter,
	isRangeFilter,
	operatorRequiresNoValue,
	operatorRequiresSecondValue,
} from '../../types'

import Input from '@_components/ui/Input'

// ============================================================================
// PROPS
// ============================================================================

export interface NumberFilterInputProps {
	/** Current filter value */
	value: ColumnFilterValue | null
	/** Callback when value changes */
	onChange: (value: ColumnFilterValue | null) => void
	/** Is this a range filter (min/max) */
	isRange?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NUMBER_OPERATORS: { value: NumberFilterOperator; label: string }[] = [
	{ value: NumberFilterOperator.Equals, label: 'Equals' },
	{ value: NumberFilterOperator.NotEquals, label: 'Does not equal' },
	{ value: NumberFilterOperator.GreaterThan, label: 'Greater than' },
	{ value: NumberFilterOperator.GreaterThanOrEqual, label: 'Greater than or equal' },
	{ value: NumberFilterOperator.LessThan, label: 'Less than' },
	{ value: NumberFilterOperator.LessThanOrEqual, label: 'Less than or equal' },
	{ value: NumberFilterOperator.Between, label: 'Between' },
	{ value: NumberFilterOperator.IsEmpty, label: 'Is empty' },
	{ value: NumberFilterOperator.IsNotEmpty, label: 'Is not empty' },
]

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Number filter input with operator selection.
 */
export function NumberFilterInput({ value, onChange, isRange = false }: NumberFilterInputProps) {
	// Parse current value or use defaults
	const currentFilter = value && isNumberFilter(value) ? value : null
	const currentRange = value && isRangeFilter(value) ? value : null

	const [operator, setOperator] = useState<NumberFilterOperator>(
		isRange ? NumberFilterOperator.Between : (currentFilter?.operator ?? NumberFilterOperator.Equals)
	)
	const [numberValue, setNumberValue] = useState<string>(
		currentFilter?.value?.toString() ?? currentRange?.min?.toString() ?? ''
	)
	const [numberValueTo, setNumberValueTo] = useState<string>(
		currentFilter?.valueTo?.toString() ?? currentRange?.max?.toString() ?? ''
	)

	// Sync with external value
	useEffect(() => {
		if (isRange && value && isRangeFilter(value)) {
			setOperator(NumberFilterOperator.Between)
			setNumberValue(value.min?.toString() ?? '')
			setNumberValueTo(value.max?.toString() ?? '')
		} else if (value && isNumberFilter(value)) {
			setOperator(value.operator)
			setNumberValue(value.value?.toString() ?? '')
			setNumberValueTo(value.valueTo?.toString() ?? '')
		} else if (!value) {
			setOperator(isRange ? NumberFilterOperator.Between : NumberFilterOperator.Equals)
			setNumberValue('')
			setNumberValueTo('')
		}
	}, [value, isRange])

	// Update parent when values change
	const updateFilter = (
		newOperator: NumberFilterOperator = operator,
		newValue: string = numberValue,
		newValueTo: string = numberValueTo
	) => {
		// For range filter type
		if (isRange) {
			const filter: RangeFilterValue = {
				filterType: FilterType.Range,
				min: newValue ? parseFloat(newValue) : undefined,
				max: newValueTo ? parseFloat(newValueTo) : undefined,
			}
			onChange(filter)
			return
		}

		// For regular number filter
		const parsedValue = newValue ? parseFloat(newValue) : NaN
		const parsedValueTo = newValueTo ? parseFloat(newValueTo) : undefined

		const filter: NumberFilterValue = {
			filterType: FilterType.Number,
			operator: newOperator,
			value: isNaN(parsedValue) ? 0 : parsedValue,
			...(parsedValueTo !== undefined && !isNaN(parsedValueTo) && { valueTo: parsedValueTo }),
		}
		onChange(filter)
	}

	const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newOperator = e.target.value as NumberFilterOperator
		setOperator(newOperator)
		updateFilter(newOperator, numberValue, numberValueTo)
	}

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setNumberValue(newValue)
		updateFilter(operator, newValue, numberValueTo)
	}

	const handleValueToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValueTo = e.target.value
		setNumberValueTo(newValueTo)
		updateFilter(operator, numberValue, newValueTo)
	}

	const requiresValue = !operatorRequiresNoValue(operator)
	const requiresSecondValue = operatorRequiresSecondValue(operator) || isRange

	return (
		<div className="space-y-3">
			{/* Operator Select - Only for non-range filters */}
			{!isRange && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						Condition
					</label>
					<select
						value={operator}
						onChange={handleOperatorChange}
						className="select select-bordered select-sm w-full dark:bg-base-300 dark:border-base-content/20"
					>
						{NUMBER_OPERATORS.map((op) => (
							<option key={op.value} value={op.value}>
								{op.label}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Value Input */}
			{requiresValue && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						{requiresSecondValue ? (isRange ? 'Minimum' : 'From') : 'Value'}
					</label>
					<Input
						type="number"
						size="sm"
						value={numberValue}
						onChange={handleValueChange}
						placeholder={requiresSecondValue ? 'Min...' : 'Enter number...'}
						className="w-full"
						step="any"
					/>
				</div>
			)}

			{/* Second Value Input (for between/range) */}
			{requiresValue && requiresSecondValue && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						{isRange ? 'Maximum' : 'To'}
					</label>
					<Input
						type="number"
						size="sm"
						value={numberValueTo}
						onChange={handleValueToChange}
						placeholder="Max..."
						className="w-full"
						step="any"
					/>
				</div>
			)}
		</div>
	)
}

export default NumberFilterInput
