'use client'

import React, { useState, useEffect } from 'react'
import Order from '@/classes/Order'
import { TableColumn } from '@/interfaces/Table'
import { toast } from 'react-toastify'
import API from '@/services/api'
import IsBusyLoading from '@/components/isBusyLoading'
import Table from '@/common/table'
import Link from 'next/link'
import Routes from '@/services/routes'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'
import { useRouter } from 'next/navigation'

const Page = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()

	const getOrders = async () => {
		try {
			setIsLoading(true)
			const searchCriteria = new GenericSearchFilter()
			searchCriteria.includes = ['Customer']

			const { data } = await API.Orders.search(searchCriteria)
			// const { data } = await API.Orders.getAll<Order[]>()

			if (data.statusCode == 200 && data.payload) {
				setOrders(data.payload?.data ?? [])
			}
		} catch (err) {
			console.error(err)
			toast.error('Unable to retrieve the list of orders at the moment.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleOrderDeletion = async (id: number) => {
		const originalList = [...orders]
		try {
			setIsLoading(true)

			const toDelete = originalList.findIndex((order) => order.id === id)
			if (toDelete < 0) return

			const newList = originalList.toSpliced(toDelete, 1)
			setOrders(newList)

			const { data } = await API.Orders.delete(id)
			if (data.statusCode != 200) {
				throw Error(data.message ?? 'Item Not Found.')
			}
		} catch (err) {
			toast.error('Unable to delete item.')
			setOrders(originalList)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		getOrders()
	}, [])

	const columns: TableColumn<Order>[] = [
		{
			name:"id",
			label: 'Order #',
			content: (order) => (
				<Link href={`${Routes.InternalAppRoute}/orders/${order.id}`}>
					{order.id}
				</Link>
			),
		},
		{
			name: 'customer',
			label: 'Customer',
			content: (order) => (
				<Link href={`${Routes.InternalAppRoute}/orders/${order.id}`}>
					{order.customer?.name}
				</Link>
			),
		},
		{
			name: 'status',
			label: 'Order Status',
		},
		{
			key: 'delete',
			label: 'Delete',
			content: (product) => (
				<button className='delete' onClick={() => handleOrderDeletion(product.id!)}>
					Delete
				</button>
			),
		},
	]

	return (
		<div className='Orders'>
			<div className='page-header'>
				<h2 className='page-title'>Manage Orders</h2>
				<button className='mt-7' onClick={() => route.push('adminorders/create')}>
					Create Order
				</button>
			</div>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<Table<Order> data={orders} columns={columns} isSortable={true} isPaged={true} isSearchable={true} />
			)}
		</div>
	)
}

export default Page
