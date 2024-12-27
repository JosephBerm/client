'use client'

import React from 'react'
import { Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { AccountRole } from '@/classes/Enums'
import { useAccountStore } from '../stores/user'

import InputSearchDropdown from '@/src/components/InputSearchDropdown'
import FormInputTextBox from '@/components/FormInputTextbox'
import InputDropdown from '@/components/InputDropdown'
import FormDropdown from '@/components/FormDropdown'

import Validations from '@/utilities/validationSchemas'
import Company from '@/classes/Company'
import User from '@/classes/User'
import API from '@/services/api'
import InputTextBox from '@/components/InputTextBox'

const UpdateAccountForm = ({ user, onUserUpdate }: { user: User; onUserUpdate?: (User: User) => void }) => {
	const [isLoading, setIsLoading] = React.useState(false)
	const User = useAccountStore((state) => state.User)
	console.log('User', User)
	return (
		<Formik
			enableReinitialize={true}
			initialValues={user}
			validationSchema={Validations.profileSchema}
			onSubmit={() => {}}>
			{(form) => (
				<Form className='FormContainer'>
					<div className='gapped-fields'>
						<FormInputTextBox label='First Name' name='name.first' />
						<FormInputTextBox label='Last Name' name='name.last' />
					</div>
					<FormInputTextBox label='Email Address' name='email' />
					<FormInputTextBox label='Phone Number' name='phoneNumber' />
				</Form>
			)}
		</Formik>
	)
}

export default UpdateAccountForm
