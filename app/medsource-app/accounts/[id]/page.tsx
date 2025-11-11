'use client'
import React, { useState, useEffect } from 'react'
import User from '@_classes/User'
import API from '@_services/api'
import { useRouter, useParams } from 'next/navigation'
// TODO: Migrate AccountCRUD component
// import AccountCRUD from '@/components/AccountCRUD'
import '@/styles/pages/accounts.css'
import '@/styles/forms.css'

const Page = () => {
	const params = useParams()

	const [user, setUser] = useState<User>(new User({}))
	const [isNewUser, setIsNewUser] = useState<boolean>(false)
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
		//if params has create, then we are creating a new user
		if (userId === 'create') {
			setUser(new User({}))
			setIsNewUser(true)
			return
		}
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
			{!user && <div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}
			{user && (
				<div className="alert alert-info">
					<span>TODO: Migrate AccountCRUD component. User ID: {user.id}</span>
				</div>
			)}
		</div>
	)
}

export default Page
