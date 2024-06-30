'use client'
import React, { useEffect, useRef } from 'react'
import '@/styles/InfiniteScroll.css'
import Home from '@/classes/Home'

const ProductsCarousel = () => {
	const scrollerRef = useRef(null)

	useEffect(() => {
		const scroller = scrollerRef.current
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			addAnimation(scroller)
		}
	}, [])

	const addAnimation = (scroller) => {
		// Add data-animated attribute
		scroller.setAttribute('data-animated', true)

		const scrollerInner = scroller.querySelector('.scroller__inner')
		const scrollerContent = Array.from(scrollerInner.children)

		// Duplicate each item
		scrollerContent.forEach((item) => {
			const duplicatedItem = item.cloneNode(true)
			duplicatedItem.setAttribute('aria-hidden', true)
			scrollerInner.appendChild(duplicatedItem)
		})
	}

	return (
		<section className='ProductsCarousel'>
			<div className='scroller' ref={scrollerRef} data-speed='slow' data-direction='left'>
				<div className='scroller__inner'>
					{Home.CarouselProducts.map((product, index) => (
						<h1 className='scroller__item' key={index}>
							{product}
						</h1>
					))}
				</div>
			</div>
		</section>
	)
}

export default ProductsCarousel
