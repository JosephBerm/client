import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import NavigationLayout from '@_components/navigation/NavigationLayout'
import AuthInitializer from '@_components/common/AuthInitializer'
import UserSettingsInitializer from '@_components/common/UserSettingsInitializer'

import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

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
				<script
					dangerouslySetInnerHTML={{
						__html: `
							// Prevent flash of unstyled content (FOUC) for theme
							try {
								const settings = JSON.parse(localStorage.getItem('user-settings') || '{}');
								const theme = settings.state?.theme || 'medsource-classic';
								document.documentElement.setAttribute('data-theme', theme);
							} catch (e) {
								document.documentElement.setAttribute('data-theme', 'medsource-classic');
							}
						`,
					}}
				/>
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
