'use client'
import React, { useState, useEffect } from 'react'
import API from '@/src/services/api'
import UpdateAccountForm from '@/src/components/UpdateAccountForm'
import { useRouter, useParams } from 'next/navigation'
import '@/styles/accounts.css'
import Customer from '@/src/classes/Customer'
import UpdateCustomerForm from '@/src/components/UpdateCustomerForm'
import User from '@/src/classes/User'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'
import Table from '@/src/common/table'
import { TableColumn } from '@/src/interfaces/Table'
import { format } from 'date-fns'
import Routes from '@/src/services/routes'

const Page = () => {
	const params = useParams()

	const [customer, setCustomer] = useState<Customer>(new Customer({}))
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
				setCustomer(data.payload as Customer)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const fetchAccounts = async () => {
		console.log("AA")
		if (userId == "create") return;
		const params = new GenericSearchFilter()
		
		console.log("aa", typeof userId)
		if(typeof userId != "string") return;
		params.add("CustomerId", userId)

		setIsLoading(true)
		try {
			const { data } = await API.Accounts.search(params)
			console.log("XXX", data)
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

	const columns: TableColumn<User>[] = [
		{
			name: 'firstName',
			label: 'Name',
			content: (user: User) => (
				<>
					{user.firstName} {user.lastName}
				</>
			),
		},
		{
			name: 'email',
			label: 'Email',
		},
		{
			name: 'createdAt',
			label: 'Date Created',
			content: (user: User) => <>{format(new Date(user.createdAt), 'MM/dd/yyyy')}</>,
		},
		{
			name: 'id',
			label: 'actions',
			content: (user: User) => (
				<div className='flex gap-5'>
					<button
						onClick={() => {
							route.push(`${Routes.InternalAppRoute}/accounts/${user.id}`)
						}}>
						Edit
					</button>
					<button className='delete'>Delete</button>
				</div>
			),
		},
	]

	return (
		<div>
			<button className='mb-10' onClick={() => route.back()}>
				Back
			</button>
			
			{!isLoading && (
				<>
					<div className="mb-20">
						<h1 className="mb-10">Customer</h1>
						<UpdateCustomerForm customer={customer} />
						{/* <UpdateAccountForm user={user} /> */}
					</div>

					<div >
						<h2 className="mb-10">Customer Accounts</h2>
						<Table<User>
							data={accountsForCustomer}
							columns={columns}
							/>
					</div>
				</>
			)}


		</div>
	)
}

export default Page
