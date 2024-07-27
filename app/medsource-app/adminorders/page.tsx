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
import ServerTable from '@/src/common/ServerTable'
import {OrderStatusName, OrderStatusVariants} from '@/classes/EnumsTranslations'
import Pill from '@/src/components/Pill'

const Page = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()
	const searchCriteria = new GenericSearchFilter({
		sortBy: 'CreatedAt',
		sortOrder: 'desc',
		includes: ['Customer'],
	
	})

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
	type Variant = 'info' | 'success' | 'error' | 'warning';

	const columns: TableColumn<Order>[] = [
		{
			name:"id",
			label: 'Order #',
			content: (order) => (
				<Link href={`${Routes.InternalAppRoute}/adminorders/${order.id}`}>
					{order.id}
				</Link>
			),
		},
		{
			name: 'customer',
			label: 'Customer',
			content: (order) => (
				<Link href={`${Routes.InternalAppRoute}/adminorders/${order.id}`} style={{fontWeight: 800}}>
					{order.customer?.name}
				</Link>
			),
		},
		{
			name: 'status',
			label: 'Order Status',
			content: (order) => (
				<div className='flex flex-row '>
					<span>
						<Pill text={OrderStatusName[order.status]} variant={OrderStatusVariants[order.status] as Variant}/>
					</span>
				</div>
			)
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
		<div className='page-container Orders'>
			<div className='page-header'>
				<h2 className='page-title'>Manage Orders</h2>
				<button className='mt-7' onClick={() => route.push('adminorders/create')}>
					Create Order
				</button>
			</div>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<ServerTable
					columns={columns}
					methodToQuery = {API.Orders.search}
					searchCriteria = {searchCriteria}
				/>
			)}
		</div>
	)
}

export default Page
