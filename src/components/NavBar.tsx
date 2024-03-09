'use client'

import React, { useState, useEffect } from 'react'
import Routes from '@/src/services/routes'

import { useRouter } from 'next/navigation'
import '@/styles/navbar.css'

function NavBar() {
	const router = useRouter()

	const [navStyleClassName, setNavStyleClassName] = useState('nav_StyledLinks')

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
					click
				</div>
				<div className={navStyleClassName}>
					<ol>
						{Routes.navRoutes.map((route, index) => (
							<li key={index} style={{ animationDelay: `${index * 0.1}s` }}>
								<button className='clickable' onClick={() => router.push(route.location)}>
									{route.name}
								</button>
							</li>
						))}
					</ol>
					<div className='button-container' style={{ animationDelay: `${Routes.navRoutes.length * 0.1}s` }}>
						<button className='button' rel='noopener noreferrer' onClick={() => {}}>
							Settings Cog
						</button>
					</div>
				</div>
			</nav>
		</header>
	)
}
export default NavBar
