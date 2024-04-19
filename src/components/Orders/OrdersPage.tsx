'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Product } from '@/classes/Product'
import { useParams, useRouter } from 'next/navigation'
import { SortColumn, TableColumn } from '@/interfaces/Table'
import Order, { OrderItem } from '@/classes/Order'

import API from '@/services/api'
import Table from '@/common/table'
import InputTextBox from '@/components/InputTextBox'
import IsBusyLoading from '@/components/isBusyLoading'
import InputNumber from '@/components/InputNumber'
import InputDropdown from '@/components/InputDropdown'

interface OrdersProps {
	order: Order
	products: Product[]
}

const OrdersPage = ({ order, products }: OrdersProps) => {
	const params = useParams()
	const route = useRouter()

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [product, setProduct] = useState<Product | null>(null)
	const [currentOrder, setCurrentOrder] = useState<Order>(order)

	useEffect(() => {}, [product, currentOrder.products])

	const hasProductInList = useMemo(() => {
		if (!product) return

		const productIdToAdd = product.id
		return currentOrder.products.some((item) => item.productId === productIdToAdd)
	}, [product, currentOrder.products])

	const updateOrder = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Orders.update(currentOrder)

			if (data.statusCode == 200) {
				route.push('/dashboard/orders')
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}
	const handleQuantityChange = (orderItem: OrderItem, quantity: number) => {
		setCurrentOrder((prev) => {
			const newOrder: Order = JSON.parse(JSON.stringify(prev))

			const index = newOrder.products.findIndex((p) => {
				return p.product?.id === orderItem.product?.id
			})
			if (index >= 0) {
				newOrder.products[index].quantity = quantity
			}

			return newOrder
		})
	}
	const handlePriceChange = (orderItem: OrderItem, price: number) => {
		setCurrentOrder((prev) => {
			const newOrder: Order = JSON.parse(JSON.stringify(prev))

			const index = newOrder.products.findIndex((p) => {
				return p.product?.id === orderItem.product?.id
			})
			if (index >= 0) {
				newOrder.products[index].sellPrice = price
			}

			return newOrder
		})
	}
	const handleSelectProduct = (productId: string) => {
		const product = products.find((p) => p.id == productId)
		if (product) setProduct(product)
	}
	const handleAddingProduct = () => {
		if (!product) return

		if (hasProductInList) {
			// Product is already in the order, do not add again
			return
		}

		const productToAdd = new OrderItem()
		productToAdd.product = product
		productToAdd.productId = product.id
		productToAdd.quantity = 1

		setCurrentOrder((current) => {
			const newOrder = new Order({ ...current })
			newOrder.products.push(productToAdd)
			newOrder.total += productToAdd.product?.price ?? 0
			return newOrder
		})

		setProduct(null)
	}

	const getSelectedProducts = (): Product[] => {
		return currentOrder.products
			.filter((product) => !!product.product)
			.map((orderItem) => orderItem.product as Product)
	}

	const columns: TableColumn<OrderItem>[] = [
		{
			key: 'product',
			label: 'Product Name',
			content: (orderItem) => <span>{orderItem.product?.name}</span>,
		},
		{
			key: 'quantity',
			label: 'Quantity',
			content: (orderItem) => (
				<InputNumber
					label=''
					value={orderItem.quantity.toString()}
					handleChange={(e: string) => handleQuantityChange(orderItem, parseInt(e))}
				/>
			),
		},
		{
			key: 'buyPrice',
			label: 'Price',
			content: (orderItem) => (
				<InputNumber
					label=''
					value={orderItem.buyPrice.toString()}
					handleChange={(e: string) => handlePriceChange(orderItem, parseInt(e))}
				/>
			),
		},
	]

	return (
		<div className='orders-page'>
			<h3 className='page-title'>Order Details</h3>

			<Table<OrderItem>
				columns={columns}
				data={currentOrder.products}
				isSortable={true}
				isSearchable={true}
				isPaged={true}
			/>

			<div className='add-product-container'>
				<InputDropdown<Product>
					options={products}
					display='name'
					label='Add Product To Order'
					value={product?.id ?? ''}
					handleChange={handleSelectProduct}
					placeholder='Select a Product'
					customClass='primary'
					filterIfSelected={getSelectedProducts}
				/>
				<button
					disabled={!product || hasProductInList}
					onClick={() => handleAddingProduct()}
					className='responsive-icon'>
					<span>Add Product</span>
					<i className='fa-solid fa-plus' />
				</button>
			</div>

			<div className='buttons-container'>
				<button className='error' onClick={() => route.back()}>
					Back
				</button>
				<button onClick={updateOrder}>Save</button>
			</div>
		</div>
	)
}

export default OrdersPage
