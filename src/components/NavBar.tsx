'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

import SecuredNavBar from '@/components/Navigation/SecuredNavBar'
import PublicNavBar from '@/components/Navigation/PublicNavBar'
import CustomerNavBar from '@/components/Navigation/CustomerNavBar'
import Routes from '@/services/routes'
import { UserType } from '@/classes/Enums'

function NavBar() {
	const path = usePathname()
	const [securedRoute, setSecuredRoute] = useState<UserType>(UserType.Visitor)

	useEffect(() => {
		if (path.includes(Routes.InternalAppRoute)) {
			setSecuredRoute(UserType.Employee)
		} else if (path.includes(Routes.CustomerAppRoute)) {
			setSecuredRoute(UserType.Customer)
		} else {
			setSecuredRoute(UserType.Visitor) // Set default for non-matching routes
		}
	}, [path])

	if (path.includes('login') || path.includes('signup')) return null // Early return for login/signup

	if (securedRoute === UserType.Employee) return <SecuredNavBar />
	else if (securedRoute === UserType.Customer) return <CustomerNavBar />
	else return <PublicNavBar />
}

export default NavBar
