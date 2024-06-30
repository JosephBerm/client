import Home from '@/classes/Home'
import React from 'react'

const SalesPitch = () => {
	return (
		<section className='SalesPitch'>
			<div className='section-container'>
				<h2 className='section-title'>
					Because <br />
					<strong>We Are Different</strong>
				</h2>
				<p className='description'>{Home.SalesPitch.description}</p>
				<div className='box-wrapper'>
					{Home.SalesPitch.companyQualities.map((quality, index) => (
						<div key={index} className='box-container'>
							<h3>{quality.title}</h3>
							<p>{quality.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default SalesPitch
