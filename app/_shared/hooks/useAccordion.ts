/**
 * useAccordion Hook
 * 
 * Custom React hook for managing accordion state and behavior.
 * Provides controlled and uncontrolled modes, single/multiple open items,
 * and keyboard navigation support.
 * 
 * **Features:**
 * - Controlled and uncontrolled modes
 * - Single or multiple open items
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Focus management
 * - Callback support for state changes
 * 
 * **WCAG Compliance:**
 * - SC 2.1.1: Keyboard (Level A)
 * - SC 2.4.3: Focus Order (Level A)
 * - SC 2.4.7: Focus Visible (Level AA)
 * - SC 4.1.2: Name, Role, Value (Level A)
 * 
 * **Industry Best Practices:**
 * - Similar to Radix UI Accordion pattern
 * - Follows WAI-ARIA Authoring Practices Guide
 * - Used by Material-UI, Chakra UI, Headless UI
 * 
 * @module useAccordion
 */

'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * Configuration options for useAccordion hook.
 */
export interface UseAccordionOptions {
	/**
	 * Whether multiple items can be open simultaneously.
	 * @default false
	 */
	allowMultiple?: boolean
	
	/**
	 * Whether accordion is controlled (parent manages state).
	 * @default false
	 */
	controlled?: boolean
	
	/**
	 * Controlled value (array of open item IDs).
	 * Required when controlled is true.
	 */
	value?: string[]
	
	/**
	 * Callback when open items change.
	 * Receives array of open item IDs.
	 */
	onValueChange?: (value: string[]) => void
	
	/**
	 * Default open items (uncontrolled mode).
	 * Array of item IDs that should be open initially.
	 */
	defaultValue?: string[]
	
	/**
	 * Whether to enable keyboard navigation.
	 * @default true
	 */
	keyboardNavigation?: boolean
	
	/**
	 * Callback when an item is opened.
	 * Receives the item ID.
	 */
	onItemOpen?: (itemId: string) => void
	
	/**
	 * Callback when an item is closed.
	 * Receives the item ID.
	 */
	onItemClose?: (itemId: string) => void
}

/**
 * Return type for useAccordion hook.
 */
export interface UseAccordionReturn {
	/**
	 * Array of currently open item IDs.
	 */
	openItems: string[]
	
	/**
	 * Toggle an item's open/closed state.
	 * @param itemId - The ID of the item to toggle
	 */
	toggleItem: (itemId: string) => void
	
	/**
	 * Open an item.
	 * @param itemId - The ID of the item to open
	 */
	openItem: (itemId: string) => void
	
	/**
	 * Close an item.
	 * @param itemId - The ID of the item to close
	 */
	closeItem: (itemId: string) => void
	
	/**
	 * Check if an item is open.
	 * @param itemId - The ID of the item to check
	 * @returns True if the item is open
	 */
	isItemOpen: (itemId: string) => boolean
	
	/**
	 * Register an item ID (for keyboard navigation).
	 * @param itemId - The ID of the item to register
	 */
	registerItem: (itemId: string) => void
	
	/**
	 * Unregister an item ID.
	 * @param itemId - The ID of the item to unregister
	 */
	unregisterItem: (itemId: string) => void
	
	/**
	 * Get all registered item IDs in order.
	 * @returns Array of item IDs
	 */
	getItemIds: () => string[]
	
	/**
	 * Focus the next item.
	 * @param currentItemId - The ID of the currently focused item
	 */
	focusNext: (currentItemId: string) => void
	
	/**
	 * Focus the previous item.
	 * @param currentItemId - The ID of the currently focused item
	 */
	focusPrevious: (currentItemId: string) => void
	
	/**
	 * Focus the first item.
	 */
	focusFirst: () => void
	
	/**
	 * Focus the last item.
	 */
	focusLast: () => void
}

/**
 * Hook that manages accordion state and behavior.
 * 
 * **Usage (Uncontrolled):**
 * ```tsx
 * const accordion = useAccordion({
 *   allowMultiple: false,
 *   defaultValue: ['item-1'],
 * })
 * 
 * return (
 *   <Accordion {...accordion}>
 *     <AccordionItem id="item-1">...</AccordionItem>
 *   </Accordion>
 * )
 * ```
 * 
 * **Usage (Controlled):**
 * ```tsx
 * const [openItems, setOpenItems] = useState(['item-1'])
 * 
 * const accordion = useAccordion({
 *   controlled: true,
 *   value: openItems,
 *   onValueChange: setOpenItems,
 * })
 * ```
 * 
 * @param options - Configuration options
 * @returns Accordion state and control functions
 */
