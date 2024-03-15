import type { Metadata } from 'next'
import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import NavBar from '@/components/NavBar'
import WrapperHandlerPublic from '@/components/WrapperHandlerPublic'

export const metadata: Metadata = {
	title: 'Create Next App',
	description: 'Generated by create next app',
}

export default function RootLayout(props: any) {

	return (
		<html lang='en'>
			<body>
				<WrapperHandlerPublic/>
				<NavBar />
				{props.children}
				<ToastContainer />
			</body>
		</html>
	)
}
