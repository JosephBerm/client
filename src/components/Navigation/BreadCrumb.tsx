'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function formatPath(string: String) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

export default function Breadcrumb() {
	const [pathSplit, setPathSplit] = useState<String[]>([])
	const path = usePathname().toString()

	useEffect(() => {
		//what is this regex for? what is it calculating?
		const regex = /(\/)|([^/]+)/g
		const pathsplit = path.match(regex)
		setPathSplit(pathsplit!)
	}, [path])

	if (!path.startsWith('/dashboard')) return <></>

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

				if (index < pathSplit.length - 1 && value !== '/') {
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
