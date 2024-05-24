import React, { useState, useEffect, ChangeEvent } from 'react'
import InputTextBox from '@/components/InputTextBox'
import NotificationBell from '@/components/Navigation/NotificationBell'
import classNames from 'classnames'
import ProfilePreview from '../ProfilePreview'

function CustomerNavBar() {
	const [searchText, setSearchText] = useState('')
	const [hasFloatingButton, setHasFloatingButton] = useState(true)
	const handleSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.currentTarget.value)
	}
	const hideFloatingButton = () => {}

	return (
		<header className='header'>
			<nav className='navbar'>
				<div className='logo'>
					<a href='/'>MEDSOURCE</a>
				</div>
				<div className='navbar-container'>
					<div className={classNames({ 'search-container': true, 'is-hidden': !hasFloatingButton })}>
						<button className='floating-button' onClick={hideFloatingButton}>
							<i className='fa-solid fa-magnifying-glass' />
						</button>

						<InputTextBox
							value={searchText}
							type='text'
							handleChange={handleSearchTextChange}
							iconClass='fa-solid fa-magnifying-glass'
						/>
					</div>
					<NotificationBell />
					<ProfilePreview />
				</div>
			</nav>
		</header>
	)
}

export default CustomerNavBar
