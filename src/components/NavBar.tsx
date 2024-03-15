'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import '@/styles/navbar.css'
import { headers } from 'next/headers'

import { NextRequest } from 'next/server'

import SecuredNavBar from '@/components/Navigation/SecuredNavBar'
import PublicNavBar from '@/components/Navigation/PublicNavBar'

function NavBar() {
	const path = usePathname()
	const [securedRoute, setSecuredRoute] = useState(false)

	useEffect(() => {
		if (path.includes('dashboard')) {
			setSecuredRoute(true)
		} else {
			setSecuredRoute(false)
		}
	}, [path])

	return (
		<>
			{securedRoute && <SecuredNavBar />}
			{!securedRoute && <PublicNavBar />}
		</>
	)
}

export default NavBar
