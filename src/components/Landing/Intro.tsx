'use client'

import React from 'react'
import Home from '@/classes/Home'
import Image from 'next/image'
import Redirect from '@/public/arrow redirect.svg'
import { useRouter } from 'next/navigation'

const Intro = () => {
	const route = useRouter()
	return (
		<div className='Intro'>
			<strong className='description'>{Home.HeroSection.description}</strong>
			<p>{Home.HeroSection.paragraph}</p>
			<div className='buttons-container'>
				<button id='first' onClick={() => route.push('/products')}>
					View Catalog
				</button>
				<button id='second' onClick={() => route.push('/about-us')}>
					Know more about us
					<i className='fa-solid fa-arrow-up' />
				</button>
			</div>
		</div>
	)
}

export default Intro
