'use client'

import '@/styles/cart.css'

import React, { ChangeEvent, useEffect, useState } from 'react'
import { FormikProvider, useFormik, Form } from 'formik'
import { CartProduct } from '@/classes/Product'
import { useCartStore } from '@/src/stores/store'
import { TypeOfBusiness } from '@/classes/Enums'
import Quote from '@/classes/Quote'
import API from '@/services/api'

import InputNumber from '@/components/InputNumber'
import FormInputTextBox from '@/components/FormInputTextbox'
import IsBusyLoading from '@/components/isBusyLoading'
import Image from 'next/image'
import InputTextBox from '@/components/InputTextBox'
import Name from '@/classes/Name'
import Address from '@/classes/Address'
import Link from 'next/link'
import Routes from '@/services/routes'
import QuantitySelector from '@/components/QuantitySelector'

const Page = () => {
	const formik = useFormik({
		initialValues: new Quote(),
		onSubmit: (values) => {
			submitQuote(values)
		},
	})

	const cartStore = useCartStore((state) => state.Cart)
	const setCart = useCartStore((state) => state.setCart)
	const deleteProdFromCart = useCartStore((state) => state.removeProduct)
	const [submitted, setSubmitted] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const submitQuote = async (values: Quote) => {
		values.products = cartStore.map((cartProduct) => {
			const product = new CartProduct(null, cartProduct.quantity)
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

	const handleSetProductToCart = (productId: string, e: ChangeEvent<HTMLInputElement>) => {
		const existingProduct = cartStore.find((p: CartProduct) => p.product!.id === productId)

		if (existingProduct) {
			const productsToSet = cartStore.map((p: CartProduct) =>
				p.product!.id === productId ? { ...p, quantity: parseInt(e.currentTarget.value) } : p
			)
			setCart(productsToSet)
		}
	}

	const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		cartStore.forEach((carProduct) => {
			if (!carProduct.quantity) deleteProdFromCart(carProduct)
		})
	}

	const getImage = (item: CartProduct) => {
		if (item.product?.image?.src) return <Image src={item.product.image.src} alt={item.product.image.alt} />

		return <i className='fa-regular fa-image' />
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
	useEffect(() => {}, [cartStore, isLoading])

	return (
		<div className='Cart'>
			<h2 className='page-title'>Quote Request</h2>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<div className='page-body'>
					<div className='cart-items'>
						{cartStore.length === 0 && (
							<div className='no-order-container flex flex-col items-center'>
								There&apos;s nothing in your cart.
								<Link className='inline-link' href={Routes.Products.location}>
									Start Adding Products Now!
								</Link>
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
											<span className='total'>${item.product?.price}</span>
										</div>
									</div>
									<QuantitySelector
										handleDelete={() => deleteProdFromCart(item)}
										quantity={item.quantity}
										handleChange={(quantity: number) => handleQuantityChange(item, quantity)}
									/>
								</div>
							))}
					</div>
					<div className='quote'>
						<h3>Your Quote Request</h3>
						{!submitted && (
							<FormikProvider value={formik}>
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
									<FormInputTextBox<Quote>
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
										<FormInputTextBox<Quote>
											label='Phone Number'
											name='phoneNumber'
											value={formik.values.phoneNumber}
											className='faded-bg'
										/>
										<FormInputTextBox<Quote>
											label='Company Name'
											name='companyName'
											value={formik.values.companyName}
											className='faded-bg'
										/>
									</div>
									<FormInputTextBox<Quote>
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
							<div className='fade-in'>
								<p>Thank you for contact us. One of our team members will be reaching out shortly.</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default Page
