import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import NavBar from '@/components/NavBar'
import WrapperHandlerPublic from '@/components/WrapperHandlerPublic'
import Breadcrumb from '@/src/components/Navigation/BreadCrumb'

import 'react-toastify/dist/ReactToastify.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/styles/navigations.css'
import '@/styles/App/app.css'
import './globals.css'

export const metadata: Metadata = {
	title: 'Next App',
	description: 'Created by Code Prodigies',
}

export default function RootLayout(props: any) {
	return (
		<html lang='en'>
			<body>
				<WrapperHandlerPublic />
				<NavBar />

				<main className='page-container'>
					<Breadcrumb />
					{props.children}
				</main>
				<ToastContainer />
			</body>
		</html>
	)
}
