import React, { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'

export type FloatingMenuProps = {
	children: {
		buttonSlot?: React.ReactNode
		bodySlot: React.ReactNode
	}
	iconClass?: string
}

function FloatingMenu({ children, iconClass }: FloatingMenuProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const optionsContainerRef = useRef<HTMLDivElement>(null)

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
		if (isMenuOpen && optionsContainerRef.current) {
			optionsContainerRef.current.focus()
		}
	}, [isMenuOpen])

	return (
		<div className={classNames({ FloatingMenu: true, isOpen: isMenuOpen })}>
			<div className='icon-container clickable' onClick={() => setIsMenuOpen(!isMenuOpen)}>
				{getIcon()}
			</div>
			{isMenuOpen ? <div className='childrens-container'>{children.bodySlot}</div> : <></>}
		</div>
	)
}

export default FloatingMenu
