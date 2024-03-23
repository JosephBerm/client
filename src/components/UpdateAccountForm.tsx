'use client'

import React from 'react'
import User from '@/classes/User'
import { Form, Formik } from 'formik'
import Validations from '@/utilities/validationSchemas'
import API from '@/services/api'
import { toast } from 'react-toastify'
import FormInputTextBox from '@/src/components/FormInputTextbox'

const UpdateAccountForm = ({ user, onUserUpdate }: { user: User; onUserUpdate?: (User: User) => void }) => {
	const [isLoading, setIsLoading] = React.useState(false)

	const handleSubmit = async (UserData: User) => {
		try {
			setIsLoading(true)
			const { data } = await API.Accounts.update<Boolean>(UserData)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)

			if (onUserUpdate) onUserUpdate(UserData)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Formik
			enableReinitialize={true}
			initialValues={user}
			validationSchema={Validations.profileSchema}
			onSubmit={(values, { setSubmitting }) => {
				handleSubmit(values)
				setSubmitting(false)
			}}>
			{(form) => (
				<Form className='update-account-form-container'>
					<FormInputTextBox<User> label='First Name' name='firstName' />
					<FormInputTextBox<User> label='Last Name' name='lastName' />
					<FormInputTextBox<User> label='Email Address' name='email' />

					<div className='form-buttons-container'>
						<button type='submit' className='btn btn-primary' disabled={!form.isValid || isLoading}>
							{isLoading ? <i className='fa-solid fa-spinner animate-spin'></i> : 'Update Profile'}
						</button>
					</div>
				</Form>
			)}
		</Formik>
	)
}

export default UpdateAccountForm
