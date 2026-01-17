/**
 * BooleanFilterInput - Boolean Filter Input Component
 *
 * Provides boolean filtering with true/false/all options.
 *
 * @module BooleanFilterInput
 */

'use client'
'use memo'

import { useState, useEffect } from 'react'
import {
	FilterType,
	BooleanFilterOperator,
	type ColumnFilterValue,
	type BooleanFilterValue,
	isBooleanFilter,
} from '../../types'

import Radio from '@_components/ui/Radio'

// ============================================================================
// PROPS
// ============================================================================

export interface BooleanFilterInputProps {
	/** Current filter value */
	value: ColumnFilterValue | null
	/** Callback when value changes */
	onChange: (value: ColumnFilterValue | null) => void
	/** Label for true option */
	trueLabel?: string
	/** Label for false option */
	falseLabel?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Boolean filter input with radio button options.
 */
export function BooleanFilterInput({ value, onChange, trueLabel = 'Yes', falseLabel = 'No' }: BooleanFilterInputProps) {
	// Parse current value or use defaults
	const currentFilter = value && isBooleanFilter(value) ? value : null

	const [boolValue, setBoolValue] = useState<boolean | null>(currentFilter?.value ?? null)

	// Sync with external value
	useEffect(() => {
		if (value && isBooleanFilter(value)) {
			setBoolValue(value.value)
		} else if (!value) {
			setBoolValue(null)
		}
	}, [value])

	// Update parent when value changes
	const updateFilter = (newValue: boolean | null) => {
		setBoolValue(newValue)
		const filter: BooleanFilterValue = {
			filterType: FilterType.Boolean,
			operator: BooleanFilterOperator.Is,
			value: newValue,
		}
		onChange(filter)
	}

	return (
		<div className='space-y-2'>
			<label className='block text-xs font-medium text-base-content/70 mb-2'>Value</label>

			{/* All Option */}
			<label className='flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200/50 dark:hover:bg-base-content/5 transition-colors'>
				<Radio
					name='boolean-filter'
					size='sm'
					variant='primary'
					checked={boolValue === null}
					onChange={() => updateFilter(null)}
				/>
				<span className='text-sm text-base-content'>All</span>
			</label>

			{/* True Option */}
			<label className='flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200/50 dark:hover:bg-base-content/5 transition-colors'>
				<Radio
					name='boolean-filter'
					size='sm'
					variant='primary'
					checked={boolValue === true}
					onChange={() => updateFilter(true)}
				/>
				<span className='text-sm text-base-content'>{trueLabel}</span>
			</label>

			{/* False Option */}
			<label className='flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200/50 dark:hover:bg-base-content/5 transition-colors'>
				<Radio
					name='boolean-filter'
					size='sm'
					variant='primary'
					checked={boolValue === false}
					onChange={() => updateFilter(false)}
				/>
				<span className='text-sm text-base-content'>{falseLabel}</span>
			</label>
		</div>
	)
}

export default BooleanFilterInput
