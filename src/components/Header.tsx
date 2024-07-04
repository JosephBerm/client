'use client'

import React from 'react'

import PublicNavBar from '@/components/Navigation/PublicNavBar'
import { usePathname } from 'next/navigation'
import Routes from '@/services/routes'

function Header() {
	const path = usePathname()

	const isOnCredentialsPage = path.includes('login') || path.includes('signup')
	const isUserInInternalApp = path.includes(Routes.InternalAppRoute)

	if (isOnCredentialsPage || isUserInInternalApp) return null

	return <PublicNavBar />
}

export default Header
