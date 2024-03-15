'use client'

import React, { useState, useEffect } from 'react'
import Routes from '@/services/routes'
import Route from '@/interfaces/Route'

import { useRouter } from 'next/navigation'
import '@/styles/navbar.css'

function NavBar() {
	const router = useRouter()

	const [navStyleClassName, setNavStyleClassName] = useState('nav_StyledLinks')
	const SecuredPaths = ["dashboard"]

	const toggleNavbar = () => {
		console.log('navbar toggled')
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
						{Routes.navRoutes.map((route, index) => (
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
					{/* <div className='button-container' style={{ animationDelay: `${Routes.navRoutes.length * 0.1}s` }}>
						<button
							className='button p-2'
							rel='noopener noreferrer'
							onClick={() => router.push('/dashboard/notifications')}>
							<i className='fa-regular fa-bell' />
						</button>
					</div> */}
				</div>
			</nav>
		</header>
	)
}
export default NavBar
