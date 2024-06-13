'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccountStore } from '@/src/stores/user'
import Routes from '@/services/routes'
import Route from '@/interfaces/Route'

function Sidebar() {
	const router = useRouter()
	const pathName = usePathname()
	const [currentPath, setCurrentPath] = useState<String>(pathName)
	const User = useAccountStore((state) => state.User)
	useEffect(() => {
		const newPath = pathName
		setCurrentPath(newPath)
	}, [pathName])

	const isCurrentPath = useMemo(
		() => (path: string) => {
			return currentPath === path
		},
		[currentPath]
	)

	const pathsToRender = useMemo(
		() =>
			Routes.internalRoutes.filter((route) => {
				if (!route.accessible?.length) return true
				if (User?.role == null) return false
				return route?.accessible.includes(User?.role)
			}),
		[User?.role]
	)

	const handleRouteClick = (route: Route) => {
		router.push(route.location)
		setCurrentPath(route.location)
	}

	return (
		<nav className='Sidebar'>
			<div className='app-title-container'>
				(())
				<a href='/'>MEDSOURCE</a>
			</div>
			<ul>
				{pathsToRender.map((route, index) => (
					<li
						className={`clickable titled ${isCurrentPath(route.location) ? 'active' : 'inactive'}`}
						key={index}
						data-title={route.name}
						style={{ animationDelay: `${index * 0.1}s` }}
						onClick={() => handleRouteClick(route)}>
						{route.component ? <route.component /> : <i className={route.icon} />}
						<span className='path-label'>{route.name}</span>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default Sidebar
