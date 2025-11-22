'use client'
import React, { useState, useEffect } from 'react'
import { API, useRouteParam } from '@_shared'
import { useRouter } from 'next/navigation'
import Provider from '@_classes/Provider'
import UpdateProviderForm from '@_components/forms/UpdateProviderForm'
// Styles migrated to Tailwind

const Page = () => {
	const route = useRouter()
	const providerId = useRouteParam('id')

	const [provider, setProvider] = useState<Provider>(new Provider({}))
	const [isLoading, setIsLoading] = useState<boolean>(false)

	useEffect(() => {
		if (!providerId) {
			route.back()
			return
		}

		const fetchProviders = async () => {
			if (providerId === 'create') return
			
			const actualProviderId = parseInt(providerId, 10)
			
			// Validate parsed number
			if (isNaN(actualProviderId)) {
				route.back()
				return
			}
			
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

		void fetchProviders()
	}, [providerId, route])

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
