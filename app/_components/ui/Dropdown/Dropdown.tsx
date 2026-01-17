/**
 * Dropdown - Accessible Dropdown/Popover Component
 *
 * A composable dropdown component following Radix UI patterns.
 * Uses portal rendering to escape overflow containers (MAANG pattern).
 *
 * Features:
 * - Compound component pattern (Dropdown.Trigger, Dropdown.Content, etc.)
 * - Portal rendering at document.body (never clipped by parent overflow)
 * - Viewport-aware positioning via usePopoverPosition hook
 * - Click outside and escape key handling
 * - ARIA attributes for accessibility
 * - Theme-aware (DaisyUI)
 * - Mobile-first responsive design
 * - Animation support
 *
 * @module Dropdown
 */

'use client'

import {
	createContext,
	useContext,
	useState,
	useRef,
	useCallback,
	useId,
	useEffect,
	type ReactNode,
	type HTMLAttributes,
	type ButtonHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import classNames from 'classnames'
import { usePopoverPosition, useClickOutside, useEscapeKey } from '@_shared'
import Button from '@_components/ui/Button'

// ============================================================================
// CONTEXT
// ============================================================================

interface DropdownContextValue {
	isOpen: boolean
	setIsOpen: (open: boolean) => void
	toggle: () => void
	close: () => void
	triggerId: string
	contentId: string
	triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdownContext() {
	const context = useContext(DropdownContext)
	if (!context) {
		throw new Error('Dropdown compound components must be used within a Dropdown provider')
	}
	return context
}

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export interface DropdownProps {
	/** Controlled open state */
	open?: boolean
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void
	/** Default open state for uncontrolled usage */
	defaultOpen?: boolean
	/** Children (Dropdown.Trigger, Dropdown.Content) */
	children: ReactNode
	/** Additional CSS classes for wrapper */
	className?: string
}

function DropdownRoot({ open: controlledOpen, onOpenChange, defaultOpen = false, children, className }: DropdownProps) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen)
	const isControlled = controlledOpen !== undefined
	const isOpen = isControlled ? controlledOpen : internalOpen
	const id = useId()
	const triggerId = `dropdown-trigger-${id}`
	const contentId = `dropdown-content-${id}`
	const triggerRef = useRef<HTMLButtonElement>(null)

	const setIsOpen = useCallback(
		(open: boolean) => {
			if (!isControlled) {
				setInternalOpen(open)
			}
			onOpenChange?.(open)
		},
		[isControlled, onOpenChange]
	)

	const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen])
	const close = useCallback(() => setIsOpen(false), [setIsOpen])

	return (
		<DropdownContext.Provider value={{ isOpen, setIsOpen, toggle, close, triggerId, contentId, triggerRef }}>
			<div className={classNames('relative inline-block', className)}>{children}</div>
		</DropdownContext.Provider>
	)
}

// ============================================================================
// TRIGGER COMPONENT
// ============================================================================

export interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Show chevron icon */
	showChevron?: boolean
	/** Badge content (e.g., count) */
	badge?: ReactNode
	/** Left icon */
	leftIcon?: ReactNode
	/** Button variant */
	variant?: 'primary' | 'ghost' | 'outline'
	/** Button size */
	size?: 'xs' | 'sm' | 'md'
}

function DropdownTrigger({
	children,
	showChevron = true,
	badge,
	leftIcon,
	variant = 'ghost',
	size = 'sm',
	className,
	...props
}: DropdownTriggerProps) {
	const { isOpen, toggle, triggerId, contentId, triggerRef } = useDropdownContext()

	const variantClasses = {
		primary: 'btn-primary',
		ghost: 'btn-ghost',
		outline: 'btn-outline',
	}

	const sizeClasses = {
		xs: 'btn-xs',
		sm: 'btn-sm',
		md: 'btn-md',
	}

	return (
		<Button
			ref={triggerRef}
			type='button'
			id={triggerId}
			onClick={toggle}
			variant={variant}
			size={size}
			aria-expanded={isOpen}
			aria-haspopup='menu'
			aria-controls={isOpen ? contentId : undefined}
			className={classNames(
				'gap-2 min-h-[44px] sm:min-h-[36px] touch-manipulation',
				'transition-all duration-200',
				className
			)}
			leftIcon={leftIcon}
			rightIcon={
				showChevron ? (
					<ChevronDown
						className={classNames(
							'h-4 w-4 flex-shrink-0 transition-transform duration-200',
							isOpen && 'rotate-180'
						)}
					/>
				) : undefined
			}
			{...props}>
			<span className='font-medium'>{children}</span>
			{badge && (
				<span
					className={classNames(
						'badge badge-sm font-semibold tabular-nums',
						variant === 'primary' ? 'badge-primary-content bg-white/20' : 'badge-primary'
					)}>
					{badge}
				</span>
			)}
		</Button>
	)
}

