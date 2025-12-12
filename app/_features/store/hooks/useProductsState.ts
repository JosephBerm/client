/**
 * @fileoverview Products State Management Hook
 * 
 * Custom hook for managing product data, pagination, and loading states.
 * Uses useReducer for optimal performance and predictable state updates.
 * 
 * **FAANG Best Practice:**
 * - Encapsulates complex state logic in custom hook
 * - TypeScript discriminated unions for type-safe actions
 * - Immutable state updates
 * - Separation of concerns
 * 
 * @module features/store/hooks/useProductsState
 * @category State Management
 * @see {@link https://react.dev/learn/extracting-state-logic-into-a-reducer}
 */

'use client'

import { useReducer, useCallback } from 'react'

import { PagedResult } from '@_classes/Base/PagedResult'
import type { Product } from '@_classes/Product'

/**
 * Products state interface
 * Manages product list, pagination metadata, and loading states
 */
export interface ProductsState {
	/** Array of product entities currently displayed */
	products: Product[]
	/** Pagination metadata and results from API */
	productsResult: PagedResult<Product>
	/** Loading indicator for async operations */
	isLoading: boolean
	/** Flag indicating if initial data has been loaded */
	hasLoaded: boolean
}

/**
 * Type-safe action types for products state updates
 * Uses discriminated unions for exhaustive type checking
 */
export type ProductsAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_PRODUCTS'; payload: { products: Product[]; result: PagedResult<Product> } }
	| { type: 'SET_HAS_LOADED'; payload: boolean }
	| { type: 'RESET' }

/**
 * Initial state for products reducer
 * Provides sensible defaults for fresh page load
 */
export const initialProductsState: ProductsState = {
	products: [],
	productsResult: new PagedResult<Product>(),
	isLoading: true,
	hasLoaded: false,
}

/**
 * Products reducer function
 * Handles all state transitions for product data
 * 
 * **Pattern:** Immutable state updates following Redux principles
 * 
 * @param state - Current products state
 * @param action - Action to process
 * @returns New state object
 * 
 * @example
 * ```typescript
 * const newState = productsReducer(state, {
 *   type: 'SET_PRODUCTS',
 *   payload: { products: [...], result: pagedResult }
 * })
 * ```
 */
export function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload }
			
		case 'SET_PRODUCTS':
			// Atomically update products and metadata, mark as loaded
			return {
				...state,
				products: action.payload.products,
				productsResult: action.payload.result,
				isLoading: false,
				hasLoaded: true,
			}
			
		case 'SET_HAS_LOADED':
			return { ...state, hasLoaded: action.payload }
			
		case 'RESET':
			// Clear all product data while maintaining loaded state
			return {
				...state,
				products: [],
				productsResult: new PagedResult<Product>(),
				isLoading: false,
				hasLoaded: true,
			}
			
		default:
			// TypeScript ensures this is unreachable with discriminated unions
			return state
	}
}

/**
 * Return type for useProductsState hook
 * Provides state and action dispatchers
 */
export interface UseProductsStateReturn {
	/** Current products state */
	state: ProductsState
	/** Set loading state */
	setLoading: (loading: boolean) => void
	/** Update products and pagination data */
	setProducts: (products: Product[], result: PagedResult<Product>) => void
	/** Mark data as loaded */
	setHasLoaded: (loaded: boolean) => void
	/** Reset to empty state */
	reset: () => void
}

/**
 * Custom hook for managing products state
 * Encapsulates reducer logic and provides convenient action dispatchers
 * 
 * **Benefits:**
 * - Reusable across components
 * - Type-safe actions
 * - Optimized with useCallback
 * - Testable in isolation
 * 
 * **Server-Side Hydration:**
 * When initial state is provided (from Server Component):
 * - Products are available immediately (no loading spinner)
 * - isLoading starts as false, hasLoaded starts as true
 * - Initial fetch can be skipped
 * 
 * @param initialState - Optional initial state for server-side hydration
 * @returns Products state and action dispatchers
 * 
 * @example
 * ```typescript
 * // Without initial data
 * const { state, setProducts, setLoading } = useProductsState()
 * 
 * // With initial data from server
 * const { state } = useProductsState({
 *   products: serverProducts,
 *   productsResult: serverResult,
 *   isLoading: false,
 *   hasLoaded: true,
 * })
 * ```
 */
export function useProductsState(initialState?: Partial<ProductsState>): UseProductsStateReturn {
	// Merge initial state with defaults
	const mergedInitialState: ProductsState = {
		...initialProductsState,
		// Override with provided initial state
		...initialState,
		// If products are provided, mark as loaded and not loading
		...(initialState?.products?.length ? {
			isLoading: false,
			hasLoaded: true,
		} : {}),
	}
	
	const [state, dispatch] = useReducer(productsReducer, mergedInitialState)

	const setLoading = useCallback((loading: boolean) => {
		dispatch({ type: 'SET_LOADING', payload: loading })
	}, [])

	const setProducts = useCallback((products: Product[], result: PagedResult<Product>) => {
		dispatch({
			type: 'SET_PRODUCTS',
			payload: { products, result },
		})
	}, [])

	const setHasLoaded = useCallback((loaded: boolean) => {
		dispatch({ type: 'SET_HAS_LOADED', payload: loaded })
	}, [])

	const reset = useCallback(() => {
		dispatch({ type: 'RESET' })
	}, [])

	return {
		state,
		setLoading,
		setProducts,
		setHasLoaded,
		reset,
	}
}

