'use client'

import React from 'react'
import { Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { AccountRole } from '@/classes/Enums'
import { useAccountStore } from '../stores/user'
import { EnumToDropdownValues } from '@/services/utils'

import FormFetchDropdown from '@/components/FormFetchDropDown'
import FormInputTextBox from '@/components/FormInputTextbox'
import InputDropdown from '@/components/InputDropdown'
import FormDropdown from '@/components/FormDropdown'

import Validations from '@/utilities/validationSchemas'
import Company from '@/classes/Company'
import User from '@/classes/User'
import API from '@/services/api'

const UpdateAccountForm = ({ user, onUserUpdate }: { user: User; onUserUpdate?: (User: User) => void }) => {
	const [isLoading, setIsLoading] = React.useState(false)
	const roleOptions = EnumToDropdownValues(AccountRole)
	const User = useAccountStore((state) => state.User)

	return (
		<Formik
			enableReinitialize={true}
			initialValues={user}
			validationSchema={Validations.profileSchema}>
			{(form) => (
				<Form className='FormContainer'>
					<div className="gapped-fields">
						<FormInputTextBox<User> label='First Name' name='firstName' />
						<FormInputTextBox<User> label='Last Name' name='lastName' />
					</div>
					<FormInputTextBox<User> label='Email Address' name='email' />
					<FormInputTextBox<User> label='Phone Number' name='phoneNumber' />

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
					
				</Form>
			)}
		</Formik>
	)
}

export default UpdateAccountForm
