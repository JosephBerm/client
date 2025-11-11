import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { IUser } from '@_classes/User'

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
		const response = await fetch(process.env.API_URL + '/account', {
			cache: 'no-store',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (response.ok) return await response.json()
	} catch (err) {
		console.error(err)
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
	if (token == null) return redirect('/login')
	const response = await getUserData(token.value)
	if (response?.payload == null) return redirect('/login') // Ensure the Authorization token is valiud.

	// Navigation is now handled by root layout with modernized components
	return <div className="min-h-screen bg-base-200">{children}</div>
}
