'use client'
import Order, { OrderItem } from '@/classes/Order'
import { Product } from '@/classes/Product'
import InputTextBox from '@/components/InputTextBox'
import IsBusyLoading from '@/components/isBusyLoading'
import API from '@/services/api'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import InputNumber from '@/components/InputNumber'
import Table from '@/common/table'
import { SortColumn, TableColumn } from '@/interfaces/Table'

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
	const handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const productId = e.target.value
		const product = products.find((p) => p.id == productId)
		setProduct(product || null)
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
		<div className='EditQuoteForm'>
			<h4 style={{ marginBottom: 25 }}>Order Details</h4>
			<div>
				<select onChange={handleSelectProduct}>
					<option disabled value=''>
						Select a product
					</option>
					{products.map((product, index) => (
						<option key={index} value={product.id}>
							{product.name}
						</option>
					))}
				</select>
				<button>Add Product</button>
			</div>

			<Table<OrderItem>
				columns={columns}
				data={currentOrder.products}
				isSortable={true}
				isSearchable={true}
				isPaged={true}
			/>

			<div style={{ marginTop: 50, display: 'flex', gap: 25 }}>
				<button onClick={() => route.back()}>Back</button>
				<button onClick={updateOrder}>Save</button>
			</div>
		</div>
	)
}

export default OrdersPage
