import React from 'react'
import FirstComponent from '@/src/components/About/FirstComponent'
import BulletComponent from '@/src/components/About/BulletComponent'
import LastComponent from '@/src/components/LastComponent'

import '@/src/styles/About.css'

import Aboutus11 from '@/public/aboutus11.png'
import Aboutus22 from '@/public/aboutus22.png'
import Aboutus33 from '@/public/aboutus33.png'
import Aboutus44 from '@/public/aboutus44.png'
import Aboutus55 from '@/public/aboutus55.png'

const page = () => {

  const bullets = [
	{
	  Title: 'Our Mission',
	  Description: 'Our mission at Medsource Pro is simple yet powerful: to facilitate access to high-quality medical supplies and provide exceptional service that empowers healthcare professionals to deliver the best possible care to their patients. We believe that by doing so, we are contributing to a healthier and more prosperous world for all.',
	  Img: Aboutus11
	},
	{
		Title: 'Our Commitment to Quality',
		Description: 'At Medsource Pro, quality is our number one priority. We partner with leading manufacturers and suppliers in the industry to ensure that every product we offer meets the highest standards of safety and efficacy. From cutting-edge medical equipment to diagnostic supplies and laboratory material, each item in our catalog has been carefully selected to ensure its quality and reliability.',
		Img: Aboutus22
	},
	{
		Title: 'Personalized Customer Service',
		Description: 'We believe in the importance of building strong relationships with our customers. Our customer service team is here to provide you with the support you need at every step of the way, from product selection to the purchasing process and beyond. We strive to exceed our customers expectations and make their experience with us as smooth and satisfactory as possible.',
		Img: Aboutus33
	},
	{
		Title: 'Our Commitment to the Community',
		Description: 'At Medsource Pro, we also recognize the importance of positively contributing to our local and global communities. Through corporate social responsibility programs and partnerships with nonprofit organizations, we are committed to doing our part to improve the health and well-being of people around the world.',
		Img: Aboutus44
	},
	{
		Title: 'Join Us on Our Mission',
		Description: `We are honored to be your choice for all your medical supply needs. Whether you're a healthcare professional, a clinic, or a hospital, we look forward to serving you and being part of your continued success in healthcare.`,
		Img: Aboutus55
	},
  ]
  return (
    <div className='about-us-page'>
		<FirstComponent/>

		<div className='bullets-wrapper'>
			{bullets.map((bullet, index) => (
				<BulletComponent key={index} Title={bullet.Title} Description={bullet.Description} Img={bullet.Img}/>
			))}
		</div>

		<LastComponent/>
    </div>
  )
}

export default page