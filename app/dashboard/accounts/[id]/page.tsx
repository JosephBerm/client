'use client'
import React, { useState, useEffect } from 'react'
import User from '@/src/classes/User'
import API from '@/src/services/api'
import UpdateAccountForm from '@/src/components/UpdateAccountForm'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import '@/styles/accounts.css'

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
			<h1>Account Page</h1>
			{isLoading && user && (
				<div>
					<UpdateAccountForm user={user} />
				</div>
			)}
		</div>
	)
}

export default Page
