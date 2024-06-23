'use client'
import React, { useState, useEffect } from 'react'
import API from '@/src/services/api'
import { useRouter, useParams } from 'next/navigation'
import Provider from '@/src/classes/Provider'
import UpdateProviderForm from '@/src/components/UpdateProviderForm'

const Page = () => {
	const params = useParams()

	const [provider, setProvider] = useState<Provider>(new Provider({}))
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()

	const userId = params.id

	const fetchProviders = async () => {
		if (userId == 'create') return
		const actualProviderId = parseInt(userId as string)
		setIsLoading(true)
		try {
			const { data } = await API.Providers.get(actualProviderId)
			if (data.payload) {
				setProvider(data.payload as Provider)
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchProviders()
	}, [])

	if (!userId) return route.back()

	return (
		<div>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			<h1>Providers</h1>
			{!isLoading && (
				<div>
					<UpdateProviderForm provider={provider} />
					{/* <UpdateCustomerForm customer={customer} /> */}
					{/* <UpdateAccountForm user={user} /> */}
				</div>
			)}
		</div>
	)
}

export default Page
