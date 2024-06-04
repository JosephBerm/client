import React from 'react'
import Image from 'next/image'

type props  = {
    Title: string,
    Description: string,
    Img: any,
}

const BulletComponent = ({Title, Description, Img}: props) => {
    return (
        <div className='bullet-component'>
            <h3 className='mb-10'>{Title}</h3>
            <p>{Description}</p>

            <div className="bullet-image">
                <Image priority src={Img} alt="doctor-image"/>
            </div>
        </div>
    )
}

export default BulletComponent