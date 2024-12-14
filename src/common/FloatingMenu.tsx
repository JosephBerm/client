import React, { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'

export type FloatingMenuProps = {
	children: {
		buttonSlot?: React.ReactNode
		bodySlot: React.ReactNode
	}
	iconClass?: string
	isOpen?: boolean
	onClose?: () => void
	onToggle?: (isOpen: boolean) => void
}

function FloatingMenu({ children, iconClass, isOpen, onClose, onToggle }: FloatingMenuProps) {
	const [isInternalMenuOpen, setIsInternalMenuOpen] = useState(false)
	const componentRef = useRef<HTMLDivElement>(null)
	const optionsContainerRef = useRef<HTMLDivElement>(null)

	// Determine if the component should behave as controlled or uncontrolled
	const isControlled = isOpen !== undefined
	const isMenuOpen = isControlled ? isOpen : isInternalMenuOpen

	const toggleMenu = () => {
		if (isControlled) {
			// Notify parent to toggle controlled state
			onToggle?.(!isOpen)
		} else {
			// Update internal state for uncontrolled usage
			setIsInternalMenuOpen((prev) => !prev)
		}
	}

	const closeMenu = () => {
		if (isControlled) {
			// Notify parent to close the menu
			onClose?.()
		} else {
			// Close the menu internally
			setIsInternalMenuOpen(false)
		}
	}

	const getIcon = () => {
		if (iconClass) {
			return <i className={iconClass}></i>
		} else if (children.buttonSlot) {
			return children.buttonSlot // Assuming the first child is the icon
		}

		// Slot for custom icon
		return 'fa-solid fa-bars'
	}

	useEffect(() => {
		if (!isMenuOpen) return

		const handleClickOutside = (event: MouseEvent) => {
			if (
				optionsContainerRef.current &&
				!optionsContainerRef.current.contains(event.target as Node) &&
				!componentRef.current?.contains(event.target as HTMLElement)
			) {
				closeMenu()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isMenuOpen])

	return (
		<div className={classNames({ FloatingMenu: true, isOpen: isMenuOpen })} ref={componentRef}>
			<div className='icon-container clickable' onClick={() => toggleMenu()}>
				{getIcon()}
			</div>
			{isMenuOpen ? (
				<div className='childrens-container' ref={optionsContainerRef}>
					{children.bodySlot}
				</div>
			) : (
				<></>
			)}
		</div>
	)
}

export default FloatingMenu
