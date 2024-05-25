'use client'
import React, { useState, useEffect } from 'react'
import { TableColumn } from '@/interfaces/Table'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Table from '@/common/table'
import API from '@/services/api'
import '@/styles/accounts.css'
import Customer from '@/src/classes/Customer'
import { toast } from 'react-toastify'
import Routes from '@/services/routes'

const Page = () => {
	const [tables, setTables] = useState<Customer[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()

	const createCustomer = async () => {
		route.push(`${Routes.InternalAppRoute}/customers/create`)
	}

	const fetchCustomers = async () => {
		try {
			const { data } = await API.Customers.getAll()
			if (data.payload) {
				//TODO: FIX as cuustomerarray
				setTables((data.payload as Customer[]) || [])
			}
		} finally {
			setIsLoading(true)
		}
	}

	const deleteCompany = async (id: number) => {
		try {
			setIsLoading(true)
			const { data } = await API.Customers.delete(id)
			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)
			fetchCustomers()
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchCustomers()
	}, [])

	const columns: TableColumn<Customer>[] = [
		{
			name: 'name',
			label: 'Name',
			content: (user: Customer) => <>{user.name}</>,
		},
		{
			name: 'email',
			label: 'Email',
		},
		{
			name: 'createdAt',
			label: 'Date Created',
			content: (customer: Customer) => <>{format(new Date(customer.createdAt), 'mm/dd/yyyy')}</>,
		},
		{
			name: 'id',
			label: 'actions',
			content: (customer: Customer) => (
				<div className='flex gap-5'>
					<button
						onClick={() => {
							route.push(`${Routes.InternalAppRoute}/customers/${customer.id}`)
						}}>
						Edit
					</button>
					<button className='delete' onClick={() => deleteCompany(customer.id!)}>
						Delete
					</button>
				</div>
			),
		},
	]

	return (
		<div className='accounts-page-container'>
			<h1 style={{ alignSelf: 'flex-start', margin: 0 }}>Customers</h1>
			<button onClick={createCustomer}>Create</button>

			<Table<Customer> columns={columns} data={tables} />
		</div>
	)
}

export default Page
