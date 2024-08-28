'use client'
import React, { useState, useEffect } from 'react'
import { TableColumn } from '@/interfaces/Table'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Table from '@/common/table'
import API from '@/services/api'
import Company from '@/src/classes/Company'
import { toast } from 'react-toastify'
import Routes from '@/services/routes'

const Page = () => {
	const [tables, setTables] = useState<Company[]>([])
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
				setTables((data.payload as Company[]) || [])
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

	const columns: TableColumn<Company>[] = [
		{
			name: 'name',
			label: 'Name',
			content: (user: Company) => <>{user.name}</>,
		},
		{
			name: 'email',
			label: 'Email',
		},
		{
			name: 'createdAt',
			label: 'Date Created',
			content: (customer: Company) => <>{format(new Date(customer.createdAt), 'MM/dd/yyyy')}</>,
		},
		{
			name: 'id',
			label: 'actions',
			content: (customer: Company) => (
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
		<div className='page-container'>
			<div className='page-header'>
				<h2 className='page-title'>Customers</h2>
			</div>
			<button onClick={createCustomer}>Create</button>

			<Table<Company> columns={columns} data={tables} />
		</div>
	)
}

export default Page
