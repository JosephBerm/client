'use client'

import React, { useState, useEffect } from 'react'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

import Routes from '@/services/routes'
import Order from '@/classes/Order'
import API from '@/services/api'
import Link from 'next/link'

import AccountOrdersTable from '@/src/components/AccountOrdersTable'
import OrderSummary from '@/src/components/OrderSummary'
import IsBusyLoading from '@/components/isBusyLoading'
import InputTextBox from '@/components/InputTextBox'

const Page = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [trackingNumber, setTackingNumber] = useState('')
	const router = useRouter()

	const getOrders = async () => {
		try {
			setIsLoading(true)
			const searchCriteria = new GenericSearchFilter()
			searchCriteria.includes = ['Products']

			const { data } = await API.Orders.search(searchCriteria)
			// const { data } = await API.Orders.get<Order[]>(null)

			if (data.statusCode == 200 && data.payload) {
				setOrders(data?.payload?.data ?? [])
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

	const redirectUser = () => {
		// window.open('')
	}

	return (
		<div className='Quotes page-container'>
			<h2 className='page-title'>Track Your Orders</h2>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<div className='orders-table'>
					{/* <div className='container-header'>
						<InputTextBox
							value={trackingNumber}
							type='text'
							icon='fa-solid fa-magnifying-glass'
							handleChange={(e) => setTackingNumber(e.currentTarget.value)}
							placeholder='# Order Number'
						/>
						<button onClick={() => redirectUser()}>Trace</button>
					</div> */}
					<div className='container-body mt-10'>
						{/* {orders.map((order) => (
							<OrderSummary order={order} key={order.id} />
						)) } */}
						<AccountOrdersTable />
					</div>
				</div>
			)}
		</div>
	)
}

export default Page
