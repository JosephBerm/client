'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import '@/styles/pages/profile.css'
import API from '@/services/api'
import User from '@/classes/User'
import Name from '@/classes/common/Name'
import Address from '@/classes/common/Address'
import { useAccountStore } from '@/src/stores/user'
import { FormikProvider, useFormik, Form, Formik } from 'formik'
import InputTextBox from '@/components/InputTextBox'
import FormInputTextBox from '@/components/FormInputTextbox'
import ProfilePicture from '@/components/ProfilePicture'
import ChangePasswordForm from '@/components/Settings/ChangePasswordForm'
import InputCheckbox from '@/src/components/InputCheckbox'

const Page = () => {
	const { User: UserFromStore } = useAccountStore((state) => state)
	const formik = useFormik({
		initialValues: UserFromStore,
		onSubmit: (values) => {
			handleSubmit(values)
		},
	})
	const [isLoading, setIsLoading] = useState(false)
	const [isBillingTheSameAsShipping, setIsBillingTheSameAsShipping] = useState(isShippingTheSameAsBilling())

	// This will ensure that if userfromStore is loaded after the component is mounted, the formik values will be updated.
	useEffect(() => {
		formik.setValues(UserFromStore)
	}, [UserFromStore])

	const handleSubmit = async (UserData: User) => {
		try {
			UserData.notifications = [] // Prevents BE validation error. IF lets will fail to save because notifications expects a customer.
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
	function isShippingTheSameAsBilling(): boolean {
		return (
			formik.values.customer?.shippingAddress?.addressOne ===
				formik.values.customer?.billingAddress?.addressOne &&
			formik.values.customer?.shippingAddress?.city === formik.values.customer?.billingAddress?.city &&
			formik.values.customer?.shippingAddress?.state === formik.values.customer?.billingAddress?.state &&
			formik.values.customer?.shippingAddress?.zipCode === formik.values.customer?.billingAddress?.zipCode &&
			formik.values.customer?.shippingAddress?.country === formik.values.customer?.billingAddress?.country
		)
	}

	const setBillingInformationSameAsShipping = () => {
		if (!formik.values.customer?.shippingAddress) return

		if (!isBillingTheSameAsShipping) {
			Address.getKeys().forEach((key) => {
				formik.setFieldValue(`customer.billingAddress.${key}`, formik.values.customer?.shippingAddress[key])
			})
		} else {
			Address.getKeys().forEach((key) => {
				formik.setFieldValue(`customer.billingAddress.${key}`, '')
			})
		}

		setIsBillingTheSameAsShipping(!isBillingTheSameAsShipping)
	}

	const updateName = (key: keyof Name, newValue: string) => {
		formik.setFieldValue(`name.${key}`, newValue)
	}

	const updateShippingAddress = (key: keyof Address, newValue: string) => {
		formik.setFieldValue(`customer.shippingAddress.${key}`, newValue)
	}
	const updateBillingAddress = (key: keyof Address, newValue: string) => {
		formik.setFieldValue(`customer.billingAddress.${key}`, newValue)
	}

	const updateEmailAddress = (newValue: string) => {
		formik.setFieldValue('email', newValue)
	}

	return (
		<div className='Profile page-container'>
			<h2 className='page-title'>Profile Settings</h2>

			<ProfilePicture />
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
						handleChange={(e) => updateEmailAddress(e.currentTarget.value)}
						className='faded-bg'
					/>

					{formik.values.customer && (
						<div className='customer-container'>
							<h2>Shipping Information</h2>
							<div className='address-container'>
								<InputTextBox
									label='Address'
									type='text'
									handleChange={(e) => updateShippingAddress('addressOne', e.currentTarget.value)}
									value={formik.values.customer.shippingAddress.addressOne}
									className='faded-bg'
								/>
								<InputTextBox
									label='Country'
									type='text'
									handleChange={(e) => updateShippingAddress('country', e.currentTarget.value)}
									value={formik.values.customer.shippingAddress.country}
									className='faded-bg'
								/>
								<div className='gapped-fields'>
									<InputTextBox
										label='City'
										type='text'
										handleChange={(e) => updateShippingAddress('city', e.currentTarget.value)}
										value={formik.values.customer.shippingAddress.city}
										className='faded-bg'
									/>
									<InputTextBox
										label='State'
										type='text'
										handleChange={(e) => updateShippingAddress('state', e.currentTarget.value)}
										value={formik.values.customer.shippingAddress.state}
										className='faded-bg'
									/>
								</div>
								<InputTextBox
									label='Zip Code'
									type='text'
									handleChange={(e) => updateShippingAddress('zipCode', e.currentTarget.value)}
									value={formik.values.customer.shippingAddress.zipCode}
									className='faded-bg'
								/>
							</div>
							<div className='customer-container'>
								<h2>Billing Information</h2>
								<div className='address-container billing'>
									<InputCheckbox
										checked={isBillingTheSameAsShipping}
										label='Is the billing information the same as the shipping information?'
										onChange={() => setBillingInformationSameAsShipping()}
									/>
									<fieldset disabled={isBillingTheSameAsShipping}>
										<InputTextBox
											label='Address'
											type='text'
											handleChange={(e) =>
												updateBillingAddress('addressOne', e.currentTarget.value)
											}
											value={formik.values.customer.billingAddress.addressOne}
											className='faded-bg'
										/>
										<InputTextBox
											label='Country'
											type='text'
											handleChange={(e) => updateBillingAddress('country', e.currentTarget.value)}
											value={formik.values.customer.billingAddress.country}
											className='faded-bg'
										/>
										<div className='gapped-fields'>
											<InputTextBox
												label='City'
												type='text'
												handleChange={(e) =>
													updateBillingAddress('city', e.currentTarget.value)
												}
												value={formik.values.customer.billingAddress.city}
												className='faded-bg'
											/>
											<InputTextBox
												label='State'
												type='text'
												handleChange={(e) =>
													updateBillingAddress('state', e.currentTarget.value)
												}
												value={formik.values.customer.billingAddress.state}
												className='faded-bg'
											/>
										</div>
										<InputTextBox
											label='Zip Code'
											type='text'
											handleChange={(e) => updateBillingAddress('zipCode', e.currentTarget.value)}
											value={formik.values.customer.billingAddress.zipCode}
											className='faded-bg'
										/>
									</fieldset>
								</div>
							</div>
						</div>
					)}
				</Form>
			</FormikProvider>

			<button className='btn btn-primary mt-10' onClick={() => handleSubmit(UserFromStore)} disabled={isLoading}>
				{isLoading ? 'Loading...' : 'Save Changes'}
			</button>

			<section className='Security'>
				<h3>Security & Privacy</h3>
				<ChangePasswordForm />
			</section>
		</div>
	)
}

export default Page
