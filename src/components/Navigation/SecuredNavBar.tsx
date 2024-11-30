'use client'

import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'
import classNames from 'classnames'

import NotificationBell from '@/components/Navigation/NotificationBell'
import Breadcrumb from '@/src/components/Navigation/BreadCrumb'
import { useRouter } from 'next/navigation'
import Routes from '@/src/services/routes'
import Link from 'next/link'

import InputTextBox from '@/components/InputTextBox'
import ProfilePreview from '../ProfilePreview'

function CustomerNavBar() {
	const router = useRouter()
	const [searchText, setSearchText] = useState('')

	const [isSearchToggled, setIsSearchToggled] = useState(false)
	const handleSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.currentTarget.value)
	}
	// Detects Enter key press
	const handleSearchTextKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			searchProducts()
		}
	}
	const searchProducts = () => {
		if (!searchText) {
			router.push(Routes.Store.location)
		} else {
			router.push(Routes.Store.location + '?search=' + searchText)
		}
	}

	return (
		<header className='header customer'>
			<nav className='navbar'>
				<Link className='app-title-container clickable' href='/'>
					(())
					<span>MEDSOURCE</span>
				</Link>
				<div className='navbar-container'>
					<Breadcrumb />
					<div className='options'>
						<div className={classNames({ 'search-container': true, searchable: isSearchToggled })}>
							{isSearchToggled && (
								<div className='search-input'>
									<InputTextBox
										value={searchText}
										type='text'
										handleChange={handleSearchTextChange}
										handleKeyDown={handleSearchTextKeyDown}
										placeholder='Search Products'
										autofocused={true}
									/>
									<button
										className='floating-button'
										onClick={() => setIsSearchToggled(!isSearchToggled)}>
										<i className='fa-solid fa-x' />
									</button>
								</div>
							)}
							{!isSearchToggled ? (
								<button
									className='toggle-search-button'
									onClick={() => setIsSearchToggled(!isSearchToggled)}>
									<i className='fa-solid fa-magnifying-glass' />
								</button>
							) : (
								<button className='toggle-search-button' onClick={() => searchProducts()}>
									<i className='fa-solid fa-magnifying-glass' />
								</button>
							)}
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
