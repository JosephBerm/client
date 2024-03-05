'use client'

import React, { useState } from 'react'

import LoginCredentials from '@/classes/LoginCredentials'
import instance from '@/services/httpService'
import API from '@/services/api'

import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'

import InputTextBox from '@/components/InputTextBox'
import '@/styles/login.css'

const Page = () => {
	const [credentials, setCredentials] = useState(new LoginCredentials())
	const [isLoading, setIsLoading] = useState(false)
	const route = useRouter()

	const handleChange = (key: keyof LoginCredentials, value: string) => {
		setCredentials((prevCredentials) => ({
			...prevCredentials,
			[key]: value,
		}))
	}

	const handleBlur = () => {
		console.log('blurred')
	}

	const handleFocus = () => {
		console.log('focused')
	}

	const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		console.log('Forgot password clicked')
	}

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			setIsLoading(true)
			const { data: authenticated } = await API.login(credentials)

			if (authenticated) {
				const JWTToken = authenticated.payload
				setCookie('at', JWTToken)
				instance.defaults.headers.common['Authorization'] = `Bearer ${JWTToken}`
				route.push('/dashboard')
			}
		} catch (err) {
			console.log(err)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='Login flex flex-col items-center justify-between absolute left-2/4 transform -translate-x-1/2 -translate-y-1/2'>
			<h2 className='page-title'>Login</h2>
			<form className='min-h-96 flex flex-col gap-8 w-2/4 relative' onSubmit={handleLogin}>
				<InputTextBox
					type='text'
					label='Email'
					value={credentials.username}
					handleChange={(value) => handleChange('username', value)}
					handleBlur={handleBlur}
					handleFocus={handleFocus}
					autofocused={true}
				/>

				<InputTextBox
					type='password'
					label='Password'
					value={credentials.password}
					handleChange={(value) => handleChange('password', value)}
					handleBlur={handleBlur}
					handleFocus={handleFocus}
				/>

				<div className='form-footer mt-10 flex flex-col items-center justify-center gap-10'>
					<button type='submit' className='submit'>
						Login
					</button>

					<a href='#' className='forgot-password' onClick={handleForgotPasswordClick}>
						Forgot Password?
					</a>
				</div>
			</form>
		</div>
	)
}

export default Page
