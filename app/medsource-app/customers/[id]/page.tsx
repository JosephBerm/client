'use client'
import React, { useState, useEffect } from 'react'
import API from '@/src/services/api'
import UpdateAccountForm from '@/src/components/UpdateAccountForm'
import { useRouter, useParams } from 'next/navigation'
import '@/styles/accounts.css'
import Customer from '@/src/classes/Customer'
import UpdateCustomerForm from '@/src/components/UpdateCustomerForm'

const Page = () => {
	const params = useParams()

	const [customer, setCustomer] = useState<Customer>(new Customer({}))
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()

	const userId = params.id

	const fetchCustomer = async () => {
		if(userId == "create") return;
		const actualUserId = parseInt(userId as string)
		setIsLoading(true)
		try {
			const { data } = await API.Customers.get(actualUserId)
			if (data.payload) {
				setCustomer(data.payload as Customer)
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchCustomer()
	}, [])

	if (!userId) return route.back()

	return (
		<div>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			<h1>Customer</h1>
			{!isLoading && (
				<div>
					<UpdateCustomerForm customer={customer} />
					{/* <UpdateAccountForm user={user} /> */}
				</div>
			)}
		</div>
	)
}

export default Page
