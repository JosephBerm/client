'use client'

import React, { useState, useEffect } from 'react'
import InputTextBox from '../InputTextBox'
import API from '@/services/api'
import { toast } from 'react-toastify'

import { Formik, Form } from 'formik'
import FormInputTextBox from '@/components/FormInputTextbox'
import Validations from '@/utilities/validationSchemas'

import { PasswordForm } from '@/classes/User'

const ChangePasswordForm = () => {
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: PasswordForm) => {
		try {
			setIsLoading(true)
			const response = await API.Accounts.changePassword<Boolean>(e.oldPassword, e.newPassword)

			if (response && response.data.statusCode === 200) return toast.success(response.data.message)
			else toast.error(response.data.message)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='ChangePasswordForm'>
			<h2 className='page-title'>Account</h2>

			<Formik
				enableReinitialize={true}
				initialValues={new PasswordForm()}
				validationSchema={Validations.changePasswordSchema}
				onSubmit={(values, { setSubmitting }) => {
					handleSubmit(values)
					setSubmitting(false)
				}}>
				{(form) => (
					<Form className='min-h-96 flex flex-col gap-8 w-2/4 relative'>
						<FormInputTextBox<PasswordForm> label='Old Password' name='oldPassword' type='password' />
						<FormInputTextBox<PasswordForm> label='New Password' name='newPassword' type='password' />
						<FormInputTextBox<PasswordForm>
							label='Confirm New Password'
							name='confirmNewPassword'
							type='password'
						/>

						<button type='submit' disabled={!form.isValid || isLoading}>
							{isLoading ? <i className='fa-solid fa-spinner animate-spin'></i> : 'Change Password'}
						</button>
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default ChangePasswordForm
