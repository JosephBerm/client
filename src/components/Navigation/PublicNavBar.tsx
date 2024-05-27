'use client'

import React, { useState, useEffect } from 'react'
import Routes from '@/services/routes'
import Link from 'next/link'

import { useRouter } from 'next/navigation'

function NavBar() {
	const router = useRouter()

	const [navStyleClassName, setNavStyleClassName] = useState('nav_StyledLinks')
	const SecuredPaths = [Routes.InternalAppRoute]

	const toggleNavbar = () => {
		if (navStyleClassName.includes('opened')) {
			setNavStyleClassName('nav_StyledLinks closed')
		} else {
			setNavStyleClassName('nav_StyledLinks opened')
		}
		document.body.classList.toggle('blur')
	}

	const enterLogin = () => {
		router.push('/login')
	}

	return (
		<header className='header public'>
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
								) : route.icon ? (
									<button
										className='clickable titled'
										onClick={() => router.push(route.location)}
										data-title={route.name}>
										<i className={route.icon} />
									</button>
								) : (
									<Link className='inline-link' href={route.location}>
										{route.name}
									</Link>
								)}
							</li>
						))}
					</ol>
					<Link className='nav-link' href={'/cart'}>
						<i className='fa-solid fa-cart-shopping'></i>
					</Link>

					<button onClick={enterLogin}>
						<span className='route-link'>Login</span>
					</button>
				</div>
			</nav>
		</header>
	)
}
export default NavBar
