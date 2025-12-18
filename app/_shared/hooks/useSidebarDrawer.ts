/**
 * useSidebarDrawer Hook
 * 
 * MAANG-level custom hook for mobile sidebar drawer behavior.
 * Extracts common sidebar logic to ensure DRY principle and separation of concerns.
 * 
 * **Features:**
 * - Outside click detection (modal-aware)
 * - Escape key handling (modal-aware)
 * - Body scroll lock
 * - Child state reset on close
 * - Portal-aware click detection
 * 
 * **Modal Stacking Support:**
 * When a modal is open (e.g., Settings modal), the sidebar should NOT close on:
 * - Clicks inside the modal (even though it's portaled outside sidebar DOM)
 * - Escape key presses (modal handles its own Escape)
 * 
 * **Industry Best Practices:**
 * - Single source of truth for drawer behavior
 * - Consistent behavior across all sidebars
 * - Proper modal stacking (used by Stripe, Linear, Notion)
 * - WCAG compliant keyboard handling
 * 
 * @module useSidebarDrawer
 */

'use client'

import type { RefObject } from 'react'
import { useEffect } from 'react'

/**
 * Configuration options for the sidebar drawer hook.
 */
export interface UseSidebarDrawerOptions {
	/**
	 * Whether the sidebar is currently open.
	 */
	isOpen: boolean

	/**
	 * Whether we're on mobile (drawer mode) vs desktop (permanent mode).
	 */
	isMobile: boolean

	/**
	 * Callback to close the sidebar.
	 */
	onClose: () => void

	/**
	 * Ref to the sidebar container element.
	 */
	sidebarRef: RefObject<HTMLElement | null>

	/**
	 * Whether a child modal is currently open.
	 * When true, outside clicks and Escape key are delegated to the modal.
	 */
	hasOpenModal?: boolean

	/**
	 * Callback to reset child state when sidebar closes.
	 * Use this to reset modal states, form states, etc.
	 */
	onSidebarClose?: () => void

	/**
	 * Delay before attaching outside click listener (ms).
	 * Prevents immediate close when opening sidebar via button click.
	 * @default 100
	 */
	outsideClickDelay?: number

	/**
	 * Whether to lock body scroll when sidebar is open.
	 * @default true
	 */
	lockBodyScroll?: boolean

	/**
	 * Whether to handle Escape key to close.
	 * @default true
	 */
	handleEscapeKey?: boolean
}

/**
 * Hook that provides common mobile sidebar drawer behaviors.
 * 
 * **Usage:**
 * ```tsx
 * function MySidebar({ isOpen, onClose }: SidebarProps) {
 *   const sidebarRef = useRef<HTMLElement>(null)
 *   const [modalOpen, setModalOpen] = useState(false)
 *   const isMobile = useMediaQuery('(max-width: 1023px)')
 * 
 *   useSidebarDrawer({
 *     isOpen,
 *     isMobile,
 *     onClose,
 *     sidebarRef,
 *     hasOpenModal: modalOpen,
 *     onSidebarClose: () => setModalOpen(false), // Reset child state
 *   })
 * 
 *   return (
 *     <aside ref={sidebarRef}>
 *       ...
 *       <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
 *     </aside>
 *   )
 * }
 * ```
 * 
 * @param options - Configuration options
 */
export function useSidebarDrawer(options: UseSidebarDrawerOptions): void {
	const {
		isOpen,
		isMobile,
		onClose,
		sidebarRef,
		hasOpenModal = false,
		onSidebarClose,
		outsideClickDelay = 100,
		lockBodyScroll = true,
		handleEscapeKey = true,
	} = options

	/**
	 * Reset child state when sidebar closes on mobile.
	 * 
	 * This prevents stale state (e.g., modal still open) when sidebar reopens.
	 * MAANG pattern: Reset derived/child state when parent state changes.
	 */
	useEffect(() => {
		if (!isOpen && isMobile && onSidebarClose) {
			onSidebarClose()
		}
	}, [isOpen, isMobile, onSidebarClose])

	/**
	 * Handle Escape key to close sidebar on mobile.
	 * 
	 * Modal-aware: Skips if a child modal is open (modal handles its own Escape).
	 * Industry standard: Escape key priority - innermost layer wins.
	 */
	useEffect(() => {
		if (!handleEscapeKey) {
			return
		}

		const handleEscape = (e: KeyboardEvent) => {
			// Skip if modal is open (modal handles its own Escape)
			if (hasOpenModal) {
				return
			}

			if (e.key === 'Escape' && isOpen && isMobile) {
				onClose()
			}
		}

		window.addEventListener('keydown', handleEscape)
		return () => window.removeEventListener('keydown', handleEscape)
	}, [isOpen, isMobile, onClose, hasOpenModal, handleEscapeKey])

	/**
	 * Handle outside click on mobile.
	 * 
	 * Modal-aware: Accounts for portaled modals at document.body.
	 * Industry pattern: Click inside any modal (role="dialog") is not "outside".
	 */
	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			// Skip if modal is open (modal handles its own click-outside)
			if (hasOpenModal) {
				return
			}

			const target = e.target as Node

			// Skip if click is inside the sidebar
			if (sidebarRef.current?.contains(target)) {
				return
			}

			// Skip if click is inside any modal (portaled modals at document.body)
			// Check for common modal patterns: role="dialog", data-modal, .modal class
			const clickedElement = e.target as HTMLElement
			const isInsideModal = clickedElement.closest('[role="dialog"], [data-modal], .modal')
			if (isInsideModal) {
				return
			}

			// All checks passed - this is a genuine outside click
			if (isMobile && isOpen) {
				onClose()
			}
		}

		if (isOpen && isMobile) {
			// Delay to prevent immediate closing (e.g., from the hamburger button click)
			const timeoutId = setTimeout(() => {
				document.addEventListener('mousedown', handleOutsideClick)
			}, outsideClickDelay)

			return () => {
				clearTimeout(timeoutId)
				document.removeEventListener('mousedown', handleOutsideClick)
			}
		}
	}, [isOpen, isMobile, onClose, hasOpenModal, sidebarRef, outsideClickDelay])

	/**
	 * Lock body scroll when sidebar is open on mobile.
	 * 
	 * Prevents background content from scrolling while drawer is open.
	 * Industry standard: All modal/drawer overlays lock body scroll.
	 */
	useEffect(() => {
		if (!lockBodyScroll) {
			return
		}

		if (isOpen && isMobile) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen, isMobile, lockBodyScroll])
}

export default useSidebarDrawer

