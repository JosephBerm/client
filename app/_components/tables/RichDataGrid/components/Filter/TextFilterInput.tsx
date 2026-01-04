/**
 * TextFilterInput - Text Filter Input Component
 *
 * Provides text filtering with operators: contains, equals, startsWith, etc.
 *
 * @module TextFilterInput
 */

'use client'
'use memo'

import { useState, useEffect } from 'react'
import {
	FilterType,
	TextFilterOperator,
	type ColumnFilterValue,
	type TextFilterValue,
	isTextFilter,
	getOperatorLabel,
	operatorRequiresNoValue,
} from '../../types'

// ============================================================================
// PROPS
// ============================================================================

export interface TextFilterInputProps {
	/** Current filter value */
	value: ColumnFilterValue | null
	/** Callback when value changes */
	onChange: (value: ColumnFilterValue | null) => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TEXT_OPERATORS: { value: TextFilterOperator; label: string }[] = [
	{ value: TextFilterOperator.Contains, label: 'Contains' },
	{ value: TextFilterOperator.NotContains, label: 'Does not contain' },
	{ value: TextFilterOperator.Equals, label: 'Equals' },
	{ value: TextFilterOperator.NotEquals, label: 'Does not equal' },
	{ value: TextFilterOperator.StartsWith, label: 'Starts with' },
	{ value: TextFilterOperator.EndsWith, label: 'Ends with' },
	{ value: TextFilterOperator.IsEmpty, label: 'Is empty' },
	{ value: TextFilterOperator.IsNotEmpty, label: 'Is not empty' },
]

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Text filter input with operator selection.
 */
export function TextFilterInput({ value, onChange }: TextFilterInputProps) {
	// Parse current value or use defaults
	const currentFilter = value && isTextFilter(value) ? value : null
	const [operator, setOperator] = useState<TextFilterOperator>(
		currentFilter?.operator ?? TextFilterOperator.Contains
	)
	const [textValue, setTextValue] = useState(currentFilter?.value ?? '')
	const [caseSensitive, setCaseSensitive] = useState(currentFilter?.caseSensitive ?? false)

	// Sync with external value
	useEffect(() => {
		if (value && isTextFilter(value)) {
			setOperator(value.operator)
			setTextValue(value.value)
			setCaseSensitive(value.caseSensitive ?? false)
		} else if (!value) {
			setOperator(TextFilterOperator.Contains)
			setTextValue('')
			setCaseSensitive(false)
		}
	}, [value])

	// Update parent when values change
	const updateFilter = (
		newOperator: TextFilterOperator = operator,
		newValue: string = textValue,
		newCaseSensitive: boolean = caseSensitive
	) => {
		const filter: TextFilterValue = {
			filterType: FilterType.Text,
			operator: newOperator,
			value: newValue,
			caseSensitive: newCaseSensitive,
		}
		onChange(filter)
	}

	const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newOperator = e.target.value as TextFilterOperator
		setOperator(newOperator)
		updateFilter(newOperator, textValue, caseSensitive)
	}

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setTextValue(newValue)
		updateFilter(operator, newValue, caseSensitive)
	}

	const handleCaseSensitiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newCaseSensitive = e.target.checked
		setCaseSensitive(newCaseSensitive)
		updateFilter(operator, textValue, newCaseSensitive)
	}

	const requiresValue = !operatorRequiresNoValue(operator)

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
					{TEXT_OPERATORS.map((op) => (
						<option key={op.value} value={op.value}>
							{op.label}
						</option>
					))}
				</select>
			</div>

			{/* Value Input - Only shown for operators that require value */}
			{requiresValue && (
				<div>
					<label className="block text-xs font-medium text-base-content/70 mb-1">
						Value
					</label>
					<input
						type="text"
						value={textValue}
						onChange={handleValueChange}
						placeholder="Enter text..."
						className="input input-bordered input-sm w-full dark:bg-base-300 dark:border-base-content/20"
					/>
				</div>
			)}

			{/* Case Sensitive Toggle */}
			{requiresValue && (
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={caseSensitive}
						onChange={handleCaseSensitiveChange}
						className="checkbox checkbox-sm checkbox-primary"
					/>
					<span className="text-xs text-base-content/70">Case sensitive</span>
				</label>
			)}
		</div>
	)
}

export default TextFilterInput
