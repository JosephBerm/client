'use client'
import React, { useState, useEffect } from 'react'
import { User } from '@/classes/User'
import { toast } from 'react-toastify'
import { Formik, Form, FormikProps } from 'formik'
import { useAccountStore } from '@/src/stores/user'

import API from '@/services/api'

import FormInputTextBox from '@/components/FormInputTextbox'
import Validations from '@/utilities/validationSchemas'

import UpdateAccountForm from '../UpdateAccountForm'

const UpdateProfileForm = () => {
	const { User: UserFromStore } = useAccountStore((state) => state)

	const onUserUpdate = (user: User) => {
		useAccountStore.setState({ User: user })
	}

	return (
		<div className='UpdateProfileForm'>
			<h2 className='page-title'>Account</h2>
			<UpdateAccountForm user = {UserFromStore} onUserUpdate={onUserUpdate} />
		</div>
	)
}

export default UpdateProfileForm
