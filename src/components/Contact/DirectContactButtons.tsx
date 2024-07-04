import React from 'react'

type ContactOption = {
	icon: string
	text: string
	link: string
}

const DirectContactButtons = () => {
	// for now, this component is only rendered if the user is logged in. However, this component will have many levels to it.
	//If you have an order currenty in process, you'll have access to a direct line to a representative at any time.
	// If you've spent over $10,000 in the past year, you'll have access to a direct line to a representative at any time.
	// If you've spent over $50,000 in the past year, you'll have access to a direct line to a representative and a direct line to a manager. (in the future, when the company scales and has multiple employees working under Mibell).

	const contactOptions: ContactOption[] = [
		{
			icon: 'fa-brands fa-square-instagram',
			text: 'Instagram',
			link: 'https://www.instagram.com/medsourcepro/',
		},
		{
			icon: 'fa-brands fa-facebook',
			text: 'Facebook',
			link: 'https://www.facebook.com/MedSourcePro/',
		},
		{
			icon: 'fa-brands fa-x-twitter',
			text: 'Twitter',
			link: 'https://twitter.com/MedSourcePro',
		},
		{
			icon: 'fa-brands fa-linkedin',
			text: 'LinkedIn',
			link: 'https://www.linkedin.com/company/MedSourcePro',
		},
		{
			icon: 'fa-solid fa-phone',
			text: 'Phone',
			link: 'tel:1-800-000-0000',
		},
		{
			icon: 'fa-solid fa-envelope',
			text: 'Email',
			link: 'mailto:joseph@medsourcepro.com',
		},
	]

	return (
		<div className='DirectContactButtons'>
			<h3>Direct Contact</h3>

			<div className='button-container'>
				{contactOptions.map((option, index) => (
					<a key={index} className='contact-option' target='_blank' href={option.link}>
						<i className={option.icon} />
					</a>
				))}
			</div>
		</div>
	)
}

export default DirectContactButtons
