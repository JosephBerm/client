'use client'

import React, { useState, ChangeEvent, KeyboardEvent } from 'react'
import classNames from 'classnames'

import NotificationBell from '@/components/Navigation/NotificationBell'
import Breadcrumb from '@/src/components/Navigation/BreadCrumb'
import { useRouter } from 'next/navigation'
import Routes from '@/src/services/routes'

import InputTextBox from '@/components/InputTextBox'
import ProfilePreview from '../ProfilePreview'
import Image from 'next/image'
import Logo from '@/public/big-logo.png'
import { PublicRouteType } from '@/src/classes/Enums'

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
				<Image
					priority
					src={Logo}
					alt='logo'
					onClick={() => router.push(Routes.getPublicRouteByValue(PublicRouteType.Home).location)}
					className='clickable nav-logo'
				/>

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
