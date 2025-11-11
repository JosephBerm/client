import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected route patterns - these require authentication
const protectedRoutes = [
	'/medsource-app',
	'/accounts',
	'/analytics',
	'/customers',
	'/orders',
	'/profile',
	'/providers',
	'/quotes',
]

// Auth routes - redirect to home if already authenticated
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
	const token = request.cookies.get('at')
	const { pathname } = request.nextUrl

	// Check if current route is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

	// Check if current route is an auth route
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

	// Redirect to login if accessing protected route without token
	if (isProtectedRoute && !token) {
		const url = request.nextUrl.clone()
		url.pathname = '/login'
		url.searchParams.set('redirectTo', pathname)
		return NextResponse.redirect(url)
	}

	// Redirect to home if accessing auth route with token
	if (isAuthRoute && token) {
		const url = request.nextUrl.clone()
		url.pathname = '/'
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}


