/**
 * Accordion UI Component
 *
 * Accessible, flexible accordion component following WAI-ARIA best practices.
 * Supports both compound component pattern and simple items array API.
 * Built with mobile-first responsive design following industry standards.
 *
 * **Features:**
 * - Single or multiple open items
 * - Controlled and uncontrolled modes
 * - Full keyboard navigation (Arrow keys, Home, End, Enter, Space)
 * - Smooth animations with CSS transitions
 * - Customizable styling
 * - ARIA attributes for accessibility
 * - Mobile-first responsive design
 *
 * **Mobile-First Design:**
 * - Touch-friendly tap targets (min 44px height)
 * - Responsive typography (text-base md:text-lg)
 * - Responsive spacing (p-4 md:p-6, gap-3 md:gap-4)
 * - Responsive border radius (rounded-xl md:rounded-2xl)
 * - Responsive icon sizes (h-4 w-4 md:h-5 md:w-5)
 * - Optimized for mobile interactions
 *
 * **Accessibility:**
 * - Proper ARIA roles and attributes
 * - Keyboard navigation support
 * - Focus management with visible focus rings
 * - Screen reader announcements
 * - WCAG 2.1 AA compliant
 *
 * **Usage (Compound Pattern):**
 * ```tsx
 * <Accordion allowMultiple>
 *   <AccordionItem id="item-1">
 *     <AccordionTrigger>Question 1</AccordionTrigger>
 *     <AccordionContent>Answer 1</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem id="item-2">
 *     <AccordionTrigger>Question 2</AccordionTrigger>
 *     <AccordionContent>Answer 2</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * **Usage (Simple API):**
 * ```tsx
 * const items = [
 *   { id: '1', question: 'Q1', answer: 'A1' },
 *   { id: '2', question: 'Q2', answer: 'A2' },
 * ]
 *
 * <Accordion items={items} />
 * ```
 *
 * **Usage (Complex Content):**
 * ```tsx
 * // Using compound pattern with complex content
 * <Accordion>
 *   <AccordionItem id="item-1">
 *     <AccordionTrigger>Product Details</AccordionTrigger>
 *     <AccordionContent noDefaultStyling>
 *       <div className="space-y-4">
 *         <img src="/product.jpg" alt="Product" />
 *         <form>
 *           <input type="text" />
 *           <button>Submit</button>
 *         </form>
 *       </div>
 *     </AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 *
 * // Using simple API with complex content
 * const items = [
 *   {
 *     id: '1',
 *     question: 'Product Details',
 *     answer: (
 *       <div>
 *         <img src="/product.jpg" />
 *         <form>...</form>
 *       </div>
 *     ),
 *     noDefaultContentStyling: true
 *   }
 * ]
 * ```
 *
 * @module Accordion
 */

'use client'

import type { ReactNode, HTMLAttributes } from 'react'
import { createContext, useContext, useRef, useEffect } from 'react'

import classNames from 'classnames'
import { ChevronDown } from 'lucide-react'

import { useAccordion } from '@_shared'
import Button from '@_components/ui/Button'

/**
 * Accordion context type.
 * Extends the return type from useAccordion hook.
 */
interface AccordionContextValue {
	/**
	 * Array of currently open item IDs.
	 */
	openItems: string[]

	/**
	 * Toggle an item's open/closed state.
	 */
	toggleItem: (itemId: string) => void

	/**
	 * Open an item.
	 */
	openItem: (itemId: string) => void

	/**
	 * Close an item.
	 */
	closeItem: (itemId: string) => void

	/**
	 * Check if an item is open.
	 */
	isItemOpen: (itemId: string) => boolean

	/**
	 * Register an item ID (for keyboard navigation).
	 */
	registerItem: (itemId: string) => void

	/**
	 * Unregister an item ID.
	 */
	unregisterItem: (itemId: string) => void

	/**
	 * Get all registered item IDs in order.
	 */
	getItemIds: () => string[]

	/**
	 * Focus the next item.
	 */
	focusNext: (currentItemId: string) => void

	/**
	 * Focus the previous item.
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

	/**
	 * Store item ref for keyboard navigation.
	 * @internal
	 */
	_storeItemRef: (itemId: string, element: HTMLElement | null) => void
}

/**
 * Accordion context.
 */
const AccordionContext = createContext<AccordionContextValue | null>(null)

/**
 * Hook to access accordion context.
 * @throws Error if used outside Accordion component
 */
export function useAccordionContext(): AccordionContextValue {
	const context = useContext(AccordionContext)
	if (!context) {
		throw new Error('Accordion components must be used within an Accordion')
	}
	return context
}

/**
 * Item context for passing item ID to child components.
 */
const AccordionItemContext = createContext<{ itemId: string } | null>(null)

/**
 * Simple accordion item data structure.
 */
