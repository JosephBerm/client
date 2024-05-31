import '@/src/styles/contact.css'

import React from 'react'
import ContactComponentOne from '@/src/components/Contact/ContactComponentOne'
import ContactComponentTwo from '@/src/components/Contact/ContactComponentTwo'
import ContactComponentThree from '@/src/components/Contact/ContactComponentThree'

const page = () => {
  return (
    <div className='contact-page-container'>
        <ContactComponentOne />
        <div className='contact-page-break'>
            <ContactComponentTwo />
            <ContactComponentThree />
        </div>
    </div>
  )
}

export default page