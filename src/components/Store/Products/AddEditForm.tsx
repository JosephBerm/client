'use client'

import React, { useEffect, useState } from 'react'
import API from '@/services/api'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { Product } from '@/classes/Product'

import { Formik, Form } from 'formik'
import FormInputTextBox from '@/components/FormInputTextbox'
import Validations from '@/utilities/validationSchemas'
import Provider from '@/src/classes/Provider'

const AddEditForm = () => {
	const router = useRouter()
	const params = useParams()

	const [product, setProduct] = useState<Product>(new Product({}))
	const [providers, setProviders] = useState<Provider[]>([])
	const [isNewProduct, setIsNewProduct] = useState<Boolean>(params?.id == 'create')
	const [isLoading, setIsLoading] = useState<Boolean>(false)

	const getProduct = async () => {
		try {
			setIsLoading(true)
			const { data: res } = await API.Store.Products.get<Product>(params?.id.toString())

			if (res.statusCode === 404) toast.error('The product with the given ID not found.')
			else if (res.payload) {
				setProduct(res.payload)
			}
		} catch (err: any) {
			toast.error(err?.message)
		} finally {
			setIsLoading(false)
		}
	}

	const createProduct = async (prdct: Product) => {
		try {
			setIsLoading(true)
			const { data: res } = await API.Store.Products.create<Product>(prdct)
			if (!res.payload || res.statusCode !== 200) return toast.error(res.message)

			toast.success(res.message)
			router.push('/employee-dashboard/store')
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setIsLoading(false)
		}
	}

	const updateProduct = async (prdct: Product) => {
		try {
			setIsLoading(true)
			const { data: res } = await API.Store.Products.update<Product>(prdct)
			if (!res.payload || res.statusCode !== 200) return toast.error(res.message)

			toast.success(res.message)
			router.push('/employee-dashboard/store')
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchProviders = async () => {
		try {
			const { data } = await API.Providers.getAll()
			console.log(data)
			if (data.payload) {

				setProviders(data.payload as Provider[] || [])

				console.log("first", data.payload)
			}
		} finally {
			setIsLoading(true)
		}
	}


	useEffect(() => {
		if (!params.id || isNewProduct) return
		getProduct()
	}, [params.id])

	useEffect(() => {
		fetchProviders()
	}, [])
	return (
		<Formik
			enableReinitialize={true}
			initialValues={product}
			validationSchema={Validations.store.productSchema}
			onSubmit={async (values) => {
				if (params?.id == 'create') await createProduct(values)
				else await updateProduct(values)
			}}>
			{({ isSubmitting, isValid, values }) => (
				<Form className='crudForm'>
					<FormInputTextBox<Product> label='Product Name' autofocused={true} name='name' />
					<FormInputTextBox<Product> label='SKU' name='sku' />
					<FormInputTextBox<Product> label='Product Price' name='price' />
					<FormInputTextBox<Product> label='Product Description' name='description' />
					<select name='providerId' className='form-input' onChange={(e) => setProduct({ ...product, providerId: parseInt(e.target.value) })}>
						<option value=''>Select Provider</option>
						{providers.map((provider) => (
							<option key={provider.id} value={provider.id}>
								{provider.name}
							</option>
						))}
					</select>

					<button type='submit' disabled={isSubmitting || !isValid || !values.name || isLoading == true}>
						{isLoading ? (
							<i className='fa-solid fa-spinner animate-spin' />
						) : isNewProduct ? (
							'Add Product'
						) : (
							'Update Product'
						)}
					</button>
				</Form>
			)}
		</Formik>
	)
}

export default AddEditForm
