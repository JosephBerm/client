'use client'

import React, { useEffect, useState } from 'react'
import API from '@/services/api'
import Utils from '@/services/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Product } from '@/classes/Product'
import { useParams } from 'next/navigation'

import InputTextBox from '@/components/InputTextBox'
import InputNumber from '@/components/InputNumber'

const ProductsForm = () => {
	const router = useRouter()
	const [product, setProduct] = useState(new Product())

	const params = useParams()
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (!params.id || params.id == 'create') return

		getProduct()
		// Fetch the product from the server
		// and set the state with the product information
	}, [params.id])

	const getProduct = async () => {
		try {
			setIsLoading(true)
			const { data: res } = await API.store.products.get<Product>(params?.id.toString())
			if (res.statusCode === 404) {
				toast.error('The product with the given ID not found.')
			} else if (res.payload) {
				setProduct(res.payload)
			}
		} catch (err: any) {
			toast.error(err?.message)
		} finally {
			setIsLoading(false)
		}
	}

	const createProduct = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			setIsLoading(true)
			// const response = await API.store.createProduct(product);
			const { data: res } = await API.store.products.create<Product>(product)
			if (!res.payload || res.statusCode !== 200) {
				toast.error(res.message)
				return
			}

			const savedProduct = res.payload
			toast.success(`Successfully created a product ${savedProduct.name}`)
			console.log('server return id:', savedProduct.id)

			router.push('/dashboard/store')
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setIsLoading(false)
		}
	}

	const updateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
		// Not implemented yet
	}

	const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (params?.id == 'create') {
			createProduct(e)
		} else updateProduct(e)
	}

	const handleChange = (key: keyof Product, value: string | number) => {
		setProduct((prevProduct) => ({
			...prevProduct,
			[key]: value,
		}))
	}

	return (
		<form className='crudForm' onSubmit={handleFormSubmission}>
			<InputTextBox
				label='Product Name'
				type='text'
				value={product.name}
				handleChange={(value) => handleChange('name', value)}
			/>

			<InputTextBox
				label='SKU'
				type='text'
				value={product.sku}
				handleChange={(value) => handleChange('sku', value)}
			/>

			<InputNumber
				label='Product Price'
				value={product.price.toString()}
				handleChange={(value) => handleChange('price', value)}
			/>

			<InputTextBox
				label='Product Description'
				type='text'
				value={product.description}
				handleChange={(value) => handleChange('description', value)}
			/>

			{/* How are we going to be storing the images? */}
			{/* <InputTextBox   label="Product Image"
                            type="file"
                            value=""
                            handleChange={(value) => console.log(value)}
                            required={true} /> */}

			<button type='submit' disabled={isLoading}>
				Add Product
			</button>
		</form>
	)
}

export default ProductsForm
