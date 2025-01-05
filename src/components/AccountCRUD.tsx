'use client'

import { AccountRole } from '../classes/Enums'
import { EnumToDropdownValues } from '../services/utils'
import { Form, Formik, useFormik, FormikProvider } from 'formik'
import { toast } from 'react-toastify'
import { useAccountStore } from '../stores/user'
import { useParams } from 'next/navigation'

import API from '@/services/api'
import Company from '@/classes/Company'
import FormDropdown from './FormDropdown'
import FormInputTextBox from '@/src/components/FormInputTextbox'
import InputSearchDropdown from './InputSearchDropdown'
import InputTextBox from './InputTextBox'
import React, { ChangeEvent, useCallback, useEffect } from 'react'
import User from '@/classes/User'
import { IUser } from '@/classes/User'
import Validations from '@/utilities/validationSchemas'
import Name from '@/classes/common/Name'
import InputDropdown from './InputDropdown'
import AddEditUser from './AddEditUser'

// This CRUD is for editing/creating accounts

const AccountCRUD = ({ user, onUserUpdate }: { user: User; onUserUpdate?: (User: User) => void }) => {
	const [isSavingForm, setIsSavingForm] = React.useState(false)
	const [isFetchingUsers, setIsFetchingUsers] = React.useState(false)
	const [usersList, setUsersList] = React.useState<User[]>([])
	const roleOptions = EnumToDropdownValues(AccountRole)
	const currentUserRole = useAccountStore((state) => state.User.role)
	const params = useParams()
	const formik = useFormik({
		initialValues: user,
		onSubmit: (values) => {
			handleSubmit(values)
		},
	})

	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setIsFetchingUsers(true)
				const { data } = await API.Accounts.getAll()
				if (data?.statusCode == 200) {
					const listOfUsers = data.payload ?? []
					listOfUsers.forEach((user: User) => (user.name = new Name(user.name)))
					setUsersList(listOfUsers)
				} else {
					throw new Error(data.message ?? 'An error occurred while fetching customers')
				}
			} catch (error: any) {
				return toast.error(error)
				console.error(error)
			} finally {
				setIsFetchingUsers(false)
			}
		}
		fetchCustomers()
	}, [])

	const handleSubmit = async (userData: User) => {
		try {
			setIsSavingForm(true)
			userData.notifications = []
			userData.customer = null

			userData.role = parseInt(userData.role as any)
			userData.customerId = parseInt(userData.customerId as any)
			if (isNaN(userData.customerId)) userData.customerId = -99
			const { data } = await API.Accounts.update<Boolean>(userData)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)

			if (onUserUpdate) onUserUpdate(userData)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsSavingForm(false)
		}
	}

	const updateUserInfo = useCallback(
		(key: keyof IUser, newValue: string | number | null) => {
			if (newValue === null) return
			if (key == 'role' || key == 'customerId') newValue = parseInt(newValue as any)

			formik.setFieldValue(key, newValue)
		},
		[formik]
	)

	useEffect(() => {
		// Check if the user has the necessary details
		if (user) {
			formik.setValues(user)
		}
	}, [user])

	console.log('Rendering AccountCRUD')
	return (
		<div className='AccountCRUD'>
			{currentUserRole == AccountRole.Admin && (
				<InputSearchDropdown<User>
					label='Customer'
					name='name'
					display={(user: User) => user.name.getFullName()}
					value={(user: User) => user.id}
					options={usersList}
					isLoading={isFetchingUsers}
				/>
			)}
			<AddEditUser user={user} />
		</div>
	)
}

export default AccountCRUD
