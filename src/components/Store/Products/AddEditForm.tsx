'use client'

import React, { useEffect, useState } from 'react'
import API from '@/services/api'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Product } from '@/classes/Product'
import { useParams } from 'next/navigation'

import { Formik, Form } from 'formik'
import FormInputTextBox from '@/components/FormInputTextbox'
import Validations from '@/utilities/validationSchemas'

const AddEditForm = () => {
	const router = useRouter()
	const params = useParams()

	const [product, setProduct] = useState(new Product())

	const getProduct = async () => {
		try {
			const { data: res } = await API.store.products.get<Product>(params?.id.toString())

			if (res.statusCode === 404) toast.error('The product with the given ID not found.')
			else if (res.payload) setProduct(res.payload)
		} catch (err: any) {
			toast.error(err?.message)
		}
	}

	const createProduct = async (e: Product) => {
		try {
			const { data: res } = await API.store.products.create<Product>(product)
			if (!res.payload || res.statusCode !== 200) return toast.error(res.message)

			toast.success(res.message)
			router.push('/dashboard/store')
		} catch (error: any) {
			toast.error(error.message)
		}
	}

	const updateProduct = async (e: Product) => {
		try {
			const { data: res } = await API.store.products.update<Product>(product)
			if (!res.payload || res.statusCode !== 200) return toast.error(res.message)

			toast.success(res.message)
			router.push('/dashboard/store')
		} catch (error: any) {
			toast.error(error.message)
		}
	}

	useEffect(() => {
		if (!params.id || params.id == 'create') return

		getProduct()
	}, [params.id])

	return (
		<Formik
			initialValues={product}
			validationSchema={Validations.store.productSchema}
			onSubmit={(values, { setSubmitting }) => {
				if (params?.id == 'create') createProduct(values)
				else updateProduct(values)

				setSubmitting(false)
			}}>
			{({ isSubmitting, isValid, values }) => (
				<Form className='crudForm'>
					<FormInputTextBox label='Product Name' autofocused={true} name='name' />
					<FormInputTextBox label='SKU' autofocused={true} name='sku' />
					<FormInputTextBox label='Product Price' autofocused={true} name='price' />
					<FormInputTextBox label='Product Description' autofocused={true} name='description' />

					<button type='submit' disabled={isSubmitting || !isValid || !values.name}>
						{params?.id == 'create' ? 'Add Product' : 'Update Product'}
					</button>
				</Form>
			)}
		</Formik>
	)
}

export default AddEditForm
