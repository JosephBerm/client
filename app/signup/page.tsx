'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { Formik, Form } from 'formik'
import Validations from '@/utilities/validationSchemas'
import SignupForm from '@/classes/SignupForm'
import instance from '@/services/httpService'
import API from '@/services/api'
import '@/styles/login.css'

import FormInputTextBox from '@/components/FormInputTextbox'

const Page = () => {
	const [form, setForm] = useState(new SignupForm())
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleLogin = async (values: SignupForm) => {
		try {
			setIsLoading(true)
			const { data: authenticated } = await API.signup(values)
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
			<Formik
				initialValues={form}
				validationSchema={Validations.signup}
				onSubmit={(values, { setSubmitting }) => {
					handleLogin(values)
					setSubmitting(false)
				}}>
				{({ isSubmitting }) => (
					<Form className='min-h-96 flex flex-col w-full relative'>
						<div className='two-sided'>
							<FormInputTextBox label='Username' name='username' />

							<FormInputTextBox label='Email' name='email' />
						</div>
						<div className='two-sided'>
							<FormInputTextBox label='Password' name='password' type='password' />

							<FormInputTextBox label='Confirm Password' name='confirmPassword' type='password' />
						</div>

						<div className='two-sided'>
							<FormInputTextBox label='Password' name='firstName' />

							<FormInputTextBox label='Password' name='lastName' />
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
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default Page
