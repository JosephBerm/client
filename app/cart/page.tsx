'use client'

import '@/styles/cart.css'

import React, { useEffect, useState } from 'react'
import API from '@/services/api'
import { CartProduct } from '@/classes/Product'
import { FormikProvider, useFormik, Form } from 'formik'
import { Quote, TypeOfBusiness } from '@/classes/Quote'
import { useCartStore } from '@/src/stores/store'

import InputNumber from '@/components/InputNumber'
import FormInputTextBox from '@/components/FormInputTextbox'
import IsBusyLoading from '@/components/isBusyLoading'

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
		values.typeOfBusiness = values.typeOfBusiness ?? TypeOfBusiness.Other
		values.id = crypto.randomUUID()

		try {
			setIsLoading(true)
			const response = await API.public.sendQuote<Quote>(values)
			console.log(response.data)
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

	const handleSetProductToCart = (productId: string, value: number) => {
		const existingProduct = cartStore.find((p: CartProduct) => p.product!.id === productId)

		if (existingProduct) {
			const productsToSet = cartStore.map((p: CartProduct) =>
				p.product!.id === productId ? { ...p, quantity: value } : p
			)
			setCart(productsToSet)
		}
	}

	const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		cartStore.forEach((carProduct) => {
			if (!carProduct.quantity) deleteProdFromCart(carProduct)
		})
	}

	useEffect(() => {}, [cartStore, isLoading])

	if (isLoading)
		return (
			<div className='Cart'>
				<h2 className='page-title'>Cart</h2>
				<IsBusyLoading />
			</div>
		)
	else
		return (
			<div className='Cart'>
				<h2 className='page-title'>Cart</h2>
				<div className='cart'>
					<div style={{ position: 'relative', width: '100%' }}>
						<div className='cart-item header'>
							<p>Product</p>
							<p>Quantity</p>
							<p>Actions</p>
						</div>
						{cartStore.map((item, index) => (
							<div key={index} className='cart-item'>
								<p style={{ margin: 0 }}>{item.product!.name}</p>

								<div className='flex flex-row mb-2'>
									<InputNumber
										value={item.quantity?.toString() ?? ''}
										label={''}
										handleChange={(e: number) => handleSetProductToCart(item.product!.id!, e)}
										handleBlur={handleBlur}
									/>
								</div>

								<button
									style={{ border: 'none', height: 30, width: 30, padding: 0 }}
									onClick={() => deleteProdFromCart(item)}>
									<i className='fas fa-trash'></i>
								</button>
							</div>
						))}
					</div>
				</div>

				<div className='quote'>
					{submitted && (
						<p>Thank you for contact us. One of our team members will be reaching out shortly.</p>
					)}
					{!submitted && (
						<FormikProvider value={formik}>
							<Form onSubmit={formik.handleSubmit} className='FormContainer'>
								<FormInputTextBox<Quote> label='Facility Name' name='name' value={formik.values.name} />
								<FormInputTextBox<Quote>
									label='Contact Name'
									name='contactName'
									value={formik.values.contactName}
								/>
								<FormInputTextBox<Quote>
									label='Email Address'
									name='emailAddress'
									value={formik.values.emailAddress}
								/>
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
					)}
				</div>
			</div>
		)
}

export default Page
