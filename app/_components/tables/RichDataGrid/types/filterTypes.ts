/**
 * Filter Type Utilities
 *
 * Advanced TypeScript utilities for type-safe filter handling.
 * Includes factory functions, type guards, and serialization helpers.
 *
 * @module FilterTypes
 */

import {
	FilterType,
	TextFilterOperator,
	NumberFilterOperator,
	DateFilterOperator,
	SelectFilterOperator,
	BooleanFilterOperator,
	type TextFilterValue,
	type NumberFilterValue,
	type DateFilterValue,
	type SelectFilterValue,
	type BooleanFilterValue,
	type RangeFilterValue,
	type ColumnFilterValue,
	type BackendColumnFilter,
	type ColumnId,
	createColumnId,
} from './richDataGridTypes'

// ============================================================================
// FILTER VALUE FACTORIES - Type-safe filter creation
// ============================================================================

/**
 * Create a text filter value with type safety.
 *
 * @example
 * const filter = createTextFilter('contains', 'medical')
 */
export function createTextFilter(
	operator: TextFilterOperator,
	value: string,
	caseSensitive = false
): TextFilterValue {
	return {
		filterType: FilterType.Text,
		operator,
		value,
		caseSensitive,
	}
}

/**
 * Create a number filter value with type safety.
 *
 * @example
 * const filter = createNumberFilter('gt', 100)
 * const rangeFilter = createNumberFilter('between', 50, 100)
 */
export function createNumberFilter(
	operator: NumberFilterOperator,
	value: number,
	valueTo?: number
): NumberFilterValue {
	return {
		filterType: FilterType.Number,
		operator,
		value,
		...(valueTo !== undefined && { valueTo }),
	}
}

/**
 * Create a date filter value with type safety.
 *
 * @example
 * const filter = createDateFilter('after', new Date('2024-01-01'))
 */
export function createDateFilter(
	operator: DateFilterOperator,
	value: Date | string,
	valueTo?: Date | string
): DateFilterValue {
	return {
		filterType: FilterType.Date,
		operator,
		value,
		...(valueTo !== undefined && { valueTo }),
	}
}

/**
 * Create a select filter value with type safety.
 *
 * @example
 * const filter = createSelectFilter('isAnyOf', ['Medical Equipment', 'Dental'])
 */
export function createSelectFilter(operator: SelectFilterOperator, values: string[]): SelectFilterValue {
	return {
		filterType: FilterType.Select,
		operator,
		values,
	}
}

/**
 * Create a boolean filter value with type safety.
 *
 * @example
 * const filter = createBooleanFilter(true) // Active items only
 * const allFilter = createBooleanFilter(null) // All items
 */
export function createBooleanFilter(value: boolean | null): BooleanFilterValue {
	return {
		filterType: FilterType.Boolean,
		operator: BooleanFilterOperator.Is,
		value,
	}
}

/**
 * Create a range filter value with type safety.
 *
 * @example
 * const filter = createRangeFilter(100, 500) // Price between $100 and $500
 */
export function createRangeFilter(min?: number, max?: number): RangeFilterValue {
	return {
		filterType: FilterType.Range,
		...(min !== undefined && { min }),
		...(max !== undefined && { max }),
	}
}

// ============================================================================
// FILTER SERIALIZATION - Convert to/from backend format
// ============================================================================

/**
 * Serialize a column filter value to backend format.
 * Converts typed filter values to the generic backend structure.
 *
 * @example
 * const backendFilter = serializeFilter('name', textFilter)
 */
export function serializeFilter(columnId: ColumnId | string, filter: ColumnFilterValue): BackendColumnFilter {
	const base: BackendColumnFilter = {
		columnId: typeof columnId === 'string' ? columnId : columnId,
		filterType: filter.filterType,
		operator: '',
		value: null,
	}

	switch (filter.filterType) {
		case FilterType.Text:
			return {
				...base,
				operator: filter.operator,
				value: filter.value,
			}

		case FilterType.Number:
			return {
				...base,
				operator: filter.operator,
				value: filter.value,
				valueTo: filter.valueTo,
			}

		case FilterType.Date:
			return {
				...base,
				operator: filter.operator,
				value: filter.value instanceof Date ? filter.value.toISOString() : filter.value,
				valueTo: filter.valueTo instanceof Date ? filter.valueTo.toISOString() : filter.valueTo,
			}

		case FilterType.Select:
			return {
				...base,
				operator: filter.operator,
				values: filter.values,
				value: filter.values[0] ?? null, // For single-value compat
			}

		case FilterType.Boolean:
			return {
				...base,
				operator: filter.operator,
				value: filter.value,
			}

		case FilterType.Range:
			return {
				...base,
				operator: NumberFilterOperator.Between,
				value: filter.min,
				valueTo: filter.max,
			}

		default:
			return base
	}
}

/**
 * Deserialize a backend filter to typed column filter value.
 */
