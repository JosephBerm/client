import React from 'react'
import { Section } from '@/interfaces/Section'

function SectionPreviewer({ header, children, footer, cssClass, inLineStyle }: Section) {
	const getComponentClassName = () => {
		let className = 'SectionPreviewer'

		if (!cssClass) return className
		return `${className} ${cssClass}`
	}

	return (
		<section className={getComponentClassName()} style={inLineStyle}>
			<div className='section-header'>
				<h4 className='title'>{header.title}</h4>
				{header.action !== null && <div className='action'>{header.action}</div>}
			</div>
			<div className='section-body'>{children}</div>
			{footer && <div className='section-footer'>{footer}</div>}
		</section>
	)
}

export default SectionPreviewer
