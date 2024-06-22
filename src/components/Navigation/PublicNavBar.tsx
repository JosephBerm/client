'use client'

import React, { useState, useEffect } from 'react'
import Routes from '@/services/routes'
import Link from 'next/link'
import { useAccountStore } from '@/src/stores/user'
import Image from 'next/image'
import Logo from '@/public/big-logo.png'

import { useRouter, usePathname } from 'next/navigation'
import path from 'path'

function NavBar() {
	const router = useRouter()
	const pathName = usePathname()

	const [navStyleClassName, setNavStyleClassName] = useState('nav_StyledLinks')
	const [currentPath, setCurrentPath] = useState(pathName)
	const SecuredPaths = [Routes.InternalAppRoute]

	const loggedIn = useAccountStore((state) => state.LoggedIn)
	const state = useAccountStore((state) => state)

	const toggleNavbar = (forceClose = false) => {
		if (forceClose || navStyleClassName.includes('opened')) {
			setNavStyleClassName('nav_StyledLinks closed')
		} else {
			setNavStyleClassName('nav_StyledLinks opened')
		}
		document.body.classList.toggle('blur')
	}

	const enterLogin = () => {
		if (loggedIn) router.push('/medsource-app')
		else router.push('/login')
	}
	useEffect(() => {
		if (currentPath !== pathName || pathName === '/') {
			toggleNavbar(true)
		}
	}, [pathName])

	return (
		<header className='header public'>
			<nav className='navbar'>
				<div className='logo'>
					<Image priority src={Logo} alt='logo' />
				</div>
				<div className='burger-button' onClick={() => toggleNavbar()}>
					<i className='fa-solid fa-bars' />
				</div>
				<div className={navStyleClassName}>
					<div className='sliding-nav-container'>
						<ol>
							{Routes.publicRoutes.map((route, index) => (
								<li key={index} style={{ animationDelay: `${index * 0.1}s` }}>
									{route.component ? (
										<route.component />
									) : (
										<Link className='inline-link' href={route.location}>
											{route.name}
										</Link>
									)}
								</li>
							))}
						</ol>
						<div className='gapped-fields'>
							<Link className='nav-link flex justify-center items-center' href={'/cart'}>
								<i className='fa-solid fa-cart-shopping'></i>
							</Link>
							<button onClick={enterLogin}>
								<span className='route-link'>{loggedIn ? 'Dashboard' : 'Login'}</span>
							</button>
						</div>
					</div>
				</div>
			</nav>
		</header>
	)
}
export default NavBar
