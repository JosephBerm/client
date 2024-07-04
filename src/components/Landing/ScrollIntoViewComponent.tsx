'use client'

import React, { useEffect } from 'react'

function ScrollIntoViewComponent() {
	const scrollToSection = (sectionId: string) => {
		const section = document.getElementById(sectionId)
		if (section) {
			section.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}

	useEffect(() => {
		const hash = window.location.hash
		if (hash) {
			const sectionId = hash.substring(1) // Remove the '#' character
			scrollToSection(sectionId)
		}
	}, [])
	return <div className='ScrollIntoViewComponent'></div>
}

export default ScrollIntoViewComponent
