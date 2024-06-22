import Link from 'next/link'
import "@/styles/Landing.css"

import FirstComponent from '@/src/components/Landing/FirstComponent'
import SecondComponent from '@/src/components/Landing/SecondComponent'
import ThirdComponent from '@/src/components/Landing/ThirdComponent'
import Products from '@/src/components/Landing/Products'
import LastComponent from '@/src/components/LastComponent'

import FAQ from '@/src/components/Landing/FAQ'

export default function Home() {
	return (
		<div className='home-page'>
			<FirstComponent	/>
			<SecondComponent/>
			<ThirdComponent	/>
			<Products/>
			<FAQ/>
			<LastComponent/>
			
		</div>
	)
}
