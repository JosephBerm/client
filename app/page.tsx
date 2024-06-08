import Link from 'next/link'
import "@/styles/Landing.css"

import FirstComponent from '@/src/components/Landing/FirstComponent'
import SecondComponent from '@/src/components/Landing/SecondComponent'
export default function Home() {
	return (
		<div className='landing-page'>
			<FirstComponent/>
			<SecondComponent/>
		</div>
	)
}
