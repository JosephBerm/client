'use client'

import React, { useState, useEffect } from 'react'

import SecuredNavBar from '@/components/Navigation/SecuredNavBar'
import PublicNavBar from '@/components/Navigation/PublicNavBar'
import { AccountRole } from '@/classes/Enums'
import { useAccountStore } from '@/src/stores/user'
import { usePathname } from 'next/navigation'
import Routes from '@/services/routes'

function Header() {
	const User = useAccountStore((state) => state.User)
	const path = usePathname()

	const isOnCredentialsPage = path.includes('login') || path.includes('signup')
	const isUserInInternalApp = path.includes(Routes.InternalAppRoute)

	if (isOnCredentialsPage || isUserInInternalApp) return null

	return <PublicNavBar />
}

export default Header
