'use client'

import '@/styles/contact.css'
import Link from 'next/link'
import API from '@/services/api'
import classNames from 'classnames'
import React, { useState } from 'react'
import Routes from '@/services/routes'
import { useRouter } from 'next/navigation'
import { FormikProvider, useFormik, Form } from 'formik'

import Name from '@/classes/common/Name'
import { useAccountStore } from '@/src/stores/user'
import ContactRequest from '@/classes/ContactRequest'

import InputTextBox from '@/components/InputTextBox'
import FormInputTextBox from '@/components/FormInputTextbox'
import DirectContactButtons from '@/components/Contact/DirectContactButtons'

const Page = () => {
	const router = useRouter()
	const formik = useFormik({
		initialValues: new ContactRequest(),
		onSubmit: (values) => {
			submitContactRequest(values)
		},
	})
	const [submitted, setSubmitted] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const loggedIn = useAccountStore((state) => state.LoggedIn)
	const submitContactRequest = async (values: ContactRequest) => {
		try {
			setIsLoading(true)
			const response = await API.Public.sendContactRequest(values)
			if (response.data.statusCode == 200) {
				setSubmitted(true)
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
	const goToDashBoard = () => {
		router.push(Routes.Signup.location)
	}
	return (
		<div className='ContactUs'>
			<h2 className='page-title'>
				<strong>Have Questions Or Need Assistance?</strong>
			</h2>
			{loggedIn ? (
				<p className='description'>
					Check out the
					<Link className='inline-link ml-2' href={'/#faq'}>
						FAQ&apos;s
					</Link>
					!
					<br />
					Need to speak with a representative? As a valued member, you have access to a direct line to a
					MedSource Pro representative at any time.
				</p>
			) : (
				<p className='description'>
					Check out the
					<Link className='inline-link ml-2' href={'/#faq'}>
						FAQ&apos;s
					</Link>
					!
					<br />
					Connect with a MedSource Pro Representative At Any Time By Becoming a Valued Member!
				</p>
			)}
			<div className='page-body'>
				<div className={classNames({ 'contact-request': true, 'logged-in': loggedIn })}>
					{!submitted && (
						<FormikProvider value={formik}>
							<h2>Contact Us</h2>
							<h3>Who&apos;s Requesting Contact?</h3>
							<p className='subtitle my-2 text-center'>
								Complete the form below and a staff member will contact you within 24 hours.
							</p>
							<Form onSubmit={formik.handleSubmit} className='FormContainer'>
								<div className='gapped-fields'>
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
								</div>
								<FormInputTextBox
									label='Email Address'
									name='emailAddress'
									value={formik.values.emailAddress}
									className='faded-bg'
								/>
								<div className='gapped-fields'>
									<FormInputTextBox
										label='Phone Number'
										name='phoneNumber'
										value={formik.values.phoneNumber}
										className='faded-bg'
									/>
									<FormInputTextBox
										label='Company Name'
										name='companyName'
										value={formik.values.companyName}
										className='faded-bg'
									/>
								</div>
								<FormInputTextBox
									type='textarea'
									rows={6}
									label='Your Request Message:'
									name='description'
									value={formik.values.message}
									className='faded-bg'
								/>
								<button
									className='submit-btn'
									onClick={() => formik.submitForm()}
									title='Email Domain Required To Submit'>
									Place Request
								</button>
							</Form>
						</FormikProvider>
					)}
					{submitted && (
						<div className='message-container'>
							<div className='message-icon'>
								<i className='fa-solid fa-envelope-circle-check' />
							</div>
							<h3>Contact Request Sent!</h3>
							<p className='message'>
								Thank you for reaching out to us. A staff member will contact you.
							</p>
							{!loggedIn && (
								<>
									<p className='sign-up'>
										Become a valued member and get a direct line to our team. Sign up today!
									</p>
									<div className='button-container'>
										<button onClick={() => goToDashBoard()}>Create Account</button>
									</div>
								</>
							)}
						</div>
					)}
				</div>

				{loggedIn ? <DirectContactButtons /> : <></>}
			</div>
		</div>
	)
}

export default Page
