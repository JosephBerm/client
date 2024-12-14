'use client'

import React, { useState, useEffect } from 'react'
import InputTextBox from '../InputTextBox'
import API from '@/services/api'
import { toast } from 'react-toastify'

import { FormikProvider, useFormik, Form } from 'formik'
import FormInputTextBox from '@/components/FormInputTextbox'
import Validations from '@/utilities/validationSchemas'
import classNames from 'classnames'

import { PasswordForm } from '@/classes/User'

const ChangePasswordForm = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [isEditEnabled, setIsEditEnabled] = useState(false)

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

	// const handleButtonClick = () => {
	// 	if (!isEditEnabled) setIsEditEnabled(true)
	// 	setIsEditEnabled(false)
	// }

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: new PasswordForm(),
		validationSchema: Validations.changePasswordSchema,
		onSubmit: async (values) => {
			try {
				await handleSubmit(values)
			} catch (error: unknown) {
				if (error instanceof Error) {
					toast.error(error.message)
					console.error(error.message)
				} else if (error instanceof String) {
					toast.error(error)
					console.error(error)
				} else toast.error('An error occurred')
			} finally {
				setIsEditEnabled(false)
			}
		},
	})

	return (
		<FormikProvider value={formik}>
			<Form className='FormContainer security change-password' onSubmit={formik.handleSubmit}>
				<FormInputTextBox label='Old Password' name='oldPassword' type='password' disabled={!isEditEnabled} />
				<FormInputTextBox label='New Password' name='newPassword' type='password' disabled={!isEditEnabled} />
				<FormInputTextBox
					label='Confirm New Password'
					name='confirmNewPassword'
					type='password'
					disabled={!isEditEnabled}
				/>
				<button
					className={classNames({ 'form-button': true, 'edit-button': isEditEnabled })}
					onClick={() => {
						if (isEditEnabled) formik.submitForm()
						else setIsEditEnabled(true)
					}}>
					{isEditEnabled ? 'Save' : 'Change Password'}
				</button>
				{isEditEnabled && (
					<button
						type='button'
						className={classNames({ 'delete': true })}
						onClick={() => {
							setIsEditEnabled(false)
							formik.resetForm()
						}}>
						Cancel
					</button>
				)}
			</Form>
		</FormikProvider>
	)
}

export default ChangePasswordForm
