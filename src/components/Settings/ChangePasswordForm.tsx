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
			//Is edit enabled ?
			if (!isEditEnabled) {
				setIsEditEnabled(true)
				return
			}
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
			<Form className='FormContainer change-password' onSubmit={formik.handleSubmit}>
				<FormInputTextBox label='Old Password' name='oldPassword' type='password' disabled={!isEditEnabled} />
				<FormInputTextBox label='New Password' name='newPassword' type='password' disabled={!isEditEnabled} />
				<FormInputTextBox
					label='Confirm New Password'
					name='confirmNewPassword'
					type='password'
					disabled={!isEditEnabled}
				/>
				<div className='button-container'>
					<button
						className={classNames({ 'form-button': true, 'edit-button': isEditEnabled })}
						onClick={() => formik.submitForm()}>
						{isEditEnabled ? 'Save' : 'Change Password'}
					</button>
					<button
						type='button'
						className={classNames({ 'delete form-button': true, hidden: !isEditEnabled })}
						onClick={() => {
							setIsEditEnabled(false)
							formik.resetForm()
						}}>
						Cancel
					</button>
				</div>
			</Form>
		</FormikProvider>
	)
}

export default ChangePasswordForm
