'use client'
import React, { useState, useEffect } from 'react'
import API from '@_services/api'
import { useRouter, useParams } from 'next/navigation'
import Provider from '@_classes/Provider'
import UpdateProviderForm from '@_components/forms/UpdateProviderForm'
// Styles migrated to Tailwind

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
		<div className='page-container'>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			<h1>Providers</h1>
			{!isLoading && (
				<div className='mt-10'>
					<UpdateProviderForm provider={provider} />
					{/* <UpdateCustomerForm customer={customer} /> */}
					{/* <UpdateAccountForm user={user} /> */}
				</div>
			)}
		</div>
	)
}

export default Page
