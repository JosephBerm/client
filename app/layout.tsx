import type { Metadata } from 'next'

import { themeInitScript } from '@_scripts/theme-init-inline'

import AuthInitializer from '@_components/common/AuthInitializer'
import ImageServiceInitializer from '@_components/common/ImageServiceInitializer'
import ServiceWorkerRegistration from '@_components/common/ServiceWorkerRegistration'
import ToastProvider from '@_components/common/ToastProvider'
import UserSettingsInitializer from '@_components/common/UserSettingsInitializer'
import NavigationLayout from '@_components/navigation/NavigationLayout'
import LiveChatBubble from '@_components/ui/LiveChatBubble'


import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import '@_scripts/theme-init'

export const metadata: Metadata = {
	title: 'MedSource Pro - Medical B2B Marketplace',
	description: 'Professional medical supply marketplace for healthcare providers',
}

// No dynamic export needed - Next.js 15.5 automatically handles Client Components correctly.
// Navbar is a Client Component, so useSearchParams() is handled client-side.
// Layout can be statically optimized while Client Components handle dynamic behavior.
// This follows Next.js 15.5 best practices: static layout + Client Component for dynamic behavior.

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
			{/* Initialize services on app load */}
			<UserSettingsInitializer />
			<AuthInitializer />
			<ImageServiceInitializer />
			<ServiceWorkerRegistration />

			{/* Main navigation wrapper */}
			<NavigationLayout>
				{children}
			</NavigationLayout>

			{/* Theme-aware toast notifications */}
			<ToastProvider />

			{/* Global Live Chat Bubble - Available on all pages */}
			{/* Placed at root level to avoid interference from page-specific animations */}
			<LiveChatBubble />
			</body>
		</html>
	)
}
