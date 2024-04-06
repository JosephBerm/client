import React, { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'

type FloatingMenuProps = {
	options: string[]
	onChange: Function
}

function FloatingMenu({ options, onChange: emitChange }: FloatingMenuProps) {
	const [selected, setSelected] = useState(options[0])
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const optionsContainerRef = useRef<HTMLDivElement>(null)

	const handleClick = (option: string) => {
		if (option === selected) return

		setSelected(option)
		emitChange(option)
	}

	useEffect(() => {
		if (isMenuOpen && optionsContainerRef.current) {
			optionsContainerRef.current.focus()
		}
	}, [isMenuOpen])

	return (
		<div className={classNames({ FloatingMenu: true, isOpen: isMenuOpen })}>
			<div className='selected-container clickable' onClick={() => setIsMenuOpen(!isMenuOpen)}>
				<span className='selected'>{selected}</span>
			</div>
			{isMenuOpen && (
				<div
					className='options-container'
					tabIndex={0}
					onBlur={() => setIsMenuOpen(!isMenuOpen)}
					ref={optionsContainerRef}>
					{options.map((option, index) => (
						<div
							key={index}
							className={classNames({ clickable: true, option: true, selected: selected === option })}
							onClick={() => handleClick(option)}>
							{option}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default FloatingMenu
