'use client'

import React, { useState, useEffect } from 'react'
import ChangePasswordForm from '@/components/Settings/ChangePasswordForm'
import BasicUserInformation from '@/components/Settings/BasicUserInformation'
import '@/styles/pages/profile.css'
import { toast } from 'react-toastify'
import API from '@/services/api'

const Page = () => {
	const handleSubmit = async (UserData: User) => {
		const [isLoading, setIsLoading] = useState(false)

		try {
			//why were these here ?
			// UserData.notifications = []
			// UserData.customer = null

			UserData.role = parseInt(UserData.role as any)
			UserData.customerId = parseInt(UserData.customerId as any)
			if (isNaN(UserData.customerId)) UserData.customerId = -99
			setIsLoading(true)
			const { data } = await API.Accounts.update<Boolean>(UserData)

			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='Profile page-container'>
			<h2 className='page-title'>Profile Settings</h2>
			<BasicUserInformation />

			<h3>Shipping Information</h3>
			<section className='ShippingInfo'></section>
			<h3>Billing Information</h3>
			<section className='BillingInfo'></section>

			<h3>Security & Privacy</h3>
			{/* <section className='Security'></section> */}
			<ChangePasswordForm />
		</div>
	)
}

export default Page
