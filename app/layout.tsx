import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import NavigationLayout from '@_components/navigation/NavigationLayout'
import AuthInitializer from '@_components/common/AuthInitializer'
import UserSettingsInitializer from '@_components/common/UserSettingsInitializer'
import { themeInitScript } from '@_scripts/theme-init-inline'

import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import '@_scripts/theme-init'

export const metadata: Metadata = {
	title: 'MedSource Pro - Medical B2B Marketplace',
	description: 'Professional medical supply marketplace for healthcare providers',
}

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
				{/* Initialize user settings and auth on app load */}
				<UserSettingsInitializer />
				<AuthInitializer />

				{/* Main navigation wrapper */}
				<NavigationLayout>
					{children}
				</NavigationLayout>

				{/* Toast notifications */}
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>
			</body>
		</html>
	)
}
