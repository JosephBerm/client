'use client'

import React from 'react'
import Image from 'next/image'
import DoctorsImage from '@/public/LandingImage1.png'
import Redirect from '@/public/arrow redirect.svg'
import { useRouter } from 'next/navigation'

const FirstComponent = () => {
    const route = useRouter()
    return (
        <div className='firstcomponent'>
            <div className="image-container">
                <Image 
                    priority 
                    src={DoctorsImage} 
                    alt='Doctors Image' 
                    width={855} 
                    height={950} 
                />
            </div>
            <div className="text-container">
                <div className="header-container">
                    <h2>Welcome to</h2>
                    <h1 className="responsive-header">Medsource!</h1>
                </div>
                <p id="UnderTitle">Quality medical supply solutions within reach.</p>
                <p>Request a quote by consulting our extensive catalog of medical products through a quick and easy process.</p>
                <div className='buttons-container'>
                    <button id="first" onClick={() => route.push('/products')}>View Catalog</button>
                    <button id="second" onClick={() => route.push('/about-us')}>
                        Know more about us
                        <Image src={Redirect} alt='Redirect' width={15} height={15}/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FirstComponent