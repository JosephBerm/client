/**
 * DateFilterInput - Date Filter Input Component
 *
 * Provides date filtering with operators: is, before, after, between, and relative dates.
 *
 * @module DateFilterInput
 */

'use client'
'use memo'

import { useState, useEffect } from 'react'
import {
	FilterType,
	DateFilterOperator,
	type ColumnFilterValue,
	type DateFilterValue,
	isDateFilter,
	operatorRequiresNoValue,
	operatorRequiresSecondValue,
} from '../../types'

import Input from '@_components/ui/Input'

// ============================================================================
// PROPS
// ============================================================================

export interface DateFilterInputProps {
	/** Current filter value */
	value: ColumnFilterValue | null
	/** Callback when value changes */
	onChange: (value: ColumnFilterValue | null) => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DATE_OPERATORS: { value: DateFilterOperator; label: string; group: string }[] = [
	// Specific date operators
	{ value: DateFilterOperator.Is, label: 'Is', group: 'Specific' },
	{ value: DateFilterOperator.IsNot, label: 'Is not', group: 'Specific' },
	{ value: DateFilterOperator.Before, label: 'Before', group: 'Specific' },
	{ value: DateFilterOperator.After, label: 'After', group: 'Specific' },
	{ value: DateFilterOperator.OnOrBefore, label: 'On or before', group: 'Specific' },
	{ value: DateFilterOperator.OnOrAfter, label: 'On or after', group: 'Specific' },
	{ value: DateFilterOperator.Between, label: 'Between', group: 'Specific' },
	// Relative date operators (no value needed)
	{ value: DateFilterOperator.Today, label: 'Today', group: 'Relative' },
	{ value: DateFilterOperator.Yesterday, label: 'Yesterday', group: 'Relative' },
	{ value: DateFilterOperator.ThisWeek, label: 'This week', group: 'Relative' },
	{ value: DateFilterOperator.LastWeek, label: 'Last week', group: 'Relative' },
	{ value: DateFilterOperator.ThisMonth, label: 'This month', group: 'Relative' },
	{ value: DateFilterOperator.LastMonth, label: 'Last month', group: 'Relative' },
	// Empty operators
	{ value: DateFilterOperator.IsEmpty, label: 'Is empty', group: 'Empty' },
	{ value: DateFilterOperator.IsNotEmpty, label: 'Is not empty', group: 'Empty' },
]

// ============================================================================
// HELPERS
// ============================================================================

function formatDateForInput(date: Date | string | undefined): string {
	if (!date) return ''
	const d = typeof date === 'string' ? new Date(date) : date
	if (isNaN(d.getTime())) return ''
	return d.toISOString().split('T')[0]
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Date filter input with operator selection.
 */
export function DateFilterInput({ value, onChange }: DateFilterInputProps) {
	// Parse current value or use defaults
	const currentFilter = value && isDateFilter(value) ? value : null

	const [operator, setOperator] = useState<DateFilterOperator>(
		currentFilter?.operator ?? DateFilterOperator.Is
	)
	const [dateValue, setDateValue] = useState<string>(
		formatDateForInput(currentFilter?.value)
	)
	const [dateValueTo, setDateValueTo] = useState<string>(
		formatDateForInput(currentFilter?.valueTo)
	)

	// Sync with external value
	useEffect(() => {
		if (value && isDateFilter(value)) {
			setOperator(value.operator)
			setDateValue(formatDateForInput(value.value))
			setDateValueTo(formatDateForInput(value.valueTo))
		} else if (!value) {
			setOperator(DateFilterOperator.Is)
			setDateValue('')
			setDateValueTo('')
		}
	}, [value])

	// Update parent when values change
	const updateFilter = (
		newOperator: DateFilterOperator = operator,
		newValue: string = dateValue,
		newValueTo: string = dateValueTo
	) => {
		const filter: DateFilterValue = {
			filterType: FilterType.Date,
			operator: newOperator,
			value: newValue || '',
			...(newValueTo && { valueTo: newValueTo }),
		}
		onChange(filter)
	}

	const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newOperator = e.target.value as DateFilterOperator
		setOperator(newOperator)
		updateFilter(newOperator, dateValue, dateValueTo)
	}

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setDateValue(newValue)
		updateFilter(operator, newValue, dateValueTo)
	}

	const handleValueToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValueTo = e.target.value
		setDateValueTo(newValueTo)
		updateFilter(operator, dateValue, newValueTo)
	}

	const requiresValue = !operatorRequiresNoValue(operator)
	const requiresSecondValue = operatorRequiresSecondValue(operator)

	// Group operators for better UX
	const specificOperators = DATE_OPERATORS.filter((op) => op.group === 'Specific')
	const relativeOperators = DATE_OPERATORS.filter((op) => op.group === 'Relative')
	const emptyOperators = DATE_OPERATORS.filter((op) => op.group === 'Empty')

	return (
		<div className="space-y-3">
			{/* Operator Select with Groups */}
			<div>
				<label className="block text-xs font-medium text-base-content/70 mb-1">
					Condition
				</label>
				<select
					value={operator}
					onChange={handleOperatorChange}
					className="select select-bordered select-sm w-full dark:bg-base-300 dark:border-base-content/20"
				>
					<optgroup label="Specific Date">
						{specificOperators.map((op) => (
							<option key={op.value} value={op.value}>
								{op.label}
							</option>
						))}
					</optgroup>
					<optgroup label="Relative Date">
						{relativeOperators.map((op) => (
							<option key={op.value} value={op.value}>
								{op.label}
							</option>
						))}
					</optgroup>
					<optgroup label="Empty">
						{emptyOperators.map((op) => (
							<option key={op.value} value={op.value}>
								{op.label}
							</option>
						))}
					</optgroup>
				</select>
			</div>

			{/* Date Input */}
			{requiresValue && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						{requiresSecondValue ? 'From' : 'Date'}
					</label>
					<Input
						type="date"
						size="sm"
						value={dateValue}
						onChange={handleValueChange}
						className="w-full"
					/>
				</div>
			)}

			{/* Second Date Input (for between) */}
			{requiresValue && requiresSecondValue && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						To
					</label>
					<Input
						type="date"
						size="sm"
						value={dateValueTo}
						onChange={handleValueToChange}
						className="w-full"
					/>
				</div>
			)}

			{/* Hint for relative dates */}
			{!requiresValue && (
				<p className="text-xs text-base-content/50 italic">
					This filter uses the current date automatically
				</p>
			)}
		</div>
	)
}

export default DateFilterInput
