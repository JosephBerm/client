'use client'

import React, { useState } from 'react'
import Home from '@/classes/Home'
import FAQBullet from './FAQBullet'

const FAQ = () => {
	const [questions, setQuestions] = useState(Home.FAQs.questions)

	return (
		<section className='FAQ'>
			<div className='section-container'>
				<h2 className='section-title'>
					<strong>FAQs</strong>
				</h2>
				<p className='description'>
					<strong>{Home.FAQs.description}</strong>
				</p>
				<div className='bullets-holder'>
					{questions.map((question, index) => (
						<FAQBullet key={index} question={question} />
					))}
				</div>
			</div>
		</section>
	)
}

export default FAQ
