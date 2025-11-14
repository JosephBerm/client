'use client'

import { useRef, useCallback, RefCallback } from 'react'

/**
 * useElementRefs Hook
 *
 * Reusable hook for managing refs to multiple elements by key.
 * Follows FAANG-level patterns for efficient ref management.
 *
 * **Features:**
 * - Map-based ref storage for O(1) lookups
 * - Automatic cleanup on unmount
 * - Type-safe with generics
 * - Efficient memory usage
 *
 * **Use Cases:**
 * - Navigation menus with multiple items
 * - Form fields with dynamic refs
 * - List items that need refs
 * - Any component with multiple refs
 *
 * @example
 * ```tsx
 * const { getRef, getElement } = useElementRefs<HTMLButtonElement>()
 *
 * <button ref={getRef('button-1')}>Button 1</button>
 * <button ref={getRef('button-2')}>Button 2</button>
 *
 * // Later, get element by key
 * const element = getElement('button-1')
 * ```
 *
 * @returns Object with getRef, getElement, and getAllElements
 */
export function useElementRefs<T extends HTMLElement = HTMLElement>() {
	const refsMap = useRef<Map<string, T>>(new Map())

	/**
	 * Get a ref callback for a specific key
	 */
	const getRef = useCallback(
		(key: string): RefCallback<T> => {
			return (element: T | null) => {
				if (element) {
					refsMap.current.set(key, element)
				} else {
					refsMap.current.delete(key)
				}
			}
		},
		[]
	)

	/**
	 * Get element by key
	 */
	const getElement = useCallback(
		(key: string): T | undefined => {
			return refsMap.current.get(key)
		},
		[]
	)

	/**
	 * Get all elements
	 */
	const getAllElements = useCallback((): Map<string, T> => {
		return refsMap.current
	}, [])

	/**
	 * Check if element exists for key
	 */
	const hasElement = useCallback(
		(key: string): boolean => {
			return refsMap.current.has(key)
		},
		[]
	)

	/**
	 * Clear all refs
	 */
	const clear = useCallback(() => {
		refsMap.current.clear()
	}, [])

	return {
		getRef,
		getElement,
		getAllElements,
		hasElement,
		clear,
	}
}

