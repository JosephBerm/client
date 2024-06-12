import Link from 'next/link'
import "@/styles/Landing.css"

import FirstComponent from '@/src/components/Landing/FirstComponent'
import SecondComponent from '@/src/components/Landing/SecondComponent'
import ThirdComponent from '@/src/components/Landing/ThirdComponent'
import LastComponent from '@/src/components/LastComponent'

import FAQ from '@/src/components/Landing/FAQ'

export default function Home() {
	return (
		<div className='landing-page'>
			<FirstComponent	/>
			<SecondComponent/>
			<ThirdComponent	/>

			<FAQ/>
			<LastComponent/>
			
		</div>
	)
}
