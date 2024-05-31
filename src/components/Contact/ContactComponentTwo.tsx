import React from 'react'
import ContactInputComponent from '@/src/components/Contact/ContactInputComponent'
import ContactInputTextAreaComponent from '@/src/components/Contact/ContactInputTextAreaComponent'


const ContactComponentTwo = () => {
  return (
    <div className='component-two-container'>
        <h3>Contact Us</h3>
        
        <div className='component-contact-form-container'>
            <div className='flex gap-10 half-container'>
                <ContactInputComponent label={"Representative"}/>
                <ContactInputComponent label={"Phone"}/>
            </div>
            <ContactInputComponent label={"Email"}/>
            <ContactInputComponent label={"Health Center / Company"}/>
            <ContactInputTextAreaComponent label="Message" />

            <button>
                Send
            </button>
        </div>
    </div>
  )
}

export default ContactComponentTwo