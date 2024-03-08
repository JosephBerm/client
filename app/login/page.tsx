'use client'

import React, { useState } from 'react'

import { useAccountStore } from '@/src/stores/user'
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
	const router = useRouter()
	const user = useAccountStore((state) => state.User)

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
			console.log('authenticated', authenticated)
			if (authenticated.payload) {
				const JWTToken = authenticated.payload
				setCookie('at', JWTToken)
				instance.defaults.headers.common['Authorization'] = `Bearer ${JWTToken}`

				//route to dashboard
				router.push('/dashboard')
			} else {
				console.log(authenticated.message)
			}
		} catch (err) {
			console.log(err)
		} finally {
			setIsLoading(false)
		}
	}

	const routeToSignUp = () => {
		//route to sign up
		router.push('/signup')
	}

	return (
		<div className='Login'>
			<h2 className='page-title'>Login</h2>
			<form className='min-h-96 flex flex-col gap-8 w-2/4 relative' onSubmit={handleLogin}>
				<InputTextBox
					type='text'
					label='Email'
					value={credentials.username}
					handleChange={(value) => handleChange('username', value)}
					autofocused={true}
				/>

				<InputTextBox
					type='password'
					label='Password'
					value={credentials.password}
					handleChange={(value) => handleChange('password', value)}
				/>

				<div className='form-footer flex flex-col items-center justify-center gap-10'>
					<a className='clickable forgot-password mb-7' onClick={handleForgotPasswordClick}>
						Forgot Password?
					</a>
					<button type='submit' className='submit'>
						Login
					</button>

					<span className='button-subtitle'>
						Don&apos;t have a password?&nbsp;
						<a className='clickable inline-link' onClick={routeToSignUp}>
							Sign up!
						</a>
					</span>
				</div>
			</form>
		</div>
	)
}

export default Page
