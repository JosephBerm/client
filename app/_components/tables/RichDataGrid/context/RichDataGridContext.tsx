/**
 * RichDataGrid Context Provider
 *
 * Provides grid state and actions to all child components.
 * Enables deep component composition without prop drilling.
 *
 * @module RichDataGridContext
 */

'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { UseRichDataGridReturn } from '../types'

// ============================================================================
// CONTEXT TYPE
// ============================================================================

/**
 * Context value type - same as hook return type but with generic any.
 * Using any here to avoid complex generic propagation through context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RichDataGridContextValue = UseRichDataGridReturn<any> | null

// ============================================================================
// CONTEXT
// ============================================================================

const RichDataGridContext = createContext<RichDataGridContextValue>(null)

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Provider props.
 */
interface RichDataGridProviderProps<TData> {
	/** Grid state from useRichDataGrid hook */
	value: UseRichDataGridReturn<TData>
	/** Child components */
	children: ReactNode
}

/**
 * Provider component for RichDataGrid context.
 *
 * @example
 * const gridState = useRichDataGrid({ ... })
 *
 * return (
 *   <RichDataGridProvider value={gridState}>
 *     <RichDataGridToolbar />
 *     <RichDataGridTable />
 *     <RichDataGridPagination />
 *   </RichDataGridProvider>
 * )
 */
export function RichDataGridProvider<TData>({ value, children }: RichDataGridProviderProps<TData>) {
	return <RichDataGridContext.Provider value={value as RichDataGridContextValue}>{children}</RichDataGridContext.Provider>
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access RichDataGrid context.
 * Must be used within a RichDataGridProvider.
 *
 * @throws Error if used outside of RichDataGridProvider
 *
 * @example
 * function MyToolbarButton() {
 *   const { selectedCount, clearSelection } = useRichDataGridContext()
 *
 *   return (
 *     <button onClick={clearSelection}>
 *       Clear {selectedCount} selected
 *     </button>
 *   )
 * }
 */
export function useRichDataGridContext<TData = unknown>(): UseRichDataGridReturn<TData> {
	const context = useContext(RichDataGridContext)

	if (!context) {
		throw new Error('useRichDataGridContext must be used within a RichDataGridProvider')
	}

	return context as UseRichDataGridReturn<TData>
}

// ============================================================================
// SELECTIVE HOOKS - Performance optimization
// ============================================================================

/**
 * Hook to access only selection-related state.
 * Use for components that only need selection info.
 */
export function useRichDataGridSelection() {
	const { rowSelection, selectedRows, selectedIds, selectedCount, setRowSelection, clearSelection, selectAll } =
		useRichDataGridContext()

	return {
		rowSelection,
		selectedRows,
		selectedIds,
		selectedCount,
		setRowSelection,
		clearSelection,
		selectAll,
	}
}

/**
 * Hook to access only filter-related state.
 */
export function useRichDataGridFilters() {
	const { globalFilter, setGlobalFilter, columnFilters, setColumnFilters, clearColumnFilters, activeFilterCount } =
		useRichDataGridContext()

	return {
		globalFilter,
		setGlobalFilter,
		columnFilters,
		setColumnFilters,
		clearColumnFilters,
		activeFilterCount,
	}
}

/**
 * Hook to access only pagination-related state.
 */
export function useRichDataGridPagination() {
	const { pagination, setPagination, pageCount, canPreviousPage, canNextPage, totalItems } = useRichDataGridContext()

	return {
		pagination,
		setPagination,
		pageCount,
		canPreviousPage,
		canNextPage,
		totalItems,
	}
}

/**
 * Hook to access only visibility-related state.
 */
export function useRichDataGridVisibility() {
	const { columnVisibility, setColumnVisibility, toggleColumnVisibility, visibleColumnCount, hiddenColumnCount, table } =
		useRichDataGridContext()

	return {
		columnVisibility,
		setColumnVisibility,
		toggleColumnVisibility,
		visibleColumnCount,
		hiddenColumnCount,
		columns: table.getAllLeafColumns(),
	}
}

/**
 * Hook to access only loading-related state.
 */
export function useRichDataGridLoading() {
	const { loadingState, isLoading, isRefreshing, error, refresh } = useRichDataGridContext()

	return {
		loadingState,
		isLoading,
		isRefreshing,
		error,
		refresh,
	}
}

export default RichDataGridContext

