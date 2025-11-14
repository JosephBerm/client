'use client'

import { useCallback, useRef } from 'react'

/**
 * Configuration options for useKeyboardNavigation hook
 */
export interface UseKeyboardNavigationOptions<T> {
	/**
	 * Array of items to navigate between
	 */
	items: readonly T[]

	/**
	 * Function to get unique identifier for each item
	 */
	getItemId: (item: T) => string

	/**
	 * Callback when an item is selected via keyboard
	 */
	onSelect?: (item: T, index: number) => void

	/**
	 * Whether to prevent default behavior for arrow keys
	 * @default true
	 */
	preventDefault?: boolean

	/**
	 * Whether to wrap around at boundaries
	 * @default true
	 */
	wrapAround?: boolean
}

/**
 * Return type for useKeyboardNavigation hook
 */
export interface UseKeyboardNavigationReturn {
	/**
	 * Handle keyboard events for navigation
	 */
	handleKeyDown: (e: React.KeyboardEvent, currentIndex: number) => number | null

	/**
	 * Get next index
	 */
	getNextIndex: (currentIndex: number) => number

	/**
	 * Get previous index
	 */
	getPreviousIndex: (currentIndex: number) => number
}

/**
 * useKeyboardNavigation Hook
 *
 * Reusable hook for keyboard navigation patterns (Arrow keys, Home, End).
 * Follows FAANG-level patterns for consistent keyboard navigation across components.
 *
 * **Features:**
 * - Arrow key navigation (Left/Right, Up/Down)
 * - Home/End keys for first/last
 * - Wraps around at boundaries (optional)
 * - Prevents default behavior (optional)
 * - Type-safe with generics
 *
 * **Use Cases:**
 * - Navigation menus
 * - Carousel controls
 * - Tab navigation
 * - List navigation
 * - Any sequential item navigation
 *
 * **Accessibility:**
 * - WCAG 2.1.1 Keyboard (Level A)
 * - WCAG 2.4.3 Focus Order (Level A)
 *
 * @example
 * ```tsx
 * const { handleKeyDown } = useKeyboardNavigation({
 *   items: SECTIONS,
 *   getItemId: (item) => item.id,
 *   onSelect: (item, index) => scrollToSection(item.id),
 * })
 *
 * <button onKeyDown={(e) => {
 *   const newIndex = handleKeyDown(e, currentIndex)
 *   if (newIndex !== null) setCurrentIndex(newIndex)
 * }}>
 * ```
 *
 * @param options - Configuration options
 * @returns Object with handleKeyDown, getNextIndex, and getPreviousIndex
 */
export function useKeyboardNavigation<T>({
	items,
	getItemId,
	onSelect,
	preventDefault = true,
	wrapAround = true,
}: UseKeyboardNavigationOptions<T>): UseKeyboardNavigationReturn {
	const currentIndexRef = useRef<number>(0)

	/**
	 * Get next index with wrap-around support
	 */
	const getNextIndex = useCallback(
		(currentIndex: number): number => {
			if (items.length === 0) return 0
			if (wrapAround) {
				return (currentIndex + 1) % items.length
			}
			return Math.min(currentIndex + 1, items.length - 1)
		},
		[items.length, wrapAround]
	)

	/**
	 * Get previous index with wrap-around support
	 */
	const getPreviousIndex = useCallback(
		(currentIndex: number): number => {
			if (items.length === 0) return 0
			if (wrapAround) {
				return (currentIndex - 1 + items.length) % items.length
			}
			return Math.max(currentIndex - 1, 0)
		},
		[items.length, wrapAround]
	)

	/**
	 * Handle keyboard navigation events
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, currentIndex: number): number | null => {
			let targetIndex: number | null = null

			switch (e.key) {
				case 'ArrowRight':
				case 'ArrowDown':
					if (preventDefault) e.preventDefault()
					targetIndex = getNextIndex(currentIndex)
					break
				case 'ArrowLeft':
				case 'ArrowUp':
					if (preventDefault) e.preventDefault()
					targetIndex = getPreviousIndex(currentIndex)
					break
				case 'Home':
					if (preventDefault) e.preventDefault()
					targetIndex = 0
					break
				case 'End':
					if (preventDefault) e.preventDefault()
					targetIndex = items.length > 0 ? items.length - 1 : 0
					break
				case 'Enter':
				case ' ':
					// Allow default behavior (click)
					return null
				default:
					return null
			}

			// Update ref
			if (targetIndex !== null) {
				currentIndexRef.current = targetIndex

				// Call onSelect callback if provided
				if (onSelect && items[targetIndex]) {
					onSelect(items[targetIndex], targetIndex)
				}
			}

			return targetIndex
		},
		[items, getNextIndex, getPreviousIndex, onSelect, preventDefault]
	)

	return {
		handleKeyDown,
		getNextIndex,
		getPreviousIndex,
	}
}

