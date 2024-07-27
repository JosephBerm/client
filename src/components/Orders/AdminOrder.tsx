'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import '@/styles/App/orderPage.css'

import API from '@/services/api'
import { Product } from '@/classes/Product'
import Order, { OrderItem } from '@/classes/Order'
import IsBusyLoading from '@/components/isBusyLoading'
import AdminOrdersPage from '@/components/Orders/AdminOrdersPage'
import Company from '@/src/classes/Company'
import Routes from '@/services/routes'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'

function AdminOrder(context: any) {
	const router = useRouter()

	const [order, setOrder] = useState<Order | null>(null)
	const [productsList, setProducts] = useState<Product[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [customers, setCustomers] = useState<Company[]>([])

	const getOrder = async () => {
		if (context.params.id == 'create') return
		try {
			setIsLoading(true)
			const { data } = await API.Orders.get(parseInt(context.params.id as string))
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
			const { data } = await API.Customers.getAll<Company>()
			if (!data.payload) toast.error('Unable to retrieve the list of available customers...')

			setCustomers(data.payload?.map((customer) => new Company(customer)) ?? [])
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const getProducts = async () => {
		try {
			setIsLoading(true)
			const searchCriteria = new GenericSearchFilter()
			searchCriteria.pageSize = 1000
			const { data } = await API.Store.Products.search(searchCriteria)

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
			const [orderData, productsListResponse] = await Promise.all([getOrder(), getProducts(), fetchCustomers()])

			setOrder(new Order(orderData ?? {}))
			setProducts(productsListResponse?.data?.map((x) => new Product(x)) ?? [])
		}

		fetchData()
	}, [])

	if (isLoading || !order) return <IsBusyLoading isBusy={true} />

	return (
		<div className='orders-page-container page-container'>
			<AdminOrdersPage products={productsList} order={order} customers={customers} />
		</div>
	)
}

export default AdminOrder
