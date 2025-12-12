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

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

