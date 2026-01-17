/**
 * Internal App Layout - Authenticated Routes
 * 
 * Async Server Component layout for /app/* routes.
 * Provides server-side authentication and wraps pages with InternalAppShell.
 * 
 * ## Next.js 16.1.1 Architecture (cacheComponents: true)
 * 
 * This layout is **dynamic** because it uses `cookies()` to check authentication.
 * With Partial Prerendering (PPR) enabled, this affects rendering behavior:
 * 
 * ### How It Works:
 * 1. **Static Shell**: The root layout's static parts are pre-rendered at build time
 * 2. **Dynamic Layout**: This layout executes at request time (due to cookies())
 * 3. **Streaming**: Content streams in while loading.tsx shows fallback UI
 * 4. **State Preservation**: React's Activity component preserves layout state
 *    across navigations - InternalAppShell doesn't unmount between page changes
 * 
 * ### Why cookies() Makes This Dynamic:
 * Per Next.js 16 docs, accessing runtime request APIs (cookies, headers, searchParams)
 * opts the component out of static rendering. The entire subtree becomes dynamic
 * and is rendered fresh on each request.
 * 
 * ### Navigation Behavior:
 * With cacheComponents enabled, Next.js uses the Router Cache for navigation:
 * - First visit to a route: Full server render, loading.tsx shows
 * - Subsequent visits: Cached RSC payload used (faster)
 * - Layout persists via Activity component (state preserved)
 * 
 * ### Performance Optimizations:
 * - React.cache() wraps getUserData to deduplicate within same request
 * - proxy.ts (middleware) handles primary auth redirects before layout runs
 * - InternalAppShell syncs user data to client Zustand store once
 * 
 * @see https://nextjs.org/docs/app/getting-started/partial-prerendering
 * @see https://nextjs.org/docs/app/getting-started/cache-components
 * @see https://nextjs.org/docs/app/building-your-application/caching#router-cache
 * 
 * @module app/layout
 */

import type { Metadata } from 'next'

import { cache } from 'react'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { AUTH_COOKIE_NAME, API } from '@_shared'

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
 * **Architecture Note:**
 * - Wrapped in React.cache() to deduplicate calls within the same request
 * - Uses centralized API module (HttpService) which:
 *   - Automatically reads token from cookies (server or client)
 *   - Handles authentication headers
 *   - Provides consistent error handling
 * 
 * **Performance:**
 * React's cache() ensures this function is only called once per request,
 * even if multiple components need user data. The cache is automatically
 * invalidated between requests.
 * 
 * @returns User data response or null if invalid
 */
const getUserData = cache(async () => {
	try {
		// Use centralized API module - HttpService handles auth token automatically
		const response = await API.Accounts.get(null)

		if (response.status === 200 && response.data?.payload) {
			logger.debug('User data fetched successfully', {
				hasPayload: !!response.data.payload,
				component: 'InternalAppLayout',
			})
			return response.data
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
})

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
	// HttpService automatically reads token from cookies (via next/headers on server)
	const response = await getUserData()
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

