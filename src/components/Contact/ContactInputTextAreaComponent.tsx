import React from 'react'

const ContactInputTextAreaComponent = ({label}: {label: string}) => {
  return (
    <div className='contact-input-container'>
        <label >{label}</label>
        <textarea rows={8} name={label}></textarea>
    </div>
  )
}

export default ContactInputTextAreaComponent