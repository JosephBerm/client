'use client'
import React, { useState, useEffect } from 'react'
import User from '@/classes/User'
import API from '@/services/api'
import { useRouter, useParams } from 'next/navigation'
import AccountCRUD from '@/components/AccountCRUD'
import '@/styles/pages/accounts.css'
import '@/styles/forms.css'

const Page = () => {
	const params = useParams()

	const [user, setUser] = useState<User>(new User({}))
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const route = useRouter()

	const userId = params.id

	const fetchUser = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Accounts.get(userId as string)
			if (data.payload) {
				setUser(data.payload)
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchUser()
	}, [])

	if (!userId) return route.back()

	return (
		<div className='page-container'>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			<div className='page-header'>
				<h2 className='page-title'>User Settings</h2>
			</div>
			{!user && <i className='fa-solid fa-spinner animate-spin' />}
			{user && <AccountCRUD user={user} />}
		</div>
	)
}

export default Page
