'use client'

import React, { useState, useEffect } from 'react'
import InputTextBox from '../InputTextBox'
import API from '@/services/api'
import { toast } from 'react-toastify'

import { FormikProvider, useFormik, Form } from 'formik'
import FormInputTextBox from '@/components/FormInputTextbox'
import Validations from '@/utilities/validationSchemas'
import classNames from 'classnames'

import User, { PasswordForm } from '@/classes/User'

interface ChangePasswordFormProps {
	user: User
}
const ChangePasswordForm = ({ user }: ChangePasswordFormProps) => {
	const [isLoading, setIsLoading] = useState(false)
	const [isEditEnabled, setIsEditEnabled] = useState(false)
	const isNewUser = user.id === null

	const handleSubmit = async (e: PasswordForm) => {
		try {
			setIsLoading(true)
			console.log('user', user)
			if (!user?.id) throw new Error('User ID is required')
			console.log('user', user)
			const response = await API.Accounts.changePasswordById<Boolean>(user.id, e.oldPassword, e.newPassword)

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
				{!isNewUser && <FormInputTextBox label='Old Password' name='oldPassword' type='password' disabled={!isEditEnabled} />}
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
						className={classNames({ delete: true })}
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
