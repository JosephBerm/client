/**
 * Internal App Layout
 * 
 * Server Component layout for /app routes.
 * Provides authentication check and wraps pages with InternalAppShell.
 * 
 * **Features:**
 * - Server-side authentication validation
 * - User data fetching
 * - Redirect unauthenticated users
 * - Wraps with InternalAppShell (client component)
 * 
 * **Architecture:**
 * - Server Component (async)
 * - Auth check with token validation
 * - Fetches user data for role-based navigation
 * - Passes children to InternalAppShell
 * 
 * @module app/layout
 */

import type { Metadata } from 'next'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { 
	AUTH_COOKIE_NAME, 
	AUTH_HEADER_PREFIX, 
	DEFAULT_API_BASE_URL,
} from '@_shared'

import { InternalAppShell } from './_components'

export const metadata: Metadata = {
	title: 'MedSource Pro - Internal App',
	description: 'Manage orders, products, and business operations',
}

/**
 * Fetches user data from API using authentication token.
 * 
 * Server-side function to validate token and get user info.
 * Used for role-based navigation rendering.
 * 
 * @param token - Authentication token from cookies
 * @returns User data or null if invalid
 */
async function getUserData(token: string | null) {
	if (token == null) {return token}

	try {
		// Use centralized API URL constant for consistency
		const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
		const response = await fetch(`${apiUrl}/account`, {
			cache: 'no-store',
			headers: {
				Authorization: `${AUTH_HEADER_PREFIX}${token}`,
			},
		})

		if (response.ok) {
			const userData = await response.json()
			logger.debug('User data fetched successfully', {
				hasPayload: !!userData?.payload,
				component: 'InternalAppLayout',
			})
			return userData
		}

		logger.warn('Failed to fetch user data - invalid response', {
			status: response.status,
			component: 'InternalAppLayout',
		})
	} catch (err) {
		logger.error('Failed to fetch user in layout', {
			error: err,
			component: 'InternalAppLayout',
		})
	}

	return null
}

/**
 * Internal App Layout Component
 * 
 * Server Component that handles authentication and wraps pages
 * with the InternalAppShell for consistent layout.
 * 
 * **Flow:**
 * 1. Check for authentication token
 * 2. Validate token by fetching user data
 * 3. Redirect if invalid
 * 4. Wrap children with InternalAppShell
 * 
 * @param props - Layout props including children
 * @returns Layout with InternalAppShell
 */
export default async function InternalAppLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const cookiesStore = await cookies()
	const token = cookiesStore.get(AUTH_COOKIE_NAME)

	// Check authentication token
	// Note: Middleware handles primary redirects, this is a fallback
	if (token == null) {
		logger.warn('No auth token found in internal app layout', {
			component: 'InternalAppLayout',
		})
		return redirect(Routes.openLoginModal())
	}

	// Validate token and get user data
	const response = await getUserData(token.value)
	if (response?.payload == null) {
		logger.warn('Invalid auth token in internal app layout', {
			component: 'InternalAppLayout',
		})
		return redirect(Routes.openLoginModal())
	}

	// Render with InternalAppShell
	// InternalAppShell is a Client Component that handles:
	// - Sidebar navigation (role-based)
	// - Breadcrumb navigation (auto-generated)
	// - Responsive layout (mobile/desktop)
	// - Auth store initialization (syncs server user data to client)
	return <InternalAppShell user={response.payload}>{children}</InternalAppShell>
}

