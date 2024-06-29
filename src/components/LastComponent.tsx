'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/shared.css'

const LastComponent = () => {
	const route = useRouter()
	return (
		<section id='lastcomponent'>
			<p>Discover Quality Medical Supplies at Medsource.</p>
			<h2>Empowering Healthcare Excellence, One Supply at a Time</h2>
			<button className='transparent-button' onClick={() => route.push('/contact')}>
				Make A Request
			</button>
		</section>
	)
}

export default LastComponent
