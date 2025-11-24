/**
 * useFocusTrap Hook
 * 
 * Custom React hook for implementing focus trapping in modals and dialogs.
 * Follows WCAG 2.1 guidelines for focus management in modal dialogs.
 * 
 * **Features:**
 * - Traps focus within a container element
 * - Handles Tab and Shift+Tab navigation
 * - Finds all focusable elements automatically
 * - Restores focus to previous element on unmount
 * - SSR-safe
 * 
 * **WCAG 2.1 Compliance:**
 * - SC 2.1.2: No Keyboard Trap (Level A)
 * - SC 2.4.3: Focus Order (Level A)
 * - SC 2.4.7: Focus Visible (Level AA)
 * 
 * **Industry Best Practices:**
 * - Focus trap pattern from WAI-ARIA Authoring Practices
 * - Similar to focus-trap-react, focus-trap libraries
 * - Used by Material-UI, Chakra UI, Radix UI
 * 
 * @module useFocusTrap
 */

'use client'

import type { RefObject } from 'react';
import { useEffect } from 'react'

/**
 * Configuration options for focus trap.
 */
interface FocusTrapOptions {
	/**
	 * Whether the focus trap is enabled.
	 * @default true
	 */
	enabled?: boolean
	/**
	 * Whether to restore focus to the previous element when trap is disabled.
	 * @default true
	 */
	restoreFocus?: boolean
	/**
	 * Initial element to focus when trap is enabled.
	 * If not provided, focuses the first focusable element.
	 */
	initialFocus?: HTMLElement | RefObject<HTMLElement | null>
	/**
	 * Callback when focus escapes the trap (should not happen in normal use).
	 */
	onEscape?: () => void
}

/**
 * List of focusable element selectors.
 * Based on WAI-ARIA Authoring Practices Guide.
 */
const FOCUSABLE_SELECTORS = [
	'a[href]',
	'button:not([disabled])',
	'textarea:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable="true"]',
].join(', ')

/**
 * Gets all focusable elements within a container.
 * 
 * @param container - Container element to search within
 * @returns Array of focusable elements
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
	const elements = Array.from(
		container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
	)
	
	// Filter out elements that are not visible or are disabled
	return elements.filter((element) => {
		// Check if element is visible
		const style = window.getComputedStyle(element)
		if (style.display === 'none' || style.visibility === 'hidden') {
			return false
		}
		
		// Check if element has tabindex="-1" (should be excluded)
		if (element.getAttribute('tabindex') === '-1') {
			return false
		}
		
		return true
	})
}

/**
 * Gets the first focusable element in a container.
 * 
 * @param container - Container element to search within
 * @returns First focusable element or null
 */
function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
	const focusableElements = getFocusableElements(container)
	return focusableElements[0] || null
}

/**
 * Hook that traps focus within a container element.
 * 
 * **Usage:**
 * ```tsx
 * function MyModal({ isOpen }: { isOpen: boolean }) {
 *   const containerRef = useRef<HTMLDivElement>(null)
 *   const previousFocusRef = useRef<HTMLElement | null>(null)
 *   
 *   useFocusTrap(
 *     containerRef,
 *     isOpen,
 *     previousFocusRef,
 *     {
 *       initialFocus: closeButtonRef,
 *       restoreFocus: true,
 *     }
 *   )
 *   
 *   return (
 *     <div ref={containerRef}>
 *       <button ref={closeButtonRef}>Close</button>
 *       <div>Modal content here</div>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @param containerRef - Ref to the container element
 * @param enabled - Whether focus trap is enabled
 * @param previousFocusRef - Ref to store previous focus (optional)
 * @param options - Additional options
 */
export function useFocusTrap(
	containerRef: RefObject<HTMLElement | null>,
	enabled: boolean = true,
	previousFocusRef?: RefObject<HTMLElement | null>,
	options: FocusTrapOptions = {}
): void {
	const {
		restoreFocus = true,
		initialFocus,
		onEscape,
	} = options

	useEffect(() => {
		if (!enabled || !containerRef.current) {return}

		const container = containerRef.current
		let previousActiveElement: HTMLElement | null = null

		// Store the previously focused element
		if (previousFocusRef) {
			previousFocusRef.current = document.activeElement as HTMLElement
		} else {
			previousActiveElement = document.activeElement as HTMLElement
		}

		// Focus initial element or first focusable element
		const focusInitial = () => {
			if (initialFocus) {
				const element = 'current' in initialFocus ? initialFocus.current : initialFocus
				if (element) {
					element.focus()
					return
				}
			}
			
			const firstFocusable = getFirstFocusableElement(container)
			if (firstFocusable) {
				firstFocusable.focus()
			} else {
				// If no focusable elements, focus the container itself
				container.focus()
			}
		}

		// Small delay to ensure DOM is ready
		const timeoutId = setTimeout(focusInitial, 0)

		// Handle Tab key to trap focus
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') {return}

			const focusableElements = getFocusableElements(container)
			
			if (focusableElements.length === 0) {
				// No focusable elements, prevent default
				e.preventDefault()
				return
			}

			const firstFocusable = focusableElements[0]
			const lastFocusable = focusableElements[focusableElements.length - 1]
			const currentFocus = document.activeElement as HTMLElement

			// Check if focus is within the container
			if (!container.contains(currentFocus)) {
				// Focus escaped, bring it back
				e.preventDefault()
				if (e.shiftKey) {
					lastFocusable.focus()
				} else {
					firstFocusable.focus()
				}
				onEscape?.()
				return
			}

			// Handle Tab (forward)
			if (!e.shiftKey) {
				if (currentFocus === lastFocusable) {
					// Wrap to first element
					e.preventDefault()
					firstFocusable.focus()
				}
			}
			// Handle Shift+Tab (backward)
			else {
				if (currentFocus === firstFocusable) {
					// Wrap to last element
					e.preventDefault()
					lastFocusable.focus()
				}
			}
		}

		// Add event listener
		document.addEventListener('keydown', handleKeyDown)

		// Cleanup
		return () => {
			clearTimeout(timeoutId)
			document.removeEventListener('keydown', handleKeyDown)

			// Restore focus if enabled
			if (restoreFocus) {
				const elementToRestore = previousFocusRef?.current || previousActiveElement
				if (elementToRestore && typeof elementToRestore.focus === 'function') {
					// Small delay to ensure modal is fully closed
					setTimeout(() => {
						elementToRestore.focus()
					}, 0)
				}
			}
		}
	}, [enabled, containerRef, previousFocusRef, restoreFocus, initialFocus, onEscape])
}

