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
			const response = await API.Public.sendQuote<Quote>(values)
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

	const updateAddress = (key: keyof Address, newValue: string) => {}

	useEffect(() => {
		console.log('fdsfsdfsdfsd', cartStore)
	}, [cartStore, isLoading])

	return (
		<div className='Cart'>
			<h2 className='page-title'>CART & CHECKOUT</h2>
			{isLoading && <IsBusyLoading />}
			{!isLoading && (
				<div className='page-body'>
					<div className='cart-items'>
						{cartStore.map((item) => (
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
								<div className='quantity'>
									<button className='delete' onClick={() => deleteProdFromCart(item)}>
										<i className='fas fa-trash'></i>
									</button>
									{/* create component out of this called QuantitySelector */}
									{/* it would have a delete button on it. */}
									{/* left button will start as a trash if 1 is selected */}
									{/* middle would have the quantity in the input */}
									{/* right would have the increase by 1 button */}
									<input value={item.quantity.toString()} onChange={() => {}} />
									<button onClick={() => deleteProdFromCart(item)}>
										<i className='fa-solid fa-arrow-up'></i>
									</button>
								</div>
							</div>
						))}
					</div>
					<div className='quote'>
						<h3>Your Quote Request</h3>
						<FormikProvider value={formik}>
							<Form onSubmit={formik.handleSubmit} className='FormContainer'>
								<div className='name-container'>
									<InputTextBox
										label='First Name'
										type='text'
										handleChange={(e) => updateName('first', e.currentTarget.value)}
										value={formik.values.name.first}
									/>
									<InputTextBox
										label='Last Name'
										type='text'
										handleChange={(e) => updateName('last', e.currentTarget.value)}
										value={formik.values.name.last}
									/>
								</div>
								<FormInputTextBox<Quote>
									label='Email Address'
									name='emailAddress'
									value={formik.values.emailAddress}
								/>
								<div className='address-container'>
									<InputTextBox
										label='Country'
										type='text'
										handleChange={(e) => updateAddress('country', e.currentTarget.value)}
										value={formik.values.name.first}
									/>
									<InputTextBox
										label='City'
										type='text'
										handleChange={(e) => updateAddress('city', e.currentTarget.value)}
										value={formik.values.name.last}
									/>
									<InputTextBox
										label='State'
										type='text'
										handleChange={(e) => updateAddress('state', e.currentTarget.value)}
										value={formik.values.name.last}
									/>
									<InputTextBox
										label='Zip Code'
										type='text'
										handleChange={(e) => updateAddress('zipCode', e.currentTarget.value)}
										value={formik.values.name.last}
									/>
								</div>
								<FormInputTextBox<Quote>
									label='Phone Number'
									name='phoneNumber'
									value={formik.values.phoneNumber}
								/>
								<FormInputTextBox<Quote>
									type='textarea'
									rows={6}
									label='Comments'
									name='description'
									value={formik.values.description}
								/>
								<button type='submit' style={{ marginTop: 40 }}>
									Submit
								</button>
							</Form>
						</FormikProvider>
					</div>

					<p>Thank you for contact us. One of our team members will be reaching out shortly.</p>
				</div>
			)}
		</div>
	)
}

export default Page