export interface AccordionItemData {
	/** Unique identifier for the item */
	id: string
	/** Question/header text - supports ReactNode (text, icons, etc.) */
	question: ReactNode
	/**
	 * Answer/content - supports any ReactNode (text, divs, forms, images, etc.)
	 * For complex content, use `noDefaultContentStyling` to remove text-specific styles.
	 */
	answer: ReactNode
	/** Optional custom className for the item */
	itemClassName?: string
	/** Optional custom className for the trigger */
	triggerClassName?: string
	/** Optional custom className for the content */
	contentClassName?: string
	/**
	 * Remove default text styling from content wrapper.
	 * Set to true when using complex content (divs, forms, images, etc.)
	 * @default false
	 */
	noDefaultContentStyling?: boolean
}

/**
 * Accordion component props.
 */
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
	 * Simple items array (alternative to compound pattern).
	 * When provided, renders items automatically.
	 */
	items?: AccordionItemData[]

	/**
	 * Custom className for accordion container.
	 */
	className?: string

	/**
	 * Children (for compound pattern).
	 */
	children?: ReactNode

	/**
	 * Whether to enable keyboard navigation.
	 * @default true
	 */
	keyboardNavigation?: boolean

	/**
	 * Callback when an item is opened.
	 */
	onItemOpen?: (itemId: string) => void

	/**
	 * Callback when an item is closed.
	 */
	onItemClose?: (itemId: string) => void
}

/**
 * Accordion Component
 *
 * Main accordion container that provides context to child components.
 * Supports both compound component pattern and simple items array.
 *
 * @param props - Accordion configuration props
 * @returns Accordion component
 */
export default function Accordion({
	allowMultiple = false,
	controlled = false,
	value,
	onValueChange,
	defaultValue,
	items,
	className,
	children,
	keyboardNavigation = true,
	onItemOpen,
	onItemClose,
	...props
}: AccordionProps) {
	const accordion = useAccordion({
		allowMultiple,
		controlled,
		value,
		onValueChange,
		defaultValue,
		keyboardNavigation,
		onItemOpen,
		onItemClose,
	})

	const contextValue: AccordionContextValue = {
		...accordion,
		_storeItemRef: (accordion as any)._storeItemRef,
	}

	// Register items for keyboard navigation when using simple API
	useEffect(() => {
		if (items) {
			items.forEach((item) => {
				accordion.registerItem(item.id)
			})
		}
	}, [items, accordion])

	return (
		<AccordionContext.Provider value={contextValue}>
			<div
				className={classNames('space-y-3 md:space-y-4', className)}
				role='region'
				aria-label='Accordion'
				{...props}>
				{items
					? // Simple API: render items automatically
					  items.map((item) => (
							<AccordionItem
								key={item.id}
								id={item.id}
								className={item.itemClassName}>
								<AccordionTrigger className={item.triggerClassName}>{item.question}</AccordionTrigger>
								<AccordionContent
									className={item.contentClassName}
									noDefaultStyling={item.noDefaultContentStyling}>
									{item.answer}
								</AccordionContent>
							</AccordionItem>
					  ))
					: // Compound pattern: render children
					  children}
			</div>
		</AccordionContext.Provider>
	)
}

/**
 * AccordionItem component props.
 */
export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
	/** Unique identifier for this item */
	id: string
	/** Child components (AccordionTrigger and AccordionContent) */
	children: ReactNode
	/** Custom className */
	className?: string
}

/**
 * AccordionItem Component
 *
 * Individual accordion item container.
 * Must contain AccordionTrigger and AccordionContent as children.
 *
 * @param props - AccordionItem props
 * @returns AccordionItem component
 */
export function AccordionItem({ id, children, className, ...props }: AccordionItemProps) {
	const accordion = useAccordionContext()
	const itemRef = useRef<HTMLDivElement>(null)
	const isOpen = accordion.isItemOpen(id)

	// Register item on mount
	useEffect(() => {
		accordion.registerItem(id)
		return () => {
			accordion.unregisterItem(id)
		}
	}, [id, accordion])

	// Store trigger ref for keyboard navigation
	useEffect(() => {
		const trigger = itemRef.current?.querySelector<HTMLElement>('[data-accordion-trigger]')
		if (trigger) {
			accordion._storeItemRef(id, trigger)
		}
	}, [id, accordion])

	return (
		<AccordionItemContext.Provider value={{ itemId: id }}>
			<div
				ref={itemRef}
				className={classNames(
					'rounded-xl md:rounded-2xl border border-base-300 bg-base-100 shadow-sm',
					'transition-shadow duration-300',
					'hover:shadow-md',
					{
						'shadow-md': isOpen,
					},
					className
				)}
				data-state={isOpen ? 'open' : 'closed'}
				{...props}>
				{children}
			</div>
		</AccordionItemContext.Provider>
	)
}

/**
 * AccordionTrigger component props.
 */
export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
	/** Child content (typically the question/header text) */
	children: ReactNode
	/** Custom className */
	className?: string
	/** Optional icon to display (replaces default chevron) */
	icon?: ReactNode
}

/**
 * AccordionTrigger Component
 *
 * Clickable header that toggles the accordion item.
 * Handles keyboard events and ARIA attributes.
 *
 * @param props - AccordionTrigger props
 * @returns AccordionTrigger component
 */
