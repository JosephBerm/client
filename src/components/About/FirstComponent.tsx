import React from 'react'
import Image from 'next/image'
import AboutImage from '@/public/aboutus.png'
import Logo from '@/public/Logo.png'

const FirstComponent = () => {
  return (
    <div className ="about-us-first-component">
        <div  style={{position: 'absolute', zIndex: -1}}>
            <Image src={AboutImage} alt="Medic Image" priority/>
        </div>
        <Image src={Logo} alt="Medsource Logo" priority/>
        <h1>About Us</h1>
        <p>
        At Medsource Pro, we take pride in offering comprehensive solutions in medical supplies for healthcare professionals, clinics, and hospitals. With an unwavering commitment to quality and exceptional service, we strive to be your trusted partner in the healthcare industry.
        </p>
    </div>
  )
}

export default FirstComponent