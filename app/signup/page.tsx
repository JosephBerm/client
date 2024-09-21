'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { FormikProvider, useFormik, Form } from 'formik'
import Validations from '@/utilities/validationSchemas'
import { RegisterModel } from '@/classes/User'
import instance from '@/services/httpService'
import API from '@/services/api'
import Name from '@/classes/common/Name'
import '@/styles/pages/login.css'

import FormInputTextBox from '@/components/FormInputTextbox'
import InputTextBox from '@/components/InputTextBox'
import IsBusyLoading from '@/components/isBusyLoading'
import { toast } from 'react-toastify'
import Routes from '@/services/routes'

const Page = () => {
	const formik = useFormik({
		initialValues: new RegisterModel(),
		onSubmit: (values) => {
			handleLogin(values)
		},
	})
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleLogin = async (values: RegisterModel) => {
		try {
			setIsLoading(true)
			const { data: authenticated } = await API.signup(values)
			if (authenticated.payload) {
				const JWTToken = authenticated.payload
				setCookie('at', JWTToken)
				instance.defaults.headers.common['Authorization'] = `Bearer ${JWTToken}`

				if (authenticated.statusCode == 200) {
					toast.success(authenticated.message ?? 'Account created successfully')
					//route to dashboard
					router.push(Routes.InternalAppRoute)
				} else {
					console.error(authenticated.message)
					toast.error(authenticated.message ?? 'Account creation failed')
				}
				//route to dashboard
			} else {
				console.error(authenticated.message)
				toast.error(authenticated.message ?? 'Account creation failed')
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const updateName = (key: keyof Name, newValue: string) => {
		formik.setFieldValue(`name.${key}`, newValue)
	}

	const routeToLogin = () => {
		//route to sign up
		//router.push('/customer-login')
	}

	return (
		<div className='Signup'>
			<div className='container'>
				<h1 className='page-title'>MEDSOURCE</h1>
				<IsBusyLoading isBusy={isLoading} />
				{!isLoading && (
					<div className='form-container'>
						<h3>Sign up</h3>
						<FormikProvider value={formik}>
							<Form onSubmit={formik.handleSubmit} className='min-h-96 flex flex-col w-full relative'>
								<FormInputTextBox label='Username' name='username' />

								<FormInputTextBox label='Email' name='email' />

								<FormInputTextBox label='Password' name='password' type='password' />

								<FormInputTextBox label='Confirm Password' name='confirmPassword' type='password' />

								<InputTextBox
									label='First Name'
									type='text'
									handleChange={(e) => updateName('first', e.currentTarget.value)}
									value={formik.values.name.first}
									className='faded-bg'
								/>
								<InputTextBox
									label='Last Name'
									type='text'
									handleChange={(e) => updateName('last', e.currentTarget.value)}
									value={formik.values.name.last}
									className='faded-bg'
								/>

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
						</FormikProvider>
					</div>
				)}
			</div>
		</div>
	)
}

export default Page
