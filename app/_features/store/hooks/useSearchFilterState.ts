/**
 * @fileoverview Search and Filter State Management Hook
 * 
 * Custom hook for managing search text, category filters, sorting, and pagination criteria.
 * Uses useReducer for predictable state updates and optimal performance.
 * 
 * **FAANG Best Practice:**
 * - Encapsulates related state in single reducer
 * - Type-safe actions with TypeScript
 * - Immutable state updates
 * - Convenient action creators
 * 
 * @module features/store/hooks/useSearchFilterState
 * @category State Management
 */

'use client'

import { useReducer, useCallback } from 'react'
import ProductsCategory from '@_classes/ProductsCategory'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'

/**
 * Search and filter state interface
 * Groups all user-facing filter controls
 */
export interface SearchFilterState {
	/** Current search input text */
	searchText: string
	/** Selected product categories for filtering */
	selectedCategories: ProductsCategory[]
	/** Search criteria object sent to API */
	searchCriteria: GenericSearchFilter
	/** Current sort option value */
	currentSort: string
	/** Current page size for pagination */
	currentPageSize: number
}

/**
 * Type-safe action types for search/filter state updates
 */
export type SearchFilterAction =
	| { type: 'SET_SEARCH_TEXT'; payload: string }
	| { type: 'SET_SELECTED_CATEGORIES'; payload: ProductsCategory[] }
	| { type: 'SET_SEARCH_CRITERIA'; payload: GenericSearchFilter }
	| { type: 'SET_CURRENT_SORT'; payload: string }
	| { type: 'SET_CURRENT_PAGE_SIZE'; payload: number }
	| { type: 'RESET_FILTERS'; payload: GenericSearchFilter }

/**
 * Initial state factory function
 * Creates fresh state with default values
 * 
 * @param initialPageSize - Default page size
 * @param initialFilter - Initial search criteria
 * @returns Initial state object
 */
export function createInitialSearchFilterState(
	initialPageSize: number,
	initialFilter: GenericSearchFilter
): SearchFilterState {
	return {
		searchText: '',
		selectedCategories: [],
		searchCriteria: initialFilter,
		currentSort: 'relevance',
		currentPageSize: initialPageSize,
	}
}

/**
 * Search filter reducer function
 * Handles all state transitions for search and filtering
 * 
 * @param state - Current search filter state
 * @param action - Action to process
 * @returns New state object
 */
export function searchFilterReducer(
	state: SearchFilterState,
	action: SearchFilterAction
): SearchFilterState {
	switch (action.type) {
		case 'SET_SEARCH_TEXT':
			return { ...state, searchText: action.payload }
			
		case 'SET_SELECTED_CATEGORIES':
			return { ...state, selectedCategories: action.payload }
			
		case 'SET_SEARCH_CRITERIA':
			return { ...state, searchCriteria: action.payload }
			
		case 'SET_CURRENT_SORT':
			return { ...state, currentSort: action.payload }
			
		case 'SET_CURRENT_PAGE_SIZE':
			return { ...state, currentPageSize: action.payload }
			
		case 'RESET_FILTERS':
			// Reset all filters while preserving page size
			return {
				...state,
				searchText: '',
				selectedCategories: [],
				searchCriteria: action.payload,
			}
			
		default:
			return state
	}
}

/**
 * Return type for useSearchFilterState hook
 */
export interface UseSearchFilterStateReturn {
	/** Current search/filter state */
	state: SearchFilterState
	/** Update search text */
	setSearchText: (text: string) => void
	/** Update selected categories */
	setSelectedCategories: (categories: ProductsCategory[]) => void
	/** Update search criteria */
	setSearchCriteria: (criteria: GenericSearchFilter) => void
	/** Update sort option */
	setCurrentSort: (sort: string) => void
	/** Update page size */
	setCurrentPageSize: (size: number) => void
	/** Reset all filters to defaults */
	resetFilters: (initialFilter: GenericSearchFilter) => void
}

/**
 * Custom hook for managing search and filter state
 * Provides convenient action dispatchers for all filter operations
 * 
 * **Benefits:**
 * - Centralized filter state management
 * - Type-safe operations
 * - Optimized with useCallback
 * - Easy to test
 * 
 * @param initialState - Initial state object
 * @returns Search filter state and action dispatchers
 * 
 * @example
 * ```typescript
 * const { state, setSearchText, setSelectedCategories } = useSearchFilterState(initialState)
 * 
 * // Update search
 * setSearchText('medical supplies')
 * 
 * // Update categories
 * setSelectedCategories([category1, category2])
 * ```
 */
export function useSearchFilterState(
	initialState: SearchFilterState
): UseSearchFilterStateReturn {
	const [state, dispatch] = useReducer(searchFilterReducer, initialState)

	const setSearchText = useCallback((text: string) => {
		dispatch({ type: 'SET_SEARCH_TEXT', payload: text })
	}, [])

	const setSelectedCategories = useCallback((categories: ProductsCategory[]) => {
		dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: categories })
	}, [])

	const setSearchCriteria = useCallback((criteria: GenericSearchFilter) => {
		dispatch({ type: 'SET_SEARCH_CRITERIA', payload: criteria })
	}, [])

	const setCurrentSort = useCallback((sort: string) => {
		dispatch({ type: 'SET_CURRENT_SORT', payload: sort })
	}, [])

	const setCurrentPageSize = useCallback((size: number) => {
		dispatch({ type: 'SET_CURRENT_PAGE_SIZE', payload: size })
	}, [])

	const resetFilters = useCallback((initialFilter: GenericSearchFilter) => {
		dispatch({ type: 'RESET_FILTERS', payload: initialFilter })
	}, [])

	return {
		state,
		setSearchText,
		setSelectedCategories,
		setSearchCriteria,
		setCurrentSort,
		setCurrentPageSize,
		resetFilters,
	}
}