export function useAccordion(options: UseAccordionOptions = {}): UseAccordionReturn {
	const {
		allowMultiple = false,
		controlled = false,
		value,
		onValueChange,
		defaultValue = [],
		keyboardNavigation = true,
		onItemOpen,
		onItemClose,
	} = options

	// Uncontrolled state
	const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue)
	
	// Registered item IDs for keyboard navigation
	const itemIdsRef = useRef<string[]>([])
	const itemRefsRef = useRef<Map<string, HTMLElement>>(new Map())

	// Get current open items
	const openItems = controlled ? (value || []) : uncontrolledValue

	// Toggle item open/closed state
	const toggleItem = useCallback((itemId: string) => {
		const isOpen = openItems.includes(itemId)
		
		if (isOpen) {
			// Close item
			const newValue = openItems.filter((id) => id !== itemId)
			
			if (controlled) {
				onValueChange?.(newValue)
			} else {
				setUncontrolledValue(newValue)
				onValueChange?.(newValue)
			}
			
			onItemClose?.(itemId)
		} else {
			// Open item
			const newValue = allowMultiple 
				? [...openItems, itemId]
				: [itemId]
			
			if (controlled) {
				onValueChange?.(newValue)
			} else {
				setUncontrolledValue(newValue)
				onValueChange?.(newValue)
			}
			
			onItemOpen?.(itemId)
		}
	}, [openItems, allowMultiple, controlled, onValueChange, onItemOpen, onItemClose])

	// Open item
	const openItem = useCallback((itemId: string) => {
		if (openItems.includes(itemId)) {return}
		
		const newValue = allowMultiple 
			? [...openItems, itemId]
			: [itemId]
		
		if (controlled) {
			onValueChange?.(newValue)
		} else {
			setUncontrolledValue(newValue)
			onValueChange?.(newValue)
		}
		
		onItemOpen?.(itemId)
	}, [openItems, allowMultiple, controlled, onValueChange, onItemOpen])

	// Close item
	const closeItem = useCallback((itemId: string) => {
		if (!openItems.includes(itemId)) {return}
		
		const newValue = openItems.filter((id) => id !== itemId)
		
		if (controlled) {
			onValueChange?.(newValue)
		} else {
			setUncontrolledValue(newValue)
			onValueChange?.(newValue)
		}
		
		onItemClose?.(itemId)
	}, [openItems, controlled, onValueChange, onItemClose])

	// Check if item is open
	const isItemOpen = useCallback((itemId: string) => {
		return openItems.includes(itemId)
	}, [openItems])

	// Register item for keyboard navigation
	const registerItem = useCallback((itemId: string) => {
		if (!itemIdsRef.current.includes(itemId)) {
			itemIdsRef.current.push(itemId)
		}
	}, [])

	// Unregister item
	const unregisterItem = useCallback((itemId: string) => {
		itemIdsRef.current = itemIdsRef.current.filter((id) => id !== itemId)
		itemRefsRef.current.delete(itemId)
	}, [])

	// Get all registered item IDs
	const getItemIds = useCallback(() => {
		return [...itemIdsRef.current]
	}, [])

	// Focus management functions
	const focusNext = useCallback((currentItemId: string) => {
		if (!keyboardNavigation) {return}
		
		const ids = itemIdsRef.current
		const currentIndex = ids.indexOf(currentItemId)
		if (currentIndex === -1) {return}
		
		const nextIndex = currentIndex + 1
		if (nextIndex >= ids.length) {return}
		
		const nextId = ids[nextIndex]
		const nextElement = itemRefsRef.current.get(nextId)
		nextElement?.focus()
	}, [keyboardNavigation])

	const focusPrevious = useCallback((currentItemId: string) => {
		if (!keyboardNavigation) {return}
		
		const ids = itemIdsRef.current
		const currentIndex = ids.indexOf(currentItemId)
		if (currentIndex === -1) {return}
		
		const prevIndex = currentIndex - 1
		if (prevIndex < 0) {return}
		
		const prevId = ids[prevIndex]
		const prevElement = itemRefsRef.current.get(prevId)
		prevElement?.focus()
	}, [keyboardNavigation])

	const focusFirst = useCallback(() => {
		if (!keyboardNavigation) {return}
		
		const firstId = itemIdsRef.current[0]
		if (!firstId) {return}
		
		const firstElement = itemRefsRef.current.get(firstId)
		firstElement?.focus()
	}, [keyboardNavigation])

	const focusLast = useCallback(() => {
		if (!keyboardNavigation) {return}
		
		const ids = itemIdsRef.current
		const lastId = ids[ids.length - 1]
		if (!lastId) {return}
		
		const lastElement = itemRefsRef.current.get(lastId)
		lastElement?.focus()
	}, [keyboardNavigation])

	// Store item ref for keyboard navigation
	const storeItemRef = useCallback((itemId: string, element: HTMLElement | null) => {
		if (element) {
			itemRefsRef.current.set(itemId, element)
		} else {
			itemRefsRef.current.delete(itemId)
		}
	}, [])

	return {
		openItems,
		toggleItem,
		openItem,
		closeItem,
		isItemOpen,
		registerItem,
		unregisterItem,
		getItemIds,
		focusNext,
		focusPrevious,
		focusFirst,
		focusLast,
		// Internal: store item ref
		_storeItemRef: storeItemRef,
	} as UseAccordionReturn & { _storeItemRef: (itemId: string, element: HTMLElement | null) => void }
}

