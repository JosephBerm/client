'use client'

import React, { useState, useEffect } from 'react'
import Routes from '@/services/routes'
import Route from '@/interfaces/Route'

import { useRouter, usePathname } from 'next/navigation'

function NavBar() {
	const router = useRouter()

	const [navStyleClassName, setNavStyleClassName] = useState('nav_StyledLinks')
	const SecuredPaths = ['employee-dashboard']

	const [pathSplit, setPathSplit] = React.useState<String[]>([])
	const [currentPath, setCurrentPath] = React.useState<String[]>([])
	const path = usePathname().toString()

	useEffect(() => {
		const regex = /(\/)|([^/]+)/g
		const pathsplit = path.match(regex)
		const cleanSlashes = pathsplit?.filter((value) => value !== '/')
		const cleanDashboard = cleanSlashes?.filter((value) => value !== 'employee-dashboard')
		setCurrentPath(cleanDashboard!)
	}, [path])

	const toggleNavbar = () => {
		if (navStyleClassName.includes('opened')) {
			setNavStyleClassName('nav_StyledLinks closed')
		} else {
			setNavStyleClassName('nav_StyledLinks opened')
		}
		document.body.classList.toggle('blur')
	}

	const isCurrentPath = (path: string) => {
		if (currentPath.length === 0 && path == '/employee-dashboard') return true
		return path.includes(currentPath[0] as string)
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
						{Routes.internalRoutes.map((route, index) => (
							<li key={index} style={{ animationDelay: `${index * 0.1}s` }}>
								{route.component ? (
									<route.component />
								) : (
									<button
										className={`clickable titled ${
											isCurrentPath(route.location) ? 'active' : 'inactive'
										}`}
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
							onClick={() => router.push('/employee-dashboard/notifications')}>
							<i className='fa-regular fa-bell' />
						</button>
					</div> */}
				</div>
			</nav>
		</header>
	)
}
export default NavBar
