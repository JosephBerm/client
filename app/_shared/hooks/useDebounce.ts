'use client'

/**
 * useDebounce Hook - Industry Best Practice
 * 
 * Debounces a value, delaying updates until after a specified delay period.
 * Commonly used for search inputs, API calls, and expensive operations.
 * 
 * **Industry Standards:**
 * - Follows React Hook patterns (Material UI, Ant Design, Chakra UI)
 * - Prevents excessive API calls
 * - Improves performance and user experience
 * - Type-safe with TypeScript
 * 
 * **Use Cases:**
 * - Search input debouncing (300-500ms)
 * - Form validation debouncing
 * - API request throttling
 * - Expensive computation delays
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 300)
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm.length >= 3) {
 *     performSearch(debouncedSearchTerm)
 *   }
 * }, [debouncedSearchTerm])
 * ```
 * 
 * @module useDebounce
 */

import { useEffect, useState } from 'react'

/**
 * Debounces a value, returning the debounced value after the delay period.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms - industry standard for search)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * // Search with 300ms debounce
 * const debouncedQuery = useDebounce(searchQuery, 300)
 * 
 * // Form validation with 500ms debounce
 * const debouncedEmail = useDebounce(email, 500)
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		// Set up the debounce timer
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		// Clean up the timer if value changes before delay completes
		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

