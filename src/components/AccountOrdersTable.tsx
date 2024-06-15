'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { useAccountStore } from '@/src/stores/user'
import { parseISO, compareDesc } from 'date-fns'
import { TableColumn } from '@/interfaces/Table'
import { toast } from 'react-toastify'

import Link from 'next/link'
import Routes from '@/services/routes'

import API from '@/services/api'
import Order from '@/classes/Order'
import Table from '../common/table'

function AccountOrdersTable() {
	const User = useAccountStore((state) => state.User)
	const [isLoadingData, setIsLoadingData] = useState<boolean>(false)
	const [orders, setOrders] = useState<Order[]>([])
	const columns: TableColumn<Order>[] = [
		{
			name: 'id',
			label: 'Order ID',
			content: (order: Order) => (
				<Link href={`${Routes.Orders.location}/${order.id}`}>
					<span className='order-id'>Order #{order.id}</span>
				</Link>
			),
		},
		{
			name: 'createdAt',
			label: 'Date',
			content: (order: Order) => (
				<div className='createdAt'>
					{/* <span className='date'>{order.createdAt.toLocaleDateString()}</span> */}
				</div>
			),
		},
		{
			name: 'total',
			label: 'Total',
			content: (order: Order) => (
				<div className='total'>
					<span className='price'>{order.total.toFixed(2)}</span>
				</div>
			),
		},
	]
	const getOrders = async (isInitialLoad: boolean = true) => {
		try {
			setIsLoadingData(true)
			if (User.customer) {
				const { data } = await API.Orders.getByCustomerId(User.customer?.id)
				if (!data.payload) throw data.message

				console.log('data.payload', data.payload)
				setOrders(data.payload)
			}
		} catch (error: unknown) {
			if (typeof error === 'string') {
				toast.error(error)
			}
			console.error(error)
		} finally {
			setIsLoadingData(false)
		}
	}
	useEffect(() => {
		getOrders()
	}, [])

	const lastFiveOrders = useMemo(() => {
		return orders
			.slice()
			.sort((a, b) => compareDesc(a.createdAt, b.createdAt))
			.slice(0, 5)
	}, [orders])

	return (
		<div className='recent-orders-table'>
			{lastFiveOrders.length !== 0 && <Table data={lastFiveOrders} columns={columns} />}
		</div>
	)
}

export default AccountOrdersTable
