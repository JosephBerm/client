'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import '@/styles/App/orderPage.css'

import API from '@/services/api'
import { Product } from '@/classes/Product'
import Order, { OrderItem } from '@/classes/Order'
import IsBusyLoading from '@/components/isBusyLoading'
import OrdersPage from '@/components/Orders/OrdersPage'
import Customer from '@/classes/Customer'
import Routes from '@/services/routes'

const Page = (context: any) => {
	const router = useRouter()

	const [order, setOrder] = useState<Order | null>(null)
	const [productsList, setProducts] = useState<Product[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [customers, setCustomers] = useState<Customer[]>([])

	const getOrder = async () => {
		if (context.params.id == 'create') return
		try {
			setIsLoading(true)
			const { data } = await API.Orders.get<Order>(parseInt(context.params.id as string))
			if (!data.payload) toast.error(`Order with id #${context.params.id} not found!`)

			return data.payload
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchCustomers = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Customers.getAll<Customer>()
			if (!data.payload) toast.error('Unable to retrieve the list of available customers...')

			setCustomers(data.payload?.map((customer) => new Customer(customer)) ?? [])
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const getProducts = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Store.Products.getList<Product[]>()
			if (!data.payload) toast.error('Unable to retrieve the list of available products...')

			return data.payload
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			const [orderData, productsList] = await Promise.all([getOrder(), getProducts(), fetchCustomers()])

			if (!productsList) {
				setTimeout(() => {
					router.push(`${Routes.InternalAppRoute}/orders`)
				}, 3000)

				return
			}

			setOrder(new Order(orderData ?? {}))
			setProducts(productsList.map((x) => new Product(x)))
		}

		fetchData()
	}, [])

	if (isLoading || !order) return <IsBusyLoading />

	return (
		<div className='orders-page-container'>
			<OrdersPage products={productsList} order={order} customers={customers} />
		</div>
	)
}

export default Page
