import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

// Protected route patterns - these require authentication
const protectedRoutes = [
	'/app',
	'/accounts',
	'/analytics',
	'/customers',
	'/orders',
	'/profile',
	'/providers',
	'/quotes',
]

/**
 * Auth routes - redirect to home with login modal if accessed directly.
 *
 * These routes are deprecated but kept here for backward compatibility.
 * All new code should use Routes.openLoginModal() instead of navigating to these routes.
 *
 * Note: proxy.ts runs on Node.js runtime (not Edge).
 * We keep hardcoded strings here to avoid circular dependencies with Routes.
 */
const authRoutes = ['/login', '/signup']

/**
 * Header name for forwarding tenant host to server components.
 *
 * This enables PPR (Partial Prerendering) compatibility by allowing
 * the root layout to read the host without calling headers() directly.
 * The proxy sets this header on every request, making it available
 * during static shell generation with cacheComponents enabled.
 */
const TENANT_HOST_HEADER = 'x-tenant-host'

export function proxy(request: NextRequest) {
	const token = request.cookies.get('at')
	const { pathname } = request.nextUrl

	// Check if current route is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

	// Check if current route is an auth route
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

	// Redirect to home with login modal query param if accessing protected route without token
	if (isProtectedRoute && !token) {
		const url = request.nextUrl.clone()
		url.pathname = '/'
		url.searchParams.set('login', 'true')
		url.searchParams.set('redirectTo', pathname)
		return NextResponse.redirect(url)
	}

	// Redirect to home with login modal query param if accessing auth routes
	// These routes should not exist - everything should use the login modal
	if (isAuthRoute) {
		const url = request.nextUrl.clone()
		url.pathname = '/'
		url.searchParams.set('login', 'true')
		// Preserve redirectTo if it exists
		const redirectTo = request.nextUrl.searchParams.get('redirectTo')
		if (redirectTo) {
			url.searchParams.set('redirectTo', redirectTo)
		}
		return NextResponse.redirect(url)
	}

	// Forward host header for multi-tenant resolution
	// This allows the root layout to read the host without calling headers()
	// directly, enabling PPR (Partial Prerendering) with cacheComponents
	const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
	const requestHeaders = new Headers(request.headers)
	if (host) {
		requestHeaders.set(TENANT_HOST_HEADER, host)
	}

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	})
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

