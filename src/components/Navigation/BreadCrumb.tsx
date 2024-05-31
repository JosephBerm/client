'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Routes from '@/services/routes'

function formatPath(path: String) {
	if (Routes.InternalAppRoute.toLowerCase() === `/${path.toLowerCase()}`) return 'Dashboard'

	return path.charAt(0).toUpperCase() + path.slice(1)
}

export default function Breadcrumb() {
	const [pathSplit, setPathSplit] = useState<String[]>([])
	const path = usePathname().toString()

	useEffect(() => {
		//what is this regex for? what is it calculating?
		const regex = /(\/)|([^/]+)/g
		const pathsplit = path.match(regex)
		setPathSplit(pathsplit || [])
	}, [path])

	if (!path.startsWith(Routes.InternalAppRoute)) return <></>

	return (
		<div className='Breadcrumb'>
			{pathSplit.map((value: String, index: number) => {
				if (index === 0) return
				if (value === '/')
					return (
						<span key={index} className='seperator'>
							{value}
						</span>
					)
				else if (index < pathSplit.length - 1) {
					// Create a new array without modifying the original pathSplit
					const mypath = pathSplit.slice(0, index + 1)

					return (
						<Link
							key={index}
							href={mypath.join('')} // Join the array elements without any separator
							className='link'>
							{formatPath(value)}
						</Link>
					)
				}

				return (
					<span key={index} className='active'>
						{formatPath(value)}
					</span>
				)
			})}
		</div>
	)
}
