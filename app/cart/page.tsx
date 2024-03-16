'use client'

import '@/styles/cart.css'

import { CartProduct } from '@/classes/Product'
import { useCartStore } from '@/src/stores/store'
import React from 'react'

import InputNumber from '@/components/InputNumber'
import { FormikProvider, useFormik, Form } from 'formik'
import FormInputTextBox from '@/components/FormInputTextbox'
import API from '@/src/services/api'

class QuoteForm {
	facilityName: string = ''
	emailAddress: string = ''
	contactName: string = ''
	phoneNumber: string = ''
	typeOfBusiness: TypeOfBusiness | null = null
	description: string = ''
	products: CartProduct[] = []
}

enum TypeOfBusiness {
	Dentist,
	SurgeryCenter,
	Hospital,
	Veterinarian,
	Restaurant,
	Construction,
	Other,
}

const Page = () => {
	const formik = useFormik({
		initialValues: new QuoteForm(),
		onSubmit: (values) => {
			submitQuote(values)
		},
	})

	const cartStore = useCartStore((state) => state.Cart)
	const setCart = useCartStore((state) => state.setCart)
	const deleteProdFromCart = useCartStore((state) => state.removeProduct)

	const [isLoading, setIsLoading] = React.useState<boolean>(false)

	const submitQuote = async (values: QuoteForm) => {
		values.products = cartStore;
		values.typeOfBusiness = values.typeOfBusiness  ?? TypeOfBusiness.Other

		try {
			setIsLoading(true)
			const response = await API.public.sendQuote<QuoteForm>(values)

				console.log(response)
		} catch(err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSetProductToCart = (productId: string, value: number) => {
		console.log('XXX', value)

		const existingProduct = cartStore.find((p: CartProduct) => p.product.id === productId)

		if (existingProduct) {
			const productsToSet = cartStore.map((p: CartProduct) =>
				p.product.id === productId ? { ...p, quantity: value } : p
			)
			setCart(productsToSet)
		}
	}

	const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		cartStore.forEach((carProduct) => {
			if (!carProduct.quantity) deleteProdFromCart(carProduct)
		})
	}

	React.useEffect(() => {
		console.log(cartStore)
	}, [cartStore])

	return (
		<div className='page-container'>
			<div className='cart'>
				<div style={{ position: 'relative', width: '100%' }}>
					<div className='cart-item header'>
						<p>Product</p>
						<p>Quantity</p>
						<p>Actions</p>
					</div>
					{cartStore.map((item, index) => (
						<div key={index} className='cart-item'>
							<p style={{ margin: 0 }}>{item.product.name}</p>

							<div className='flex flex-row mb-2'>
								<InputNumber
									value={item.quantity?.toString() ?? ''}
									label={''}
									handleChange={(e: number) => handleSetProductToCart(item.product.id!, e)}
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
				<FormikProvider value={formik}>
					<Form onSubmit={formik.handleSubmit} className='FormContainer'>
						<FormInputTextBox<QuoteForm>
							label='Facility Name'
							name='facilityName'
							value={formik.values.facilityName}
						/>
						<FormInputTextBox<QuoteForm>
							label='Contact Name'
							name='contactName'
							value={formik.values.contactName}
						/>
						<FormInputTextBox<QuoteForm>
							label='Email Address'
							name='emailAddress'
							value={formik.values.emailAddress}
						/>
						<FormInputTextBox<QuoteForm>
							label='Phone Number'
							name='phoneNumber'
							value={formik.values.phoneNumber}
						/>
						<FormInputTextBox<QuoteForm>
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
		</div>
	)
}

export default Page