export function deserializeFilter(backendFilter: BackendColumnFilter): ColumnFilterValue {
	switch (backendFilter.filterType) {
		case FilterType.Text:
			return {
				filterType: FilterType.Text,
				operator: backendFilter.operator as TextFilterOperator,
				value: String(backendFilter.value ?? ''),
			}

		case FilterType.Number:
			return {
				filterType: FilterType.Number,
				operator: backendFilter.operator as NumberFilterOperator,
				value: Number(backendFilter.value ?? 0),
				valueTo: backendFilter.valueTo !== undefined ? Number(backendFilter.valueTo) : undefined,
			}

		case FilterType.Date:
			return {
				filterType: FilterType.Date,
				operator: backendFilter.operator as DateFilterOperator,
				value: backendFilter.value as string | Date,
				valueTo: backendFilter.valueTo as string | Date | undefined,
			}

		case FilterType.Select:
			return {
				filterType: FilterType.Select,
				operator: backendFilter.operator as SelectFilterOperator,
				values: (backendFilter.values as string[] | undefined) ?? (backendFilter.value ? [String(backendFilter.value)] : []),
			}

		case FilterType.Boolean:
			return {
				filterType: FilterType.Boolean,
				operator: BooleanFilterOperator.Is,
				value: backendFilter.value as boolean | null,
			}

		case FilterType.Range:
			return {
				filterType: FilterType.Range,
				min: backendFilter.value !== undefined ? Number(backendFilter.value) : undefined,
				max: backendFilter.valueTo !== undefined ? Number(backendFilter.valueTo) : undefined,
			}

		default:
			// Default to text filter
			return {
				filterType: FilterType.Text,
				operator: TextFilterOperator.Contains,
				value: String(backendFilter.value ?? ''),
			}
	}
}

// ============================================================================
// FILTER VALIDATION - Validate filter values
// ============================================================================

/**
 * Check if a filter has a valid (non-empty) value.
 * Used to determine if filter should be applied.
 */
export function hasValidFilterValue(filter: ColumnFilterValue): boolean {
	switch (filter.filterType) {
		case FilterType.Text:
			// Empty text is not a valid filter (except for isEmpty/isNotEmpty)
			if (filter.operator === TextFilterOperator.IsEmpty || filter.operator === TextFilterOperator.IsNotEmpty) {
				return true
			}
			return filter.value.trim().length > 0

		case FilterType.Number:
			if (filter.operator === NumberFilterOperator.IsEmpty || filter.operator === NumberFilterOperator.IsNotEmpty) {
				return true
			}
			if (filter.operator === NumberFilterOperator.Between) {
				return filter.value !== undefined && filter.valueTo !== undefined
			}
			return filter.value !== undefined && !isNaN(filter.value)

		case FilterType.Date:
			if (filter.operator === DateFilterOperator.IsEmpty || filter.operator === DateFilterOperator.IsNotEmpty) {
				return true
			}
			// Relative dates are always valid
			if (
				[
					DateFilterOperator.Today,
					DateFilterOperator.Yesterday,
					DateFilterOperator.ThisWeek,
					DateFilterOperator.LastWeek,
					DateFilterOperator.ThisMonth,
					DateFilterOperator.LastMonth,
				].includes(filter.operator)
			) {
				return true
			}
			if (filter.operator === DateFilterOperator.Between) {
				return filter.value !== undefined && filter.valueTo !== undefined
			}
			return filter.value !== undefined

		case FilterType.Select:
			return filter.values.length > 0

		case FilterType.Boolean:
			return filter.value !== undefined

		case FilterType.Range:
			return filter.min !== undefined || filter.max !== undefined

		default:
			return false
	}
}

// ============================================================================
// AVAILABLE OPERATORS BY TYPE - For UI rendering
// ============================================================================

/**
 * Get available operators for a filter type.
 * Used to populate operator dropdown in filter UI.
 */
export function getOperatorsForFilterType(filterType: FilterType): readonly string[] {
	switch (filterType) {
		case FilterType.Text:
			return Object.values(TextFilterOperator)
		case FilterType.Number:
			return Object.values(NumberFilterOperator)
		case FilterType.Date:
			return Object.values(DateFilterOperator)
		case FilterType.Select:
			return Object.values(SelectFilterOperator)
		case FilterType.Boolean:
			return Object.values(BooleanFilterOperator)
		case FilterType.Range:
			return [NumberFilterOperator.Between]
		default:
			return []
	}
}

/**
 * Check if an operator requires a secondary value (e.g., 'between').
 */
export function operatorRequiresSecondValue(operator: string): boolean {
	return [NumberFilterOperator.Between, DateFilterOperator.Between].includes(operator as never)
}

/**
 * Check if an operator requires no value (e.g., 'isEmpty').
 */
export function operatorRequiresNoValue(operator: string): boolean {
	return [
		TextFilterOperator.IsEmpty,
		TextFilterOperator.IsNotEmpty,
		NumberFilterOperator.IsEmpty,
		NumberFilterOperator.IsNotEmpty,
		DateFilterOperator.IsEmpty,
		DateFilterOperator.IsNotEmpty,
		DateFilterOperator.Today,
		DateFilterOperator.Yesterday,
		DateFilterOperator.ThisWeek,
		DateFilterOperator.LastWeek,
		DateFilterOperator.ThisMonth,
		DateFilterOperator.LastMonth,
	].includes(operator as never)
}

