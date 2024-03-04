import React, { useState } from 'react'
import InputTextBox from '@/components/InputTextBox'

const Page = () => {
	return (
		<>
			<h1>Dashboard</h1>
      <InputTextBox
        type='text'
        label='Name'
        value=''
        placeholder='Enter your name'
        handleChange={(value) => console.log(value)}
        handleBlur={() => console.log('blur')}
        handleFocus={() => console.log('focus')}
        />
		</>
	)
}

export default Page
