'use client'

import React from 'react'
import Image from 'next/image'
import Redirect from '@/public/arrow redirect.svg'
import { useRouter } from 'next/navigation'

const Intro = () => {
	const route = useRouter()
	return (
		<div className='Intro'>
			<strong className='description'>Quality medical supply solutions within reach.</strong>
			<p>
				Request a quote by consulting our extensive catalog of medical products through a quick and easy
				process.
			</p>
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