export function AccordionTrigger({ children, className, icon, onClick, ...props }: AccordionTriggerProps) {
	const accordion = useAccordionContext()
	const itemContext = useContext(AccordionItemContext)

	if (!itemContext) {
		throw new Error('AccordionTrigger must be used within an AccordionItem')
	}

	const { itemId } = itemContext
	const isOpen = accordion.isItemOpen(itemId)
	const triggerRef = useRef<HTMLButtonElement>(null)

	// Store trigger ref for keyboard navigation
	useEffect(() => {
		if (triggerRef.current) {
			accordion._storeItemRef(itemId, triggerRef.current)
		}
	}, [itemId, accordion])

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		accordion.toggleItem(itemId)
		onClick?.(e)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				accordion.focusNext(itemId)
				break
			case 'ArrowUp':
				e.preventDefault()
				accordion.focusPrevious(itemId)
				break
			case 'Home':
				e.preventDefault()
				accordion.focusFirst()
				break
			case 'End':
				e.preventDefault()
				accordion.focusLast()
				break
		}
	}

	return (
		<Button
			ref={triggerRef}
			type='button'
			data-accordion-trigger
			variant='ghost'
			aria-expanded={isOpen}
			aria-controls={`accordion-content-${itemId}`}
			id={`accordion-trigger-${itemId}`}
			style={{ WebkitTapHighlightColor: 'transparent' }}
			className={classNames(
				'w-full flex items-center justify-between',
				'gap-3 md:gap-4',
				'min-h-[44px] p-4 md:p-6',
				'text-left font-semibold',
				'text-base md:text-lg text-base-content',
				'transition-all duration-300 ease-out',
				'hover:bg-base-200',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
				'rounded-t-xl md:rounded-t-2xl',
				'h-auto',
				className
			)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			rightIcon={
				icon || (
					<ChevronDown
						className={classNames(
							'h-4 w-4 md:h-5 md:w-5 shrink-0',
							'transition-transform duration-300 ease-out',
							'text-base-content/70',
							{
								'transform rotate-180': isOpen,
							}
						)}
						aria-hidden='true'
					/>
				)
			}
			contentDrivenHeight
			{...props}>
			<span className='flex-1 leading-relaxed'>{children}</span>
		</Button>
	)
}

/**
 * AccordionContent component props.
 */
export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Child content - supports any ReactNode (text, divs, forms, images, etc.)
	 * For simple text, default styling is applied.
	 * For complex content, use `noDefaultStyling` prop to remove text-specific styles.
	 */
	children: ReactNode
	/** Custom className */
	className?: string
	/**
	 * Remove default text styling wrapper.
	 * Set to true when using complex content (divs, forms, images, etc.)
	 * @default false
	 */
	noDefaultStyling?: boolean
}

/**
 * AccordionContent Component
 *
 * Collapsible content area that shows/hides based on item state.
 * Uses CSS transitions for smooth animations.
 *
 * **Content Support:**
 * - Simple text: Default styling applied automatically
 * - Complex content (divs, forms, images): Use `noDefaultStyling={true}`
 *
 * **Industry Best Practice:**
 * - Supports any ReactNode (React's equivalent of "slots")
 * - Flexible styling via `noDefaultStyling` prop
 * - Maintains padding for consistent spacing
 * - Full control over content structure
 *
 * @param props - AccordionContent props
 * @returns AccordionContent component
 */
export function AccordionContent({ children, className, noDefaultStyling = false, ...props }: AccordionContentProps) {
	const accordion = useAccordionContext()
	const itemContext = useContext(AccordionItemContext)

	if (!itemContext) {
		throw new Error('AccordionContent must be used within an AccordionItem')
	}

	const { itemId } = itemContext
	const isOpen = accordion.isItemOpen(itemId)
	const contentRef = useRef<HTMLDivElement>(null)

	// Handle height animation
	useEffect(() => {
		const content = contentRef.current
		if (!content) {
			return
		}

		if (isOpen) {
			// Measure natural height and set it
			const height = content.scrollHeight
			content.style.maxHeight = `${height}px`
		} else {
			content.style.maxHeight = '0px'
		}
	}, [isOpen])

	return (
		<div
			ref={contentRef}
			id={`accordion-content-${itemId}`}
			role='region'
			aria-labelledby={`accordion-trigger-${itemId}`}
			className={classNames(
				'overflow-hidden',
				'transition-all duration-300 ease-in-out',
				{
					'opacity-0': !isOpen,
					'opacity-100': isOpen,
				},
				className
			)}
			{...props}>
			{noDefaultStyling ? (
				// No wrapper - full control for complex content
				<div className='px-4 md:px-6 pb-4 md:pb-6 pt-0'>{children}</div>
			) : (
				// Default wrapper with text styling for simple content
				<div className='px-4 md:px-6 pb-4 md:pb-6 pt-0 text-sm md:text-base leading-relaxed text-base-content/70'>
					{children}
				</div>
			)}
		</div>
	)
}
