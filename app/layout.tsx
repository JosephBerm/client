import type { Metadata, Viewport } from 'next'

import { Suspense } from 'react'

import { themeInitScript } from '@_scripts/theme-init-inline'

import AuthInitializer from '@_components/common/AuthInitializer'
import ImageServiceInitializer from '@_components/common/ImageServiceInitializer'
import QueryProvider from '@_components/common/QueryProvider'
import ServiceWorkerRegistration from '@_components/common/ServiceWorkerRegistration'
import ToastProvider from '@_components/common/ToastProvider'
import UserSettingsInitializer from '@_components/common/UserSettingsInitializer'
import NavigationLayout from '@_components/navigation/NavigationLayout'
import LiveChatBubble from '@_components/ui/LiveChatBubble'

import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import '@_scripts/theme-init'

// ============================================================================
// LOADING SHELL COMPONENT
// ============================================================================

/**
 * Navigation Loading Shell
 *
 * Minimal loading state shown during:
 * - Initial page load / hydration
 * - Navigation between routes with async Server Component layouts
 * - RSC payload streaming
 *
 * Design principles (per Next.js 16 best practices):
 *
 * 1. **Minimal CLS**: Matches the base layout structure to prevent layout shift
 *    when content loads. Uses min-h-screen to reserve viewport height.
 *
 * 2. **Fast Paint**: Lightweight markup with no heavy components or images.
 *    The browser can render this almost instantly.
 *
 * 3. **Theme Consistency**: Uses bg-base-100 which inherits from the theme
 *    set by themeInitScript, preventing flash of wrong colors.
 *
 * Note: This is NOT a skeleton loader. Individual routes use loading.tsx
 * for detailed skeleton UIs. This is just a stable shell for navigation.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */
function NavigationLoadingShell() {
	return (
		<div className="min-h-screen w-full bg-base-100">
			{/*
				Matches NavigationLayout structure:
				- Public routes: full-width content area
				- Internal routes (/app/*): sidebar + content (handled by their own layout)
			*/}
			<div className="flex min-h-screen">
				<main className="flex-1 bg-base-100" aria-busy="true" aria-label="Loading..." />
			</div>
		</div>
	)
}

/**
 * SEO Metadata
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
	title: 'MedSource Pro - Medical B2B Marketplace',
	description: 'Professional medical supply marketplace for healthcare providers',
}

/**
 * Viewport Configuration
 *
 * MAANG-level mobile viewport handling:
 * - viewportFit: 'cover' enables env(safe-area-inset-*) for iOS notches/Dynamic Island
 * - userScalable: true maintains accessibility (WCAG 2.1 compliance)
 * - maximumScale: 5 allows zoom for accessibility
 *
 * @see https://webkit.org/blog/7929/designing-websites-for-iphone-x/
 */
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	viewportFit: 'cover',
}

/**
 * Next.js 16.1.1 Root Layout Architecture
 *
 * With `cacheComponents: true` enabled in next.config.mjs, this layout benefits from:
 *
 * 1. **Partial Prerendering (PPR)**: Static shell is pre-rendered at build time,
 *    dynamic parts stream in via Suspense boundaries.
 *
 * 2. **React Activity Component**: Next.js 16 uses React's <Activity> component
 *    internally to preserve component state across navigations. Layouts don't
 *    unmount during navigation - they're hidden via Activity mode.
 *
 * 3. **Streaming**: Suspense fallbacks show immediately while dynamic content loads.
 *    This enables fast Time to First Byte (TTFB) and First Contentful Paint (FCP).
 *
 * @see https://nextjs.org/docs/app/getting-started/cache-components
 * @see https://nextjs.org/docs/app/getting-started/partial-prerendering
 */

/**
 * Root layout for the entire application
 * Sets up theme, authentication, and navigation
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* CRITICAL: Inline script to prevent FOUC - MUST run synchronously before any rendering */}
				{/* This CANNOT use next/script as it needs to run immediately, not async */}
				{/* ESLint: This is safe because:
				    1. themeInitScript is a static string generated at build time (not user input)
				    2. It's our own trusted code for theme initialization
				    3. Must be inline to prevent FOUC (Flash of Unstyled Content)
				    4. Next.js Script component is async and would cause FOUC */}
				{/* eslint-disable-next-line react/no-danger */}
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
			</head>
		<body>
			{/* React Query Provider - Enables caching, deduplication, and infinite queries */}
			<QueryProvider>
				{/* Initialize services on app load */}
				<UserSettingsInitializer />
				<AuthInitializer />
				<ImageServiceInitializer />
				<ServiceWorkerRegistration />

			{/*
				Main Navigation Wrapper with Suspense Boundary

				Next.js 16.1.1 with cacheComponents: true (PPR enabled):

				This Suspense boundary serves two purposes:

				1. **Client Component Hydration**: NavigationLayout uses usePathname() which
				   requires a Suspense boundary during prerendering. Without this, you get
				   hydration errors or build failures.

				2. **Navigation Loading State**: When navigating between routes that have
				   async Server Component layouts (like /app/* which uses cookies()),
				   this fallback shows while the RSC payload streams in.

				The fallback is intentionally a minimal shell that:
				- Matches the base background color to prevent flash
				- Reserves viewport height to minimize Cumulative Layout Shift (CLS)
				- Is lightweight for fast initial paint

				Individual route segments should use loading.tsx for route-specific
				loading skeletons. This root Suspense is only for the navigation shell.

				@see https://nextjs.org/docs/app/api-reference/file-conventions/loading
				@see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
			*/}
			<Suspense fallback={<NavigationLoadingShell />}>
				<NavigationLayout>
					{children}
				</NavigationLayout>
			</Suspense>

				{/* Theme-aware toast notifications */}
				<ToastProvider />

				{/*
					Global Live Chat Bubble - Available on all pages

					Wrapped in Suspense because:
					1. It's a Client Component that may use hooks requiring Suspense
					2. Isolates it from the main content Suspense boundary
					3. fallback={null} is acceptable here since it's a floating UI element
					   that doesn't affect layout (positioned fixed in bottom-right corner)

					@see https://nextjs.org/docs/app/building-your-application/rendering/client-components
				*/}
				<Suspense fallback={null}>
					<LiveChatBubble />
				</Suspense>
			</QueryProvider>
		</body>
		</html>
	)
}
