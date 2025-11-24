/**
 * useModal Hook
 * 
 * Shared hook for common modal behaviors (focus trap, escape key, body scroll lock).
 * Extracted from Modal.tsx and SettingsModal.tsx to follow DRY principle.
 * 
 * **Features:**
 * - Focus trap within modal container
 * - Escape key handling
 * - Body scroll lock
 * - Focus restoration on close
 * - Configurable options
 * 
 * **WCAG Compliance:**
 * - SC 2.1.2: No Keyboard Trap (Level A)
 * - SC 2.4.3: Focus Order (Level A)
 * - SC 2.4.7: Focus Visible (Level AA)
 * 
 * **Industry Best Practices:**
 * - Single source of truth for modal behaviors
 * - Consistent behavior across all modals
 * - Easy to maintain and update
 * 
 * @module useModal
 */

'use client'

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react'

import { useFocusTrap } from './useFocusTrap'

/**
 * Configuration options for useModal hook.
 */
export interface UseModalOptions {
	/**
	 * Whether escape key should close the modal.
	 * @default true
	 */
	closeOnEscape?: boolean
	/**
	 * Whether to lock body scroll when modal is open.
	 * @default true
	 */
	lockBodyScroll?: boolean
	/**
	 * Ref to element to focus initially when modal opens.
	 * If not provided, focuses first focusable element.
	 */
	initialFocus?: RefObject<HTMLElement | null>
	/**
	 * Whether to restore focus to previous element on close.
	 * @default true
	 */
	restoreFocus?: boolean
}

/**
 * Hook that provides common modal behaviors.
 * 
 * **Usage:**
 * ```tsx
 * function MyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
 *   const modalRef = useRef<HTMLDivElement>(null)
 *   const closeButtonRef = useRef<HTMLButtonElement>(null)
 *   
 *   useModal({
 *     containerRef: modalRef,
 *     isOpen,
 *     onClose,
 *     initialFocus: closeButtonRef,
 *   })
 *   
 *   return (
 *     <div ref={modalRef}>
 *       <button ref={closeButtonRef}>Close</button>
 *       <div>Modal content here</div>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @param containerRef - Ref to the modal container element
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback when modal should close
 * @param options - Configuration options
 */
export function useModal(
	containerRef: RefObject<HTMLElement | null>,
	isOpen: boolean,
	onClose: () => void,
	options: UseModalOptions = {}
): void {
	const {
		closeOnEscape = true,
		lockBodyScroll = true,
		initialFocus,
		restoreFocus = true,
	} = options

	const previousFocusRef = useRef<HTMLElement | null>(null)

	// Store previous focus when modal opens
	useEffect(() => {
		if (isOpen) {
			previousFocusRef.current = document.activeElement as HTMLElement
		}
	}, [isOpen])

	// Focus trap - traps focus within modal and restores on close
	useFocusTrap(
		containerRef,
		isOpen,
		previousFocusRef,
		{
			initialFocus,
			restoreFocus,
		}
	)

	// Handle escape key
	useEffect(() => {
		if (!isOpen || !closeOnEscape) {return}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		window.addEventListener('keydown', handleEscape)
		return () => window.removeEventListener('keydown', handleEscape)
	}, [isOpen, onClose, closeOnEscape])

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (!lockBodyScroll) {return}

		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen, lockBodyScroll])
}

