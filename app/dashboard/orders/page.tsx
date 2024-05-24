'use client'

import React, { useState, useEffect } from 'react'
import Quote from '@/classes/Quote'
import { TableColumn } from '@/interfaces/Table'
import { toast } from 'react-toastify'
import API from '@/services/api'
import IsBusyLoading from '@/components/isBusyLoading'
import Table from '@/common/table'
import Link from 'next/link'
import Order from '@/src/classes/Order'
import { useRouter } from 'next/navigation'
import { formatNumber } from '@/src/services/utils'

const Page = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const router = useRouter()

	const getOrders = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Orders.get<Order[]>(null)

			if (data.statusCode == 200 && data.payload) {
				setOrders(data.payload)
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
			name: 'id',
			label: 'Order Number',
		},
		{
			name: 'total',
			label: 'Order Total',
			content: (order: Order) => <span>US$ {formatNumber(order.total)}</span>,
		},
		{
			key: 'edit',
			label: 'Edit',
			content: (order: Order) => (
				<Link className='inline-link' href={`/employee-dashboard/orders/${order.id}`}>
					Edit
				</Link>
			),
		},
		{
			key: 'delete',
			label: 'Delete',
			content: (order: Order) => (
				<button className='delete' onClick={() => handleOrderDeletion(order.id!)}>
					Delete
				</button>
			),
		},
	]

	if (isLoading) {
		return (
			<div className='Quotes'>
				<h2 className='page-title'>Orders</h2>
				<IsBusyLoading />
			</div>
		)
	} else {
		return (
			<div className='Quotes'>
				<h2 className='page-title'>Orders</h2>
				<button onClick={() => router.push('orders/create')}> Create</button>

				<Table<Order> data={orders} columns={columns} isSortable={true} isPaged={true} isSearchable={true} />
			</div>
		)
	}
}

export default Page
