'use client'
import React, { useState, useEffect } from 'react'
import User from '@/classes/User'
import API from '@/services/api'
import { useRouter, useParams } from 'next/navigation'
import AccountCRUD from '@/components/AccountCRUD'
import "@/styles/pages/accounts.css"
import "@/styles/forms.css"

const Page = () => {
	const params = useParams()

	const [user, setUser] = useState<User>(new User({}))
	const [isLoading, setIsLoading] = useState<boolean>(false)
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
			<h1 className='mb-5'>Account Page</h1>
			{isLoading && <i className='fa-solid fa-spinner animate-spin' />}
			{!isLoading && user && (
				<AccountCRUD user={user} />
			)}
		</div>
	)
}

export default Page
