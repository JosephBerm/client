'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
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
import UploadedFile from '@/src/classes/UploadedFile'

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
			const { data: res } = await API.Store.Products.get(params?.id.toString())

			if (res.statusCode === 404) toast.error('The product with the given ID not found.')
			else if (res.payload) {
				setProduct(new Product(res.payload))
			}
		} catch (err: any) {
			toast.error(err?.message)
		} finally {
			setIsLoading(false)
		}
	}
	const handleOnChange = (onChangeFiles: File[]) => {
		if(params.id == "create") {
			setFiles(onChangeFiles)
		} else {
			uploadImage(onChangeFiles)
		}
	}


	const uploadImage = async (passFiles: File[]) => {

		console.log("AA", passFiles)
		const formData = new FormData()
		formData.append('productId', product.id)
		passFiles.forEach((file: File) => {
			console.log(file)
			formData.append('files', file);
		});

		console.log(formData)
		const { data: res } = await API.Store.Products.uploadImage(product.id, formData)
		if (res.statusCode !== 200) return toast.error(res.message)

		toast.success(res.message)
		const uploadedFiles = res.payload?.map((file) => new UploadedFile(file)) ?? []

		if (uploadedFiles.length > 0) {
			setProduct((prev) => (new Product({ ...prev, files:[...prev.files, ...uploadedFiles]})))
		}
	}
	
	const deleteImage = async (image: File) => {
		if(params.id == 'create') { // If product is being created
			console.log("HERE", files, image)
			setFiles((prev) => {
				return prev.filter((file) => file.name !== image.name)
			})
		} else { // If product is already creded.
			console.log("AA", image.name)
			const res = await API.Store.Products.deleteImage(params.id as string, image.name)
			if (res.data.payload == true) {
				setProduct((prev) => (new Product({ ...prev, files: product.files.filter((file) => file.name !== image.name) })))
			}

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
			const { data: res } = await API.Store.Products.create(formData);

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
			setIsLoading(true)
			const { data } = await API.Providers.getAll()
			if (data.payload) {
				setProviders((data.payload as Provider[]) || [])

			}
		} finally {
			setIsLoading(false)
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
		<div style={{display:'flex', flexDirection:'column', width: '100%', alignItems:'center'}}>
			{params.id == 'create' && (
				<InputFile label='Upload Images' value={files} onChange={setFiles} multiple={true} onFileDelete={deleteImage} />
			)}
			<Formik
				
				enableReinitialize={true}
				initialValues={product}
				validationSchema={Validations.store.productSchema}
				onSubmit={async (values) => {
					if (params?.id == 'create') await createProduct(values)
					else await updateProduct(values)
				}}>
				{({ isSubmitting, isValid, values }) => (
					<Form className='crudForm mb-10'
					style={{display:'flex', flexDirection:'column', width: '100%', alignItems:'center'}}
						>
						
						
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

			{params.id != "create" && 
				<div className='flex flex-col items-center justify-center text-center gap-5'>
					<h3 className='mb-5'>Images</h3>
					<InputFile
						label='Upload'
						onChange={uploadImage}
						multiple={true}
						value={product.files}
						onFileDelete={deleteImage}
					/>
				</div>
			}
		</div>
	)
}

export default AddEditForm
