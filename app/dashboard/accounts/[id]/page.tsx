'use client'
import User from '@/src/classes/User'
import API from '@/src/services/api'
import React from 'react'
import UpdateAccountForm from '@/src/components/UpdateAccountForm'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import '@/styles/accounts.css'

const Page = () => {
	const params = useParams()

	const [user, setUser] = React.useState<User>(new User({}))
	const [loading, setLoading] = React.useState<boolean>(false)
	const route = useRouter()

	const userId = params.id

	const fetchUser = async () => {
		try {
			const { data } = await API.Accounts.get(userId as string)
			if (data.payload) {
				setUser(data.payload)
			}
		} finally {
			setLoading(true)
		}
	}

	React.useEffect(() => {
		fetchUser()
	}, [])

	if (!userId) return route.back()

	return (
		<div>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			<h1>Account Page</h1>
			{loading && user && (
				<div>
					<UpdateAccountForm user={user} />
				</div>
			)}
		</div>
	)
}

export default Page
