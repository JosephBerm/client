'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Login Page (Deprecated)
 * 
 * This page redirects to the home page with the login modal open.
 * The login functionality has been moved to a modal component.
 * 
 * @deprecated Use LoginModal component instead
 */
export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	useEffect(() => {
		// Redirect to home with login modal query param
		const url = new URL(window.location.origin)
		url.pathname = '/'
		url.searchParams.set('login', 'true')
		if (redirectTo) {
			url.searchParams.set('redirectTo', redirectTo)
		}
		router.replace(url.toString())
	}, [router, redirectTo])

	return null
}

