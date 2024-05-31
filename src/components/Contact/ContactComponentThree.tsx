import React from 'react'

const ContactComponentThree = () => {
return (
    <div className='component-three-container mb-10'>
        <h3>Direct Contact</h3>

        <div className='direct-contact-container'>
            <div className='contact-container'>
                <i className="fa-solid fa-location-dot" style={{color:'white'}}></i>
            </div>

            <div className='contact-container'>
                <i className="fa-solid fa-phone" style={{color:'white'}}></i>
            </div>

            <div className='contact-container'>
                <i className="fa-solid fa-envelope" style={{color:'white'}}></i>
            </div>
            
        </div>
    </div>
)
}

export default ContactComponentThree