'use client'
import React, { useState, useEffect } from 'react'
import API from '@_services/api'
import { useRouter, useParams } from 'next/navigation'
import Company from '@_classes/Company'
import UpdateCustomerForm from '@_components/forms/UpdateCustomerForm'
import User from '@_classes/User'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
// TODO: Migrate Table component to use DataTable
// import Table from '@/common/table'
// import { TableColumn } from '@/interfaces/Table'
import { format } from 'date-fns'
import Routes from '@_services/routes'

const Page = () => {
	const params = useParams()

	const [customer, setCustomer] = useState<Company>(new Company({}))
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [accountsForCustomer, setAccountsForCustomer] = useState<User[]>([])	
	const route = useRouter()

	const userId = params.id

	const fetchCustomer = async () => {
		if (userId == "create") return;
		const actualUserId = parseInt(userId as string)
		setIsLoading(true)
		try {
			const { data } = await API.Customers.get(actualUserId)
			if (data.payload) {
				setCustomer(data.payload as Company)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const fetchAccounts = async () => {
		if (userId == "create") return;
		const params = new GenericSearchFilter()
		
		if(typeof userId != "string") return;
		params.add("CustomerId", userId)
		params.includes.push("Customer")

		setIsLoading(true)
		try {
			const { data } = await API.Accounts.search(params)
			if (data.payload) {
				setAccountsForCustomer(data.payload.data)
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchCustomer()
		fetchAccounts()
	}, [])

	if (!userId) return route.back()

	return (
		<div className='page-container'>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			
			{!isLoading && (
				<>
					<div className="mb-20">
						<h1 className="mb-10">Customer</h1>
						<UpdateCustomerForm customer={customer} />
					</div>

					<div >
						<h2 className="mb-10">Customer Accounts</h2>
						<div className="alert alert-info">
							<span>TODO: Migrate Table component to use DataTable. Accounts: {accountsForCustomer.length}</span>
						</div>
					</div>
				</>
			)}


		</div>
	)
}

export default Page
