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

// Force dynamic rendering due to useSearchParams in Navbar (login modal detection)
export const dynamic = 'force-dynamic'

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
