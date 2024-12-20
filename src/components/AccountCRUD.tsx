'use client'

import React from 'react'
import User from '@/classes/User'
import { Form, Formik } from 'formik'
import Validations from '@/utilities/validationSchemas'
import API from '@/services/api'
import { toast } from 'react-toastify'
import FormInputTextBox from '@/src/components/FormInputTextbox'
import { AccountRole } from '../classes/Enums'
import {EnumToDropdownValues} from '../services/utils'
import FormDropdown from './FormDropdown'
import FormFetchDropdown from './FormFetchDropDown'
import Company from '../classes/Company'
import { useAccountStore } from '../stores/user'
import { useParams } from 'next/navigation'


// This CRUD is for editing/creating accounts

const AccountCRUD = ({ user, onUserUpdate }: { user: User; onUserUpdate?: (User: User) => void }) => {
	const [isLoading, setIsLoading] = React.useState(false)
	const roleOptions = EnumToDropdownValues(AccountRole);
	const User = useAccountStore((state) => state.User)
    const params  = useParams()

	
	const handleSubmit = async (UserData: User) => {
		try {
			UserData.notifications = []
			UserData.customer = null
			
			UserData.role = parseInt(UserData.role as any)
			UserData.customerId = parseInt(UserData.customerId as any)
			if(isNaN(UserData.customerId)) UserData.customerId = -99
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
			validationSchema={Validations.modifyAccountSchema}
			onSubmit={(values, { setSubmitting }) => {
				console.log("WHASDASD")
				handleSubmit(values)
				setSubmitting(false)
			}}>
			{(form) => (
				<Form className='update-form-container'>
					<FormInputTextBox label='Username' name='username' />
					<FormInputTextBox label='Email Address' name='email' />
                    {params.id == "create"
					&&
					<FormInputTextBox label='Password' name='password'  type="password" />
					}

					<FormDropdown<any>
						label='Role'
						options={roleOptions}
						name='role'
						display={(item) => item.name}
						value={(item) => item.id}
					/>

					{User.role == AccountRole.Admin && (
						<FormFetchDropdown<any>
							label='Customer'
							endpoint='/customer/search'
							name='customerId'
							display={(item: Company) => item.name}
							value={(item: Company) => item.id}
							searchBy='name'
						/>
					)}

						<button type='submit' className='mt-10' disabled={!form.isValid || isLoading}>
							{isLoading ? <i className='fa-solid fa-spinner animate-spin'></i> : params.id == "create" ? 'Create Account' : 'Update Account'}
						</button>
				</Form>
			)}
		</Formik>
	)
}

export default AccountCRUD
