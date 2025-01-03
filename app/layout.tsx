import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import Header from '@/components/Header'
import WrapperHandlerPublic from '@/components/WrapperHandlerPublic'
import { cookies } from 'next/headers'
import DropdownProvider from '@/src/context/DropdownProvider'

import 'react-toastify/dist/ReactToastify.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/styles/navigations.css'
import '@/styles/App/app.css'
import './globals.css'

export const metadata: Metadata = {
	title: 'MedSource',
	description: 'Created by Code Prodigies',
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

export default async function RootLayout(props: any) {
	const cookiesStore = cookies()
	const token = cookiesStore.get('at')
	let response = null

	// Load user data into state management library.
	if (token != null) {
		response = await getUserData(token.value)
	}

	return (
		<html lang='en'>
			<body>
				<WrapperHandlerPublic User={response?.payload} />
				<Header />

				<DropdownProvider>
					<main className='page-container'>{props.children}</main>
					<ToastContainer />
				</DropdownProvider>
			</body>
		</html>
	)
}
