'use client'

import React, { useState } from 'react'
import InputTextBox from '@/src/components/InputTextBox'
import '@/styles/login.css'

const Page = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleEmailChange = (value: string) => {
		setEmail(value)
	}

	const handlePasswordChange = (value: string) => {
		setPassword(value)
	}

	const handleBlur = () => {
		console.log('blurred')
	}

	const handleFocus = () => {
		// Handle focus event if needed
		console.log('focused')
	}

	const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		console.log('Forgot password clicked')
	}

	return (
		<div className='Login flex flex-col items-center justify-between absolute left-2/4 transform -translate-x-1/2 -translate-y-1/2'>
			<h2 className='page-title'>Login</h2>
			<fieldset className='min-h-96 flex flex-col gap-8 w-2/4 relative'>
				<InputTextBox
					type='text'
					label='Email'
					value={email}
					handleChange={handleEmailChange}
					handleBlur={handleBlur}
					handleFocus={handleFocus}
					autofocused={true}
				/>

				<InputTextBox
					type='password'
					label='Password'
					value={password}
					handleChange={handlePasswordChange}
					handleBlur={handleBlur}
					handleFocus={handleFocus}
				/>

				<div className='form-footer mt-10 flex flex-col items-center justify-center gap-10'>
					<button className='submit'>Login</button>

					<a href='#' className='forgot-password' onClick={handleForgotPasswordClick}>
						Forgot Password?
					</a>
				</div>
			</fieldset>
		</div>
	)
}

export default Page
