'use client'

import React, { useState, useEffect } from 'react'
import Routes from '@/services/routes'

import { useRouter } from 'next/navigation'

function NavBar() {
	const router = useRouter()

	const [navStyleClassName, setNavStyleClassName] = useState('nav_StyledLinks')
	const SecuredPaths = ['dashboard']

	const toggleNavbar = () => {
		if (navStyleClassName.includes('opened')) {
			setNavStyleClassName('nav_StyledLinks closed')
		} else {
			setNavStyleClassName('nav_StyledLinks opened')
		}
		document.body.classList.toggle('blur')
	}

	return (
		<header className='header'>
			<nav className='navbar'>
				<div className='logo'>
					<a href='/'>LOGO</a>
				</div>
				<div className='burger-button' onClick={toggleNavbar}>
					<i className='fa-solid fa-bars' />
				</div>
				<div className={navStyleClassName}>
					<ol>
						{Routes.publicRoutes.map((route, index) => (
							<li key={index} style={{ animationDelay: `${index * 0.1}s` }}>
								{route.component ? (
									<route.component />
								) : (
									<button
										className='clickable titled'
										onClick={() => router.push(route.location)}
										data-title={route.name}>
										<i className={route.icon} />
									</button>
								)}
							</li>
						))}
					</ol>
				</div>
			</nav>
		</header>
	)
}
export default NavBar
