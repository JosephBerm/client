import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected route patterns
const protectedRoutes = [
	'/accounts',
	'/analytics',
	'/customers',
	'/orders',
	'/profile',
	'/providers',
	'/quotes',
]

// Auth routes (redirect to home if already authenticated)
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
	const token = request.cookies.get('at')
	const { pathname } = request.nextUrl

	// Check if current route is protected
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

	// Check if current route is an auth route
	const isAuthRoute = authRoutes.some((route) => pathname === route)

	// Redirect to login if accessing protected route without token
	if (isProtectedRoute && !token) {
		const url = request.nextUrl.clone()
		url.pathname = '/login'
		url.searchParams.set('redirectTo', pathname)
		return NextResponse.redirect(url)
	}

	// Redirect authenticated users away from auth pages to home
	if (isAuthRoute && token) {
		const url = request.nextUrl.clone()
		url.pathname = '/'
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (images, etc.)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}