// ============================================================================
// CONTENT COMPONENT
// ============================================================================

export interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
	/** Alignment relative to trigger */
	align?: 'start' | 'end'
	/** Width of the dropdown (used for viewport boundary detection) */
	width?: number
	/** Max height before scroll */
	maxHeight?: string | number
}

function DropdownContent({
	children,
	align = 'end',
	width = 280,
	maxHeight = '60vh',
	className,
	...props
}: DropdownContentProps) {
	const { isOpen, close, contentId, triggerId, triggerRef } = useDropdownContext()
	const contentRef = useRef<HTMLDivElement>(null)
	const [isMounted, setIsMounted] = useState(false)

	// SSR-safe: only render portal after hydration
	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Calculate position using the shared hook (handles viewport boundaries)
	const position = usePopoverPosition(triggerRef, isOpen, {
		width,
		alignment: align,
	})

	// Close handlers
	useClickOutside(contentRef, close, isOpen)
	useEscapeKey(close, isOpen)

	// Don't render until mounted (SSR) and position calculated
	if (!isOpen || !isMounted || !position.isPositioned) return null

	const content = (
		<div
			ref={contentRef}
			id={contentId}
			role='menu'
			aria-labelledby={triggerId}
			aria-orientation='vertical'
			className={classNames(
				// Fixed positioning for portal rendering
				'fixed z-[9999]',
				// Sizing
				'min-w-[200px] max-w-[calc(100vw-2rem)] sm:max-w-[320px]',
				// Visual styling
				'bg-base-100 dark:bg-base-200',
				'border border-base-300/50 dark:border-base-content/10',
				'rounded-xl shadow-xl dark:shadow-2xl',
				// Animation - using project's existing animation classes
				'animate-scale-in',
				// Overflow
				'overflow-hidden',
				className
			)}
			style={{
				top: position.top,
				left: position.left,
				width: `${width}px`,
				maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
			}}
			{...props}>
			{children}
		</div>
	)

	// Render via portal to escape overflow containers
	return createPortal(content, document.body)
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

export interface DropdownSectionProps extends HTMLAttributes<HTMLDivElement> {
	/** Section title */
	title?: string
}

function DropdownSection({ children, title, className, ...props }: DropdownSectionProps) {
	return (
		<div
			className={classNames('py-1', className)}
			role='group'
			{...props}>
			{title && (
				<div className='px-3 py-2 text-xs font-semibold uppercase tracking-wider text-base-content/50'>
					{title}
				</div>
			)}
			{children}
		</div>
	)
}

// ============================================================================
// ITEM COMPONENT
// ============================================================================

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Left icon */
	icon?: ReactNode
	/** Visual variant */
	variant?: 'default' | 'danger' | 'warning' | 'primary' | 'success'
	/** Show as selected/checked */
	selected?: boolean
	/** Description text */
	description?: string
}

function DropdownItem({
	children,
	icon,
	variant = 'default',
	selected,
	description,
	disabled,
	className,
	onClick,
	...props
}: DropdownItemProps) {
	const variantClasses = {
		default: 'text-base-content hover:bg-base-200 dark:hover:bg-base-content/10',
		danger: 'text-error hover:bg-error/10 dark:hover:bg-error/15',
		warning: 'text-warning hover:bg-warning/10 dark:hover:bg-warning/15',
		primary: 'text-primary hover:bg-primary/10 dark:hover:bg-primary/15',
		success: 'text-success hover:bg-success/10 dark:hover:bg-success/15',
	}

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (!disabled) {
			onClick?.(e)
		}
	}

	return (
		<Button
			type='button'
			role='menuitem'
			disabled={disabled}
			onClick={handleClick}
			variant='ghost'
			size='sm'
			className={classNames(
				// Layout
				'w-full flex items-center gap-3 px-3 py-2.5 sm:py-2',
				'text-left text-sm',
				'justify-start',
				'h-auto',
				// Transitions
				'transition-colors duration-150',
				// Touch friendly
				'touch-manipulation',
				// Active state
				'active:bg-base-300 dark:active:bg-base-content/15',
				// Variant
				variantClasses[variant],
				// Disabled state
				disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
				className
			)}
			leftIcon={icon}
			contentDrivenHeight
			{...props}>
			<span className='flex-1 truncate'>{children}</span>
			{description && <span className='text-xs text-base-content/50 truncate'>{description}</span>}
		</Button>
	)
}

