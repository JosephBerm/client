'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import API from '@/services/api'
import IsBusyLoading from '@/components/isBusyLoading'
import Link from 'next/link'
import Order from '@/classes/Order'
import { useRouter } from 'next/navigation'
import Routes from '@/services/routes'
import OrderSummary from '@/src/components/OrderSummary'

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

	useEffect(() => {
		getOrders()
	}, [])

	return (
		<div className='Quotes page-container'>
			<h2 className='page-title'>Orders</h2>
			{isLoading ? (
				<IsBusyLoading />
			) : (
				<div className='orders-table'>
					<button onClick={() => router.push('orders/create')}> Create</button>
					{orders.map((order) => (
						<OrderSummary order={order} key={order.id} />
					))}
				</div>
			)}
		</div>
	)
}

export default Page
