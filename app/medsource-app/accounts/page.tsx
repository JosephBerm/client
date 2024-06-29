'use client'
import React, { useState, useEffect } from 'react'
import User from '@/classes/User'
import { TableColumn } from '@/interfaces/Table'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Table from '@/common/table'
import API from '@/services/api'
import Routes from '@/services/routes'

const Page = () => {
	const [tables, setTables] = useState<User[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()

	const fetchAccounts = async () => {
		try {
			const { data } = await API.Accounts.getAll()
			setTables(data.payload || []) // Handle null case by providing an empty array as the default value
		} finally {
			setIsLoading(true)
		}
	}

	useEffect(() => {
		fetchAccounts()
	}, [])

	const columns: TableColumn<User>[] = [
		{
			name: 'username',
			label: 'Username',
			content: (user: User) => (
				<>
					{user.username}
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
		<div className='page-container'>
			<div className='page-header'>
				<h2 className='page-title'>Accounts</h2>
			</div>
			<button onClick ={() => route.push("accounts/create")}>
				Create
			</button>

			<Table<User> columns={columns} data={tables} />
		</div>
	)
}

export default Page
