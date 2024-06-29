'use client'
import React, { useState, useEffect } from 'react'
import User from '@/classes/User'
import API from '@/services/api'
import UpdateAccountForm from '@/components/UpdateAccountForm'
import { useRouter, useParams } from 'next/navigation'
import AccountCRUD from '@/components/AccountCRUD'

const Page = () => {
	const params = useParams()

	const [user, setUser] = useState<User>(new User({}))
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()

	const userId = params.id

	const fetchUser = async () => {
		try {
			const { data } = await API.Accounts.get(userId as string)
			if (data.payload) {
				setUser(data.payload)
			}
		} finally {
			setIsLoading(true)
		}
	}

	useEffect(() => {
		fetchUser()
	}, [])

	if (!userId) return route.back()

	return (
		<div>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			<h1 className='mb-5'>Account Page</h1>
			{isLoading && user && (
				<div>
					<AccountCRUD user={user} />
				</div>
			)}
		</div>
	)
}

export default Page
