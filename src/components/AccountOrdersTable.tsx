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
import Table from '@/common/table'
import WealthyTable from '@/components/WealthyTable'
import { useRouter } from 'next/navigation'
import classNames from 'classnames'

function AccountOrdersTable() {
	const router = useRouter()
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
					<span className='date'>{order.createdAt.toLocaleDateString()}</span>
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
			if (User.customer?.id) {
				const { data } = await API.Orders.getFromCustomer(User.customer.id)
				if (!data.payload) throw data.message

				setOrders(data.payload.map((x) => new Order(x)))
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
	}, [User.customer?.id])

	// const lastFiveOrders = useMemo(() => {
	// 	return orders
	// 		.slice()
	// 		.sort((a, b) => compareDesc(a.createdAt, b.createdAt))
	// 		.slice(0, 5)
	// }, [orders])

	return (
		<div className={classNames({ AccountOrdersTable: true, empty: orders.length === 0 })}>
			{!isLoadingData && (
				<button className='mb-5' onClick={() => router.push(Routes.Store.location)}>
					<i className='fa-solid fa-plus' />
					<span className='ml-2'>New Request</span>
				</button>
			)}
			{orders.length !== 0 ? (
				<div className='table-container'>
					{/* <WealthyTable headers={['Order ID', 'Date', 'Total']} data={orders} /> */}
					<Table<Order> columns={columns} data={orders} />
				</div>
			) : (
				<div className='no-order-container flex flex-col items-center'>
					You currently have no orders placed.
					<Link className='inline-link' href={Routes.Store.location}>
						Place Your First Order Now!
					</Link>
				</div>
			)}
		</div>
	)
}

export default AccountOrdersTable
