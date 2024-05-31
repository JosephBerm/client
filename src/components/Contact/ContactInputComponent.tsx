import React from 'react'

const ContactInputComponent = ({label}: {label: string}) => {
  return (
    <div className='contact-input-container'>
        <label >{label}</label>
        <input name={label}></input>
    </div>
  )
}

export default ContactInputComponent