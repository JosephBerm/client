import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { IUser } from '@_classes/User'
import { logger } from '@_core'
import { Routes } from '@_features/navigation'

// Old components - now using modernized navigation in root layout
// import Sidebar from '@/components/Sidebar'
// import WrapperHandler from '@/components/WrapperHandler'
// import Breadcrumb from '@/components/Navigation/BreadCrumb'
// import SecuredNavBar from '@/components/Navigation/SecuredNavBar'

export const metadata: Metadata = {
	title: 'MedSource Pro',
	description: 'Best Medical Marketplace for your business needs.',
}

async function getUserData(token: string | null) {
	if (token == null) return token

	try {
		// Use NEXT_PUBLIC_API_URL for consistency with client-side code
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254/api'
		const response = await fetch(`${apiUrl}/account`, {
			cache: 'no-store',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (response.ok) return await response.json()
	} catch (err) {
		logger.error('Failed to fetch user in layout', {
			error: err,
			component: 'MedsourceAppLayout',
		})
	}

	return null
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const cookiesStore = await cookies()
	const token = cookiesStore.get('at')

	// Load user data into state management library.
	// Note: Middleware handles redirects for unauthenticated users, but this is a fallback
	if (token == null) {
		return redirect(Routes.openLoginModal())
	}
	const response = await getUserData(token.value)
	if (response?.payload == null) {
		// Ensure the Authorization token is valid.
		return redirect(Routes.openLoginModal())
	}

	// Navigation is now handled by root layout with modernized components
	return <div className="min-h-screen bg-base-200">{children}</div>
}

