'use client'

import React from 'react'
import Provider from '@/classes/Provider'
import { Form, Formik } from 'formik'
import Validations from '@/utilities/validationSchemas'
import API from '@/services/api'
import { toast } from 'react-toastify'
import FormInputTextBox from '@/src/components/FormInputTextbox'
import { useParams } from 'next/navigation'

const UpdateProviderForm = ({ provider: provider, onUserUpdate: onProviderUpdate }: { provider: Provider; onUserUpdate?: (User: Provider) => void }) => {
	const [isLoading, setIsLoading] = React.useState(false)
	const params = useParams()

	console.log("Actual provider...", provider)

	const handleSubmit = async (providerData: Provider) => {
		if(params.id == "create"){
			await createProvider(providerData)
		}else {
			await updateProvider(providerData)
		}
	}

	const updateProvider = async (providerData: Provider) => {
		try {
			setIsLoading(true)
			const { data } = await API.Providers.update(providerData)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)

			if (onProviderUpdate) onProviderUpdate(providerData)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const createProvider = async (providerData: Provider) => {
		try {
			setIsLoading(true)
			const { data } = await API.Providers.create(providerData)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)
			if (onProviderUpdate && data.payload) onProviderUpdate(data.payload)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const buttonText = params.id == "create" ? "Create Provider" : "Update Provider"

	return (
		<Formik
			enableReinitialize={true}
			initialValues={provider}
			validationSchema={Validations.providerSchema}
			onSubmit={async (values, { setSubmitting }) => {
				await handleSubmit(values)
				setSubmitting(false)
			}}>
			{(form) => (
				<Form className='update-account-form-container'>
					<FormInputTextBox<Provider> label='Name' name='name' />
					<FormInputTextBox<Provider> label='Email Address' name='email' />
					<FormInputTextBox<Provider> label='Indentifier (ETIN/SSN)' name='identifier' />

					
					<div className='form-buttons-container'>
						<button type='submit' className='btn btn-primary' disabled={!form.isValid || isLoading}>
							{isLoading ? <i className='fa-solid fa-spinner animate-spin'></i> : buttonText}
						</button>
					</div>
						
					
					

				</Form>
			)}
		</Formik>
	)
}

export default UpdateProviderForm
