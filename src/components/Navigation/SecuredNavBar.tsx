'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import InputTextBox from '@/components/InputTextBox'
import NotificationBell from '@/components/Navigation/NotificationBell'
import ProfilePreview from '../ProfilePreview'
import Breadcrumb from '@/src/components/Navigation/BreadCrumb'
import classNames from 'classnames'
import Link from 'next/link'

function CustomerNavBar() {
	const [searchText, setSearchText] = useState('')

	const [hasFloatingButton, setHasFloatingButton] = useState(true)
	const handleSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.currentTarget.value)
	}

	return (
		<header className='header customer'>
			<nav className='navbar'>
				<Link className='app-title-container clickable' href='/'>
					(())
					<span>MEDSOURCE</span>
				</Link>
				<div className='navbar-container'>
					<div className='current-route-details'>
						<Breadcrumb />
					</div>
					<div className='options'>
						<div className={classNames({ 'search-container': true, 'is-hidden': hasFloatingButton })}>
							<button
								className='floating-button'
								onClick={() => setHasFloatingButton(!hasFloatingButton)}>
								<i className='fa-solid fa-magnifying-glass' />
							</button>
							<InputTextBox
								value={searchText}
								type='text'
								handleChange={handleSearchTextChange}
								icon='fa-solid fa-magnifying-glass'
								autofocused={true}
							/>
						</div>
						<NotificationBell />
						<ProfilePreview />
					</div>
				</div>
			</nav>
		</header>
	)
}

export default CustomerNavBar
