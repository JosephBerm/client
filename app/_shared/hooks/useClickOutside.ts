/**
 * useClickOutside - Hook to detect clicks outside an element
 *
 * Follows industry best practice for dropdown/modal dismissal.
 * Consolidated logic to avoid duplication (DRY principle).
 *
 * @module useClickOutside
 */

'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Hook to run a callback when clicking outside a referenced element.
 * Automatically handles event listener setup and cleanup.
 *
 * @param ref - React ref to the element to detect clicks outside of
 * @param callback - Function to call when clicking outside
 * @param enabled - Whether the hook is active (default: true)
 *
 * @example
 * const dropdownRef = useRef<HTMLDivElement>(null)
 * const [isOpen, setIsOpen] = useState(false)
 *
 * useClickOutside(dropdownRef, () => setIsOpen(false), isOpen)
 */
export function useClickOutside(
	ref: RefObject<HTMLElement | null>,
	callback: () => void,
	enabled: boolean = true
): void {
	useEffect(() => {
		if (!enabled) return

		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callback()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [ref, callback, enabled])
}

/**
 * Hook to close on Escape key press.
 *
 * @param callback - Function to call when Escape is pressed
 * @param enabled - Whether the hook is active
 */
export function useEscapeKey(callback: () => void, enabled: boolean = true): void {
	useEffect(() => {
		if (!enabled) return

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				callback()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [callback, enabled])
}

export default useClickOutside

