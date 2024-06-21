'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { Formik, Form } from 'formik'
import Validations from '@/utilities/validationSchemas'
import { SignupForm } from '@/classes/User'
import instance from '@/services/httpService'
import API from '@/services/api'
import '@/styles/login.css'

import FormInputTextBox from '@/components/FormInputTextbox'
import IsBusyLoading from '@/components/isBusyLoading'

const Page = () => {
	const [form, setForm] = useState(new SignupForm())
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleLogin = async (values: SignupForm) => {
		try {
			setIsLoading(true)
			const { data: authenticated } = await API.signup(values)
			if (authenticated.payload) {
				const JWTToken = authenticated.payload
				setCookie('at', JWTToken)
				instance.defaults.headers.common['Authorization'] = `Bearer ${JWTToken}`

				//route to dashboard
				router.push('/dashboard')
			} else {
				console.error(authenticated.message)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const routeToLogin = () => {
		//route to sign up
		router.push('/customer-login')
	}

		return (
			<div className='Signup'>
				<div className='container'>
					<h1 className='page-title'>MEDSOURCE</h1>
					<IsBusyLoading isBusy={isLoading} />
					{!isLoading && (
						<div className='form-container'>
							<h3>Sign up</h3>
							<Formik
								initialValues={form}
								validationSchema={Validations.signupSchema}
								onSubmit={(values, { setSubmitting }) => {
									handleLogin(values)
									setSubmitting(false)
								}}>
								{({ isSubmitting }) => (
									<Form className='min-h-96 flex flex-col w-full relative'>
										<FormInputTextBox<SignupForm> label='Username' name='username' />

										<FormInputTextBox<SignupForm> label='Email' name='email' />

										<FormInputTextBox<SignupForm>
											label='Password'
											name='password'
											type='password'
										/>

										<FormInputTextBox
											label='Confirm Password'
											name='confirmPassword'
											type='password'
										/>

										<FormInputTextBox<SignupForm> label='First Name' name='firstName' />

										<FormInputTextBox<SignupForm> label='Last Name' name='lastName' />

										<div className='form-footer flex flex-col items-center justify-center gap-10'>
											<button>Create Account</button>
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
					)}
				</div>
			</div>
		)
}

export default Page
