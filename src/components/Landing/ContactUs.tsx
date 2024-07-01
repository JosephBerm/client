'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const ContactUs = () => {
	const route = useRouter()
	return (
		<section className='ContactUs '>
			<p>Discover Quality Medical Supplies at Medsource.</p>
			<h2 className='page-title gradiant-text-brand'>
				<span>Empowering Healthcare Excellence,</span>
				<br /> One Supply at a Time
			</h2>
			<button onClick={() => route.push('/contact')}>Contact Us</button>
		</section>
	)
}

export default ContactUs
