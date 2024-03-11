'use client'

import React from 'react'
import InputTextBox from '../InputTextBox'
import API from '@/services/api'
import { toast } from 'react-toastify'

import { Formik, Form } from 'formik'
import FormInputTextBox from '@/components/FormInputTextbox'
import Validations from '@/utilities/validationSchemas'

class PasswordForm {
	oldPassword: string = ''
	newPassword: string = ''
	confirmNewPassword: string = ''
}

const ChangePasswordForm = () => {
	const handleSubmit = async (e: PasswordForm) => {
		try {
			const response = await API.account.changePassword<Boolean>(e.oldPassword, e.newPassword)

			if (response && response.data.statusCode === 200) return toast.success(response.data.message)
			else toast.error(response.data.message)
		} catch (err: any) {
			toast.error(err.message)
		}
	}

	return (
		<div>
			<h2>Account</h2>

			<Formik
				initialValues={new PasswordForm()}
				validationSchema={Validations.loginSchema}
				onSubmit={(values, { setSubmitting }) => {
					handleSubmit(values)
					setSubmitting(false)
				}}>
				{(form) => (
					<Form className='min-h-96 flex flex-col gap-8 w-2/4 relative'>
						<FormInputTextBox label='Old Password' name='oldPassword' />
						<FormInputTextBox label='New Password' name='newPassword' />
						<FormInputTextBox label='Confirm New Password' name='confirmNewPassword' />

						<button type='submit' disabled={!form.isValid}>
							Change Password
						</button>
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default ChangePasswordForm
