/**
 * Column Helper - Type-safe Column Definition Factory
 *
 * Provides a fluent API for creating RichDataGrid columns with proper types.
 * Following TanStack Table's createColumnHelper pattern.
 *
 * @module columnHelper
 */

import {
	type RichColumnDef,
	type ColumnFilterOptions,
	type FilterOperator,
	FilterType,
	TextFilterOperator,
	NumberFilterOperator,
	DateFilterOperator,
	SelectFilterOperator,
	BooleanFilterOperator,
} from '../types'

import type { AccessorFn, DeepKeys, DeepValue } from '@tanstack/react-table'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Column definition with accessor key.
 */
export type RichColumnDefWithAccessor<TData, TValue> = RichColumnDef<TData, TValue> & {
	accessorKey: DeepKeys<TData>
}

/**
 * Column definition with accessor function.
 */
export type RichColumnDefWithFn<TData, TValue> = RichColumnDef<TData, TValue> & {
	accessorFn: AccessorFn<TData, TValue>
}

/**
 * Column definition for display-only columns.
 */
export type RichColumnDefDisplay<TData> = RichColumnDef<TData, unknown> & {
	id: string
}

// ============================================================================
// COLUMN HELPER
// ============================================================================

/**
 * Create a column helper for type-safe column definitions.
 *
 * @template TData - Row data type
 *
 * @example
 * const columnHelper = createRichColumnHelper<Product>()
 *
 * const columns = [
 *   columnHelper.accessor('name', {
 *     header: 'Product Name',
 *     filterType: FilterType.Text,
 *     searchable: true,
 *   }),
 *   columnHelper.accessor('price', {
 *     header: 'Price',
 *     filterType: FilterType.Number,
 *     cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
 *   }),
 *   columnHelper.display({
 *     id: 'actions',
 *     header: 'Actions',
 *     cell: ({ row }) => <ActionsMenu row={row} />,
 *   }),
 * ]
 */
export function createRichColumnHelper<TData>() {
	return {
		/**
		 * Create a column with an accessor key (string path to data).
		 */
		accessor: <TKey extends DeepKeys<TData>, TValue = DeepValue<TData, TKey>>(
			accessorKey: TKey,
			options: Omit<RichColumnDef<TData, TValue>, 'accessorKey'> & {
				/** Filter type for column */
				filterType?: FilterType
				/** Include in global search */
				searchable?: boolean
				/** Show as faceted filter */
				faceted?: boolean
			} = {}
		): RichColumnDefWithAccessor<TData, TValue> => {
			const { filterType, searchable, faceted, meta, ...rest } = options

			// Build filter options if filter type specified
			let filterOptions: ColumnFilterOptions<TData> | undefined
			if (filterType) {
				filterOptions = {
					filterType,
					searchable,
					faceted,
					defaultOperator: getDefaultOperator(filterType),
				}
			}

			return {
				accessorKey,
				// Place filterOptions in meta for RichDataGridHeader to find
				meta: {
					...meta,
					filterOptions,
				},
				// Also keep at top level for backwards compatibility
				filterOptions,
				enableSorting: true,
				...rest,
			} as RichColumnDefWithAccessor<TData, TValue>
		},

		/**
		 * Create a column with an accessor function.
		 */
		accessorFn: <TValue>(
			accessorFn: AccessorFn<TData, TValue>,
			options: Omit<RichColumnDef<TData, TValue>, 'accessorFn'> & {
				id: string
				filterType?: FilterType
				searchable?: boolean
				faceted?: boolean
			}
		): RichColumnDefWithFn<TData, TValue> => {
			const { filterType, searchable, faceted, meta, ...rest } = options

			// Build filter options if filter type specified
			let filterOptions: ColumnFilterOptions<TData> | undefined
			if (filterType) {
				filterOptions = {
					filterType,
					searchable,
					faceted,
					defaultOperator: getDefaultOperator(filterType),
				}
			}

			return {
				accessorFn,
				// Place filterOptions in meta for RichDataGridHeader to find
				meta: {
					...meta,
					filterOptions,
				},
				// Also keep at top level for backwards compatibility
				filterOptions,
				enableSorting: true,
				...rest,
			} as RichColumnDefWithFn<TData, TValue>
		},

		/**
		 * Create a display-only column (no accessor, for actions, etc.).
		 */
		display: (options: RichColumnDefDisplay<TData>): RichColumnDefDisplay<TData> => {
			return {
				enableSorting: false,
				enableHiding: false,
				...options,
			} as RichColumnDefDisplay<TData>
		},
	}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default operator for a filter type.
 */
function getDefaultOperator(filterType: FilterType): FilterOperator {
	switch (filterType) {
		case FilterType.Text:
			return TextFilterOperator.Contains
		case FilterType.Number:
			return NumberFilterOperator.Equals
		case FilterType.Date:
			return DateFilterOperator.Is
		case FilterType.Select:
			return SelectFilterOperator.Is
		case FilterType.Boolean:
			return BooleanFilterOperator.Is
		case FilterType.Range:
			return NumberFilterOperator.Between
		default:
			return TextFilterOperator.Contains
	}
}

/**
 * Quick helper to create a text column.
 */
export function textColumn<TData, TKey extends DeepKeys<TData>>(
	accessorKey: TKey,
	header: string,
	options: Partial<RichColumnDef<TData, unknown>> = {}
): RichColumnDefWithAccessor<TData, DeepValue<TData, TKey>> {
	const helper = createRichColumnHelper<TData>()
	return helper.accessor(accessorKey, {
		header,
		filterType: FilterType.Text,
		searchable: true,
		...options,
	})
}

/**
 * Quick helper to create a number column.
 */
export function numberColumn<TData, TKey extends DeepKeys<TData>>(
	accessorKey: TKey,
	header: string,
	options: Partial<RichColumnDef<TData, unknown>> = {}
): RichColumnDefWithAccessor<TData, DeepValue<TData, TKey>> {
	const helper = createRichColumnHelper<TData>()
	return helper.accessor(accessorKey, {
		header,
		filterType: FilterType.Number,
		...options,
	})
}

/**
 * Quick helper to create a date column.
 */
export function dateColumn<TData, TKey extends DeepKeys<TData>>(
	accessorKey: TKey,
	header: string,
	options: Partial<RichColumnDef<TData, unknown>> = {}
): RichColumnDefWithAccessor<TData, DeepValue<TData, TKey>> {
	const helper = createRichColumnHelper<TData>()
	return helper.accessor(accessorKey, {
		header,
		filterType: FilterType.Date,
		...options,
	})
}

/**
 * Quick helper to create a select/enum column.
 */
export function selectColumn<TData, TKey extends DeepKeys<TData>>(
	accessorKey: TKey,
	header: string,
	options: Partial<RichColumnDef<TData, unknown>> & { faceted?: boolean } = {}
): RichColumnDefWithAccessor<TData, DeepValue<TData, TKey>> {
	const helper = createRichColumnHelper<TData>()
	return helper.accessor(accessorKey, {
		header,
		filterType: FilterType.Select,
		faceted: options.faceted ?? true,
		...options,
	})
}

export default createRichColumnHelper

