'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAccountStore } from '@/src/stores/user'
import { Formik, Form, FormikProps } from 'formik'
import { useRouter } from 'next/navigation'
import { getCookies, setCookie } from 'cookies-next'
import '@/styles/pages/login.css'

import LoginCredentials from '@/classes/LoginCredentials'
import Validations from '@/utilities/validationSchemas'
import instance from '@/services/httpService'
import API from '@/services/api'

import FormInputTextBox from '@/components/FormInputTextbox'
import InputCheckbox from '@/components/InputCheckbox'
import Routes from '@/services/routes'

const Page = () => {
	const [credentials, setCredentials] = useState(new LoginCredentials())
	const [isUserRemembered, setIsUserRemembered] = useState(false)
	const router = useRouter()
	const user = useAccountStore((state) => state.User)
	const [isLoading, setIsLoading] = useState(false)

	const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		console.log('Forgot password clicked')
	}

	const handleLogin = async (credentials: LoginCredentials) => {
		try {
			setIsLoading(true)
			const { data: authenticated } = await API.login(credentials)
			if (authenticated.payload) {
				toast.success('Logged in successfully')

				const JWTToken = authenticated.payload
				setCookie('at', JWTToken)
				instance.defaults.headers.common['Authorization'] = `Bearer ${JWTToken}`

				//route to dashboard
				router.push(Routes.InternalAppRoute)
			} else {
				toast.error(authenticated.message)
			}
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const routeToSignUp = () => {
		//route to sign up
		router.push('/signup')
	}

	const isMissingFields = (form: FormikProps<LoginCredentials>) => {
		return !form.isValid || form.isSubmitting || !form.values.username.length
	}
	return (
		<div className='Login'>
			<div className='container'>
				<h1 className='page-title'>MEDSOURCE</h1>

				<div className='form-container'>
					<h3>Log in</h3>
					<Formik
						initialValues={credentials}
						validationSchema={Validations.loginSchema}
						onSubmit={(values, { setSubmitting }) => {
							handleLogin(values)
							setSubmitting(false)
						}}>
						{(form) => (
							<Form className='min-h-96 flex flex-col gap-8 w-2/4 relative'>
								<FormInputTextBox
									label='Email Address'
									autofocused={true}
									name='username'
								/>
								<FormInputTextBox type='password' label='Password' name='password' />
								<div className='form-footer flex flex-col items-center justify-center gap-10'>
									<div className='login-options-container'>
										<InputCheckbox
											checked={isUserRemembered}
											label='Remember Me'
											onChange={() => setIsUserRemembered(!isUserRemembered)}
										/>
										<a className='clickable forgot-password' onClick={handleForgotPasswordClick}>
											Forgot Password?
										</a>
									</div>
									<button disabled={isMissingFields(form) || isLoading}>
										{isLoading ? <i className='fa-solid fa-spinner animate-spin' /> : 'Login'}
									</button>
									<span className='button-subtitle'>
										Don&apos;t have a password?&nbsp;
										<a className='clickable inline-link' onClick={routeToSignUp}>
											Sign up!
										</a>
									</span>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</div>
	)
}

export default Page
