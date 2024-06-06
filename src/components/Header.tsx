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

	if (path.includes('login') || path.includes('signup')) return null // Early return for login/signup

	// Set the navbar based on the role.
	// We might want to render different navbars based on the user's location, or other factors.
	if (!path.includes(Routes.InternalAppRoute)) return <PublicNavBar />

	switch (User.role) {
		case AccountRole.Customer:
		case AccountRole.Admin:
			return <SecuredNavBar />
		default:
			return <PublicNavBar />
	}
}

export default Header
