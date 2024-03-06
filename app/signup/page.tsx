'use client'

import React, { useState } from 'react'

import SignupForm from '@/classes/SignupForm'
import instance from '@/services/httpService'
import API from '@/services/api'

import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'

import InputTextBox from '@/components/InputTextBox'
import '@/styles/login.css'

const Page = () => {
	const [form, setForm] = useState(new SignupForm())
	const [passwordConfirmation, setPasswordConfirmation] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleChange = (key: keyof SignupForm, value: string) => {
		setForm((prevCredentials) => ({
			...prevCredentials,
			[key]: value,
		}))
	}

	const handlePasswordConfirmation = (value: string) => {
		setPasswordConfirmation(value)
	}

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			setIsLoading(true)
			const { data: authenticated } = await API.signup(form)
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

	const routeToLogin = () => {
		//route to sign up
		router.push('/login')
	}

	return (
		<div className='Signup'>
			<h2 className='page-title'>Sign up</h2>

			<form className='min-h-96 flex flex-col w-full relative' onSubmit={handleLogin}>
				<div className='two-sided'>
					<InputTextBox
						type='text'
						label='Username'
						value={form.username}
						handleChange={(value) => handleChange('username', value)}
						autofocused={true}
					/>
					<InputTextBox
						type='text'
						label='Email'
						value={form.email}
						handleChange={(value) => handleChange('email', value)}
					/>
				</div>
				<div className='two-sided'>
					<InputTextBox
						type='password'
						label='Password'
						value={form.password}
						handleChange={(value) => handleChange('password', value)}
					/>

					<InputTextBox
						type='password'
						label='Confirm Password'
						value={passwordConfirmation}
						handleChange={(value) => handlePasswordConfirmation(value)}
					/>
				</div>

				<div className='two-sided'>
					<InputTextBox
						type='text'
						label='First Name'
						value={form.firstName}
						handleChange={(value) => handleChange('firstName', value)}
					/>

					<InputTextBox
						type='text'
						label='Last Name'
						value={form.lastName}
						handleChange={(value) => handleChange('lastName', value)}
					/>
				</div>

				{/* <InputTextBox
					type='text'
					label='Date of Birth'
					value={form.dateOfBirth}
					handleChange={(value) => handleChange('dateOfBirth', value)}
				/> */}

				<div className='form-footer flex flex-col items-center justify-center gap-10'>
					<button type='submit' className='submit'>
						Login
					</button>

					<span className='button-subtitle'>
						Already have an account?&nbsp;
						<a className='inline-link clickable' onClick={routeToLogin}>
							Login!
						</a>
					</span>
				</div>
			</form>
		</div>
	)
}

export default Page
