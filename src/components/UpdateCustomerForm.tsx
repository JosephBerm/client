'use client'

import React from 'react'
import Customer from '@/classes/Customer'
import { Form, Formik } from 'formik'
import Validations from '@/utilities/validationSchemas'
import API from '@/services/api'
import { toast } from 'react-toastify'
import FormInputTextBox from '@/src/components/FormInputTextbox'
import { useParams } from 'next/navigation'

const UpdateCustomerForm = ({ customer: customer, onUserUpdate: onCustomerUpdate }: { customer: Customer; onUserUpdate?: (User: Customer) => void }) => {
	const [isLoading, setIsLoading] = React.useState(false)
	const params = useParams()

	console.log("Actual customer...", customer)

	const handleSubmit = async (customerData: Customer) => {
		if(params.id == "create"){
			await createCustomer(customerData)
		}else {
			await updateCustomer(customerData)
		}
	}

	const updateCustomer = async (customerData: Customer) => {
		try {
			setIsLoading(true)
			const { data } = await API.Customers.update(customerData)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)

			if (onCustomerUpdate) onCustomerUpdate(customerData)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const createCustomer = async (customerData: Customer) => {
		try {
			setIsLoading(true)
			const { data } = await API.Customers.create(customerData)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)
			if (onCustomerUpdate && data.payload) onCustomerUpdate(data.payload)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	const buttonText = params.id == "create" ? "Create Customer" : "Update Customer"

	return (
		<Formik
			enableReinitialize={true}
			initialValues={customer}
			validationSchema={Validations.customerSchema}
			onSubmit={async (values, { setSubmitting }) => {
				await handleSubmit(values)
				setSubmitting(false)
			}}>
			{(form) => (
				<Form className='update-account-form-container'>
					<FormInputTextBox<Customer> label='First Name' name='name' />
					<FormInputTextBox<Customer> label='Email Address' name='email' />
					<FormInputTextBox<Customer> label='Indentifier (ETIN/SSN)' name='identifier' />

					
					<div className='form-buttons-container'>
						<button type='submit' className='button' disabled={!form.isValid || isLoading}>
							{isLoading ? <i className='fa-solid fa-spinner animate-spin'></i> : buttonText}
						</button>
					</div>
						
					
					

				</Form>
			)}
		</Formik>
	)
}

export default UpdateCustomerForm
