'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import '@/styles/pages/profile.css'
import API from '@/services/api'
import User from '@/classes/User'
import Name from '@/classes/common/Name'
import Address from '@/classes/common/Address'
import { useAccountStore } from '@/src/stores/user'
import UserInfoBasic from '@/components/Settings/UserInfoBasic'
import UserInfoShipping from '@/components/Settings/UserInfoShipping'
import UserInfoPrivacy from '@/components/Settings/UserInfoPrivacy'
import UserInfoBilling from '@/components/Settings/UserInfoBilling'
import { FormikProvider, useFormik, Form, Formik } from 'formik'
import InputTextBox from '@/components/InputTextBox'
import FormInputTextBox from '@/components/FormInputTextbox'
import ProfilePicture from '@/components/ProfilePicture'

const Page = () => {
	const { User: UserFromStore } = useAccountStore((state) => state)

	const [isLoading, setIsLoading] = useState(false)
	const formik = useFormik({
		initialValues: UserFromStore,
		onSubmit: (values) => {
			handleSubmit(values)
		},
	})

	// This will ensure that if userfromStore is loaded after the component is mounted, the formik values will be updated.
	useEffect(() => {
		formik.setValues(UserFromStore)
	}, [UserFromStore])

	const handleSubmit = async (UserData: User) => {
		try {
			
			UserData.notifications = [] 	// Prevents BE validation error. IF lets will fail to save because notifications expects a customer.
			//UserData.customer = null

			UserFromStore.role = parseInt(UserFromStore.role as any)
			UserFromStore.customerId = parseInt(UserFromStore.customerId as any)

			if (isNaN(UserFromStore.customerId)) UserFromStore.customerId = -99
			setIsLoading(true)
			formik.values.notifications = [] // clear notifications to pass BE validation.
			const { data } = await API.Accounts.update<Boolean>(formik.values)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const updateName = (key: keyof Name, newValue: string) => {
		formik.setFieldValue(`name.${key}`, newValue)
	}

	const updateAddress = (key: keyof Address, newValue: string) => {
		formik.setFieldValue(`transitDetails.${key}`, newValue)
	}

	const updateEmailAddress = (newValue: string) => {
		formik.setFieldValue('email', newValue)
	}

	return (
		<div className='Profile page-container'>
			<h2 className='page-title'>Profile Settings</h2>

			<ProfilePicture />
			{!isLoading && (
				<FormikProvider value={formik}>
					<h3>Basic Information</h3>

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
						<InputTextBox
						label='Email Address'
						type='text'
						value={formik.values.email}
						handleChange={(e) => updateEmailAddress( e.currentTarget.value)}
							className='faded-bg'
						/>

						{formik.values.customer && (
							<div className='customer-container mt-10'>
								<h2>Shipping Information</h2>
								<div className='address-container'>
									<InputTextBox
										label='Country'
										type='text'
										handleChange={(e) => updateAddress('country', e.currentTarget.value)}
										value={formik.values.customer.shippingAddress.country}
										className='faded-bg'
									/>
									<div className='gapped-fields'>
										<InputTextBox
											label='City'
											type='text'
											handleChange={(e) => updateAddress('city', e.currentTarget.value)}
											value={formik.values.customer.shippingAddress.city}
											className='faded-bg'
										/>
										<InputTextBox
											label='State'
											type='text'
											handleChange={(e) => updateAddress('state', e.currentTarget.value)}
											value={formik.values.customer.shippingAddress.state}
											className='faded-bg'
										/>
									</div>
									<InputTextBox
										label='Zip Code'
										type='text'
										handleChange={(e) => updateAddress('zipCode', e.currentTarget.value)}
										value={formik.values.customer.shippingAddress.zipCode}
										className='faded-bg'
									/>
								</div>
								<div className='mt-10'>
									<h2>Billing Information</h2>
									<div className='address-container'>
										<InputTextBox
											label='Country'
											type='text'
											handleChange={(e) => updateAddress('country', e.currentTarget.value)}
											value={formik.values.customer.billingAddress.country}
											className='faded-bg'
										/>
										<div className='gapped-fields'>
											<InputTextBox
												label='City'
												type='text'
												handleChange={(e) => updateAddress('city', e.currentTarget.value)}
												value={formik.values.customer.billingAddress.city}
												className='faded-bg'
											/>
											<InputTextBox
												label='State'
												type='text'
												handleChange={(e) => updateAddress('state', e.currentTarget.value)}
												value={formik.values.customer.billingAddress.state}
												className='faded-bg'
											/>
										</div>
										<InputTextBox
											label='Zip Code'
											type='text'
											handleChange={(e) => updateAddress('zipCode', e.currentTarget.value)}
											value={formik.values.customer.billingAddress.zipCode}
											className='faded-bg'
										/>
									</div>
								</div>
							</div>
						)}
					</Form>
				</FormikProvider>
			)}

			{/* <UserInfoBasic />
			<UserInfoShipping />
			<UserInfoBilling /> */}

			<button className='btn btn-primary mt-10' onClick={() => handleSubmit(UserFromStore)} disabled={isLoading}>
				{isLoading ? 'Loading...' : 'Save Changes'}
			</button>
			<UserInfoPrivacy />
		</div>
	)
}

export default Page
