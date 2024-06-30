'use client'

import React, { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
import Image from 'next/image'
import Home, { FAQ } from '@/classes/Home'
import classNames from 'classnames'

const variants = {
	open: {
		opacity: 1,
		height: 'auto',
		applyAtStart: { display: 'block' },
		delay: 20,
		applyAtEnd: { overflowY: 'auto' },
	},
	closed: { opacity: 0, height: 0, applyAtEnd: { display: 'none' } },
}

type FAQProps = {
	question: FAQ
}

const FAQBullet = ({ question: faq }: FAQProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const toggleCaret = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div className={classNames({ 'bullet-container': true, open: isOpen })}>
			<div className='faq-header' onClick={() => toggleCaret()}>
				<span>{faq.question}</span>
				<Image src='/caret.svg' alt='caret' width={16} height={10} className='caret' />
			</div>

			{isOpen ? (
				<div className='faq-bullet-content'>
					<p>{faq.answer}</p>
				</div>
			) : (
				<></>
			)}
		</div>
	)
}

export default FAQBullet
