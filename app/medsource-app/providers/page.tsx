'use client'
import React, { useState, useEffect } from 'react'
import { TableColumn } from '@/interfaces/Table'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import Table from '@/common/table'
import API from '@/services/api'
import Provider from '@/classes/Provider'
import Routes from '@/services/routes'

const Page = () => {
	const [tables, setTables] = useState<Provider[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()

	const createCustomer = async () => {
		route.push(`${Routes.InternalAppRoute}/providers/create`)
	}

	const fetchProviders = async () => {
		try {
			const { data } = await API.Providers.getAll()
			if (data.payload) {
				//TODO: FIX as providerarray
				setTables((data.payload as Provider[]) || [])
			}
		} finally {
			setIsLoading(true)
		}
	}

	const deleteProvider = async (id: number) => {
		try {
			setIsLoading(true)
			const { data } = await API.Providers.delete(id)
			if (data?.statusCode != 200) return toast.error(data.message)
			toast.success(data.message)
			fetchProviders()
		} catch (err: any) {
			toast.error(err.message)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchProviders()
	}, [])

	const columns: TableColumn<Provider>[] = [
		{
			name: 'name',
			label: 'Name',
			content: (user: Provider) => <>{user.name}</>,
		},
		{
			name: 'email',
			label: 'Email',
		},
		{
			name: 'createdAt',
			label: 'Date Created',
			content: (provider: Provider) => <>{format(provider.createdAt, 'mm/dd/yyyy')}</>,
		},
		{
			name: 'id',
			label: 'actions',
			content: (provider: Provider) => (
				<div className='flex gap-5'>
					<button
						onClick={() => {
							route.push(`${Routes.InternalAppRoute}/providers/${provider.id}`)
						}}>
						Edit
					</button>
					<button className='delete' onClick={() => deleteProvider(provider.id!)}>
						Delete
					</button>
				</div>
			),
		},
	]

	return (
		<div className='page-container'>
			<h1 style={{ alignSelf: 'flex-start', margin: 0 }}>providers</h1>
			<button onClick={createCustomer}>Create</button>

			<Table<Provider> columns={columns} data={tables} />
		</div>
	)
}

export default Page
