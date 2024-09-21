'use client'

import '@/styles/pages/cart.css'

import React, { useEffect, useState } from 'react'
import { FormikProvider, useFormik, Form } from 'formik'
import { useAccountStore } from '@/src/stores/user'
import { useCartStore } from '@/src/stores/store'
import { useRouter } from 'next/navigation'

import { CartProduct } from '@/classes/Product'
import Address from '@/classes/common/Address'
import Quote from '@/classes/Quote'
import Name from '@/classes/common/Name'

import Routes from '@/services/routes'
import API from '@/services/api'
import Image from 'next/image'
import Link from 'next/link'

import FormInputTextBox from '@/components/FormInputTextbox'
import QuantitySelector from '@/components/QuantitySelector'
import IsBusyLoading from '@/components/isBusyLoading'
import InputTextBox from '@/components/InputTextBox'

const Page = () => {
	const router = useRouter()
	const formik = useFormik({
		initialValues: new Quote(),
		onSubmit: (values) => {
			submitQuote(values)
		},
	})

	const loggedIn = useAccountStore((state) => state.LoggedIn)
	const user = useAccountStore((state) => state.User)
	const cartStore = useCartStore((state) => state.Cart)
	const setCart = useCartStore((state) => state.setCart)
	const deleteProdFromCart = useCartStore((state) => state.removeProduct)
	const [submitted, setSubmitted] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const submitQuote = async (values: Quote) => {
		values.products = cartStore.map((cartProduct) => {
			const product = new CartProduct({ quantity: cartProduct.quantity })
			product.product = null
			product.productId = cartProduct.product!.id
			return product
		})
		values.id = crypto.randomUUID()

		try {
			setIsLoading(true)
			const response = await API.Public.sendQuote(values)
			if (response.data.statusCode == 200) {
				setSubmitted(true)
				setCart([])
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const getImage = (item: CartProduct) => {
		if (item.product == null || item.product?.files.length <= 0) return <i className='fa-regular fa-image' />

		return (
			<Image
				src={`${process.env.API_URL}/products/image?productId=${item.product?.id}&image=${
					item.product?.files[0]?.name ?? ''
				}`}
				width={125}
				height={125}
				style={{ width: 'auto' }}
				alt='Product Image'
			/>
		)
	}

	const updateName = (key: keyof Name, newValue: string) => {
		formik.setFieldValue(`name.${key}`, newValue)
	}

	const updateAddress = (key: keyof Address, newValue: string) => {
		formik.setFieldValue(`transitDetails.${key}`, newValue)
	}
	const handleQuantityChange = (item: CartProduct, quantity: number) => {
		const productsToSet = cartStore.map((p: CartProduct) =>
			p.product!.id === item.product!.id ? { ...p, quantity } : p
		)
		setCart(productsToSet)
	}
	const goToDashBoard = () => {
		if (loggedIn) router.push(Routes.InternalAppRoute)
		else router.push(Routes.Login.location)
	}

	useEffect(() => {}, [cartStore, isLoading])
	useEffect(() => {
		// Check if the user has the necessary details
		if (user) {
			// Create a new object to hold the updated form values
			const updatedValues = { ...formik.values }

			// Update transitDetails with the user's shipping address if available
			if (user.customer?.shippingAddress) {
				updatedValues.transitDetails = user.customer.shippingAddress
			}

			// Update the name field with the user's name if available
			if (user.name) {
				updatedValues.name = user.name
			}

			// Set the updated form values using formik's setValues
			formik.setValues(updatedValues)
		}
	}, [user])

	return (
		<div className='Cart'>
			<h2 className='page-title'>Quote Request</h2>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<div className='page-body'>
					{!submitted && (
						<div className='cart-items'>
							{cartStore.length === 0 && (
								<div className='no-order-container flex flex-col items-center mt-7'>
									There&apos;s nothing in your cart.
								</div>
							)}
							{cartStore.length > 0 &&
								cartStore.map((item) => (
									// create component out of this called CartItemPreview, have it hold a state
									<div className='details-container' key={item.product?.id}>
										<div className='details'>
											<div className='image-container'>{getImage(item)}</div>

											<div className='description'>
												<span className='name'>{item.product?.name}</span>
												<span className='desc'>{item.product?.description}</span>
											</div>
										</div>
										<QuantitySelector
											handleDelete={() => deleteProdFromCart(item)}
											quantity={item.quantity}
											handleChange={(quantity: number) => handleQuantityChange(item, quantity)}
										/>
									</div>
								))}
							<Link className='inline-link' href={Routes.Store.location}>
								Add Products
								<i className='fa-solid fa-plus ml-2' />
							</Link>
						</div>
					)}
					<div className='quote'>
						{!submitted && (
							<FormikProvider value={formik}>
								<h3>Your Quote Request</h3>
								<p className='subtitle my-2 text-center'>
									Complete the form below to submit your quote request and a staff member will contact
									you within 24 hours.
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
									<div className='address-container'>
										<InputTextBox
											label='Country'
											type='text'
											handleChange={(e) => updateAddress('country', e.currentTarget.value)}
											value={formik.values.transitDetails.country}
											className='faded-bg'
										/>
										<div className='gapped-fields'>
											<InputTextBox
												label='City'
												type='text'
												handleChange={(e) => updateAddress('city', e.currentTarget.value)}
												value={formik.values.transitDetails.city}
												className='faded-bg'
											/>
											<InputTextBox
												label='State'
												type='text'
												handleChange={(e) => updateAddress('state', e.currentTarget.value)}
												value={formik.values.transitDetails.state}
												className='faded-bg'
											/>
										</div>
										<InputTextBox
											label='Zip Code'
											type='text'
											handleChange={(e) => updateAddress('zipCode', e.currentTarget.value)}
											value={formik.values.transitDetails.zipCode}
											className='faded-bg'
										/>
									</div>
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
										label='Personal Note'
										name='description'
										value={formik.values.description}
										className='faded-bg'
									/>
									<button className='submit-btn' onClick={() => formik.submitForm()}>
										Place Request
									</button>
								</Form>
							</FormikProvider>
						)}
						{submitted && (
							<div className='message-container'>
								<div className='message-icon'>
									<i className='fa-solid fa-check-to-slot' />
								</div>
								<h3>Request Sent!</h3>
								<p className='message'>
									We have successfully received your order and our staff will contact you shortly.
								</p>

								<p className='sign-up'>
									In the meantime you can login to your customer account and track the status of your
									quotes, as well as place orders directly.
								</p>

								<div className='button-container'>
									<button onClick={() => goToDashBoard()}>Go To My Dashboard</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default Page
