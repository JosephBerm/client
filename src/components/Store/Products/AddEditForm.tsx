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
import Routes from '@/services/routes'
import FormDropdown from '../../FormDropdown'
import FormInputFile from '../../FormInputFile'
import InputFile from '@/components/InputFile'

const AddEditForm = () => {
	const router = useRouter()
	const params = useParams()

	const [product, setProduct] = useState<Product>(new Product({}))
	const [providers, setProviders] = useState<Provider[]>([])
	const [isNewProduct, setIsNewProduct] = useState<Boolean>(params?.id == 'create')
	const [isLoading, setIsLoading] = useState<Boolean>(false)
	const [files, setFiles] = useState<File[]>([])

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

	
	const createProduct = async (prdct: any) => {
		try {
			const formData = new FormData();
			formData.append('product.name', prdct.name);
			formData.append('product.description', prdct.description);
			formData.append('product.price', prdct.price.toString());
			formData.append('product.sku', prdct.sku);
		
			files.forEach((file: File) => {
				formData.append('files', file);
			});
		
			const { data: res } = await API.Store.Products.create(formData, {
				headers: {
				'Content-Type': 'multipart/form-data',
				},
			});

			if (res.statusCode !== 200) return toast.error(res.message);
			toast.success(res.message);

			router.push(`${Routes.InternalAppRoute}/store`);
	
		 
		} catch (error: any) {
		  	toast.error(error?.message?? "Unexpected server error");
		}
	  };

	const updateProduct = async (prdct: Product) => {
		try {
			setIsLoading(true)
			const { data: res } = await API.Store.Products.update<Product>(prdct)
			if (!res.payload || res.statusCode !== 200) return toast.error(res.message)

			toast.success(res.message)
			router.push(`${Routes.InternalAppRoute}/store`)
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchProviders = async () => {
		try {
			const { data } = await API.Providers.getAll()
			if (data.payload) {
				setProviders((data.payload as Provider[]) || [])

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
					<InputFile label='image' onChange={setFiles} multiple={true} />
					<FormInputTextBox label='Product Name' autofocused={true} name='name' />
					<FormInputTextBox label='SKU' name='sku' />
					<FormInputTextBox label='Product Price' name='price' />
					<FormInputTextBox label='Product Description' name='description' />
					<FormDropdown
						label='Provider'
						name='providerId'
						display={(item: Provider) => item.name}
						value={(item: Provider) => item.id}
						options = {providers}
					/>				

					<button type='submit' disabled={false}>
						{isLoading 
						? 
						(<i className='fa-solid fa-spinner animate-spin' />) 
						: isNewProduct ? ('Add Product') : ('Update Product')
						}
					</button>
				</Form>
			)}
		</Formik>
	)
}

export default AddEditForm
