'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import '@/styles/pages/profile.css'
import API from '@/services/api'
import User from '@/classes/User'

import UserInfoBasic from '@/components/Settings/UserInfoBasic'
import UserInfoShipping from '@/components/Settings/UserInfoShipping'
import UserInfoBilling from '@/components/Settings/UserInfoBilling'
import UserInfoPrivacy from '@/components/Settings/UserInfoPrivacy'

const Page = () => {
	const [isLoading, setIsLoading] = useState(false)
	const handleSubmit = async (UserData: User) => {
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
			<UserInfoBasic />
			<UserInfoShipping />
			<UserInfoBilling />
			<UserInfoPrivacy />
		</div>
	)
}

export default Page