// ============================================================================
// CHECKBOX ITEM COMPONENT
// ============================================================================

export interface DropdownCheckboxItemProps extends Omit<DropdownItemProps, 'selected'> {
	/** Checked state */
	checked?: boolean
	/** Callback when checked changes */
	onCheckedChange?: (checked: boolean) => void
}

function DropdownCheckboxItem({
	children,
	checked = false,
	onCheckedChange,
	className,
	// Exclude variant from props - DropdownItem variant doesn't match Button variant
	variant: _variant,
	...props
}: DropdownCheckboxItemProps) {
	const handleClick = () => {
		onCheckedChange?.(!checked)
	}

	return (
		<Button
			type='button'
			role='menuitemcheckbox'
			aria-checked={checked}
			onClick={handleClick}
			variant='ghost'
			size='sm'
			className={classNames(
				// Layout
				'w-full flex items-center gap-3 px-3 py-2.5 sm:py-2',
				'text-left text-sm',
				'justify-start',
				'h-auto',
				// Hover/Active states
				'hover:bg-base-200 dark:hover:bg-base-content/10',
				'active:bg-base-300 dark:active:bg-base-content/15',
				// Transitions
				'transition-colors duration-150',
				// Touch friendly
				'touch-manipulation',
				className
			)}
			leftIcon={
				<span
					className={classNames(
						// Size
						'w-5 h-5 flex-shrink-0',
						// Shape
						'rounded-md',
						// Border
						'border-2',
						// Flexbox for centering
						'flex items-center justify-center',
						// Transition
						'transition-all duration-200',
						// Checked/Unchecked states
						checked
							? 'bg-primary border-primary text-primary-content'
							: 'border-base-300 dark:border-base-content/30 bg-transparent'
					)}>
					{checked && (
						<Check
							className='h-3.5 w-3.5'
							strokeWidth={3}
						/>
					)}
				</span>
			}
			contentDrivenHeight
			{...props}>
			<span className='flex-1 truncate text-base-content'>{children}</span>
		</Button>
	)
}

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

function DropdownDivider({ className }: { className?: string }) {
	return (
		<div
			className={classNames('my-1 border-t border-base-300/50 dark:border-base-content/10', className)}
			role='separator'
		/>
	)
}

// ============================================================================
// HEADER/FOOTER COMPONENTS
// ============================================================================

export interface DropdownHeaderFooterProps extends HTMLAttributes<HTMLDivElement> {}

function DropdownHeader({ children, className, ...props }: DropdownHeaderFooterProps) {
	return (
		<div
			className={classNames(
				'px-3 py-2 flex items-center gap-2',
				'border-b border-base-300/50 dark:border-base-content/10',
				'bg-base-200/50 dark:bg-base-content/5',
				className
			)}
			{...props}>
			{children}
		</div>
	)
}

function DropdownFooter({ children, className, ...props }: DropdownHeaderFooterProps) {
	return (
		<div
			className={classNames(
				'px-3 py-2',
				'border-t border-base-300/50 dark:border-base-content/10',
				'bg-base-200/30 dark:bg-base-content/5',
				className
			)}
			{...props}>
			{children}
		</div>
	)
}

// ============================================================================
// LABEL COMPONENT (for footer text like "6 of 5 columns visible")
// ============================================================================

function DropdownLabel({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<span
			className={classNames(
				'text-xs text-base-content/60 dark:text-base-content/50',
				'text-center block',
				className
			)}>
			{children}
		</span>
	)
}

// ============================================================================
// COMPOUND EXPORT
// ============================================================================

export const Dropdown = Object.assign(DropdownRoot, {
	Trigger: DropdownTrigger,
	Content: DropdownContent,
	Section: DropdownSection,
	Item: DropdownItem,
	CheckboxItem: DropdownCheckboxItem,
	Divider: DropdownDivider,
	Header: DropdownHeader,
	Footer: DropdownFooter,
	Label: DropdownLabel,
})

export default Dropdown
