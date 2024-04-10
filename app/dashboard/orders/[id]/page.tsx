'use client'
import Quote from '@/classes/Quote'
import Order, { OrderItem } from '@/src/classes/Order'
import InputNumber from '@/src/components/InputNumber'
import InputTextBox from '@/src/components/InputTextBox'
import IsBusyLoading from '@/src/components/isBusyLoading'
import API from '@/src/services/api'
import { useParams, useRouter } from 'next/navigation'
import { Input } from 'postcss'
import React, { useEffect, useState } from 'react'

const Page = () => {
	const params = useParams()
	const route = useRouter()
	const [order, setOrder] = useState<Order>(new Order({}))
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const updateOrder = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Orders.update(order)

			if (data.statusCode == 200) {
				route.push('/dashboard/orders')
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const getOrder = async (id: string) => {
		if (id == "create") return;

		try {
			setIsLoading(true)
			const { data } = await API.Orders.get<Order>(parseInt(id))

			if (data.statusCode == 200 && data.payload) {
				console.log(new Order(data.payload))
				setOrder(new Order(data.payload))
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleQuantityChange = (orderItem: OrderItem, quantity: number) =>{
		setOrder((prev) => {
			const newOrder: Order = JSON.parse(JSON.stringify(prev));
			
			const index = newOrder.products.findIndex((p) => {
				return p.product?.id === orderItem.product?.id;
			});
			if (index >= 0) {
				newOrder.products[index].quantity = quantity
			}

			return newOrder
		})
	}
	const handlePriceChange = (orderItem: OrderItem, price: number) =>{
		setOrder((prev) => {
			const newOrder: Order = JSON.parse(JSON.stringify(prev));
			
			const index = newOrder.products.findIndex((p) => {
				return p.product?.id === orderItem.product?.id;
			});
			if (index >= 0) {
				newOrder.products[index].sellPrice = price
			}

			return newOrder
		})
	}

	useEffect(() => {
		if (params.id) {
			getOrder(params.id as string)
		}
	}, [])

	if (isLoading)
		return (
			<div className='EditQuoteForm'>
				<h2 className='page-title'>Quote</h2>
				<IsBusyLoading />
			</div>
		)
	else {
		return (
			<div className='EditQuoteForm'>
					{order && (
						<div>
							<h4 style={{marginBottom: 25}}>Order ID: {order.id}</h4>
							{order.products.map((orderItem) => (
								<div key={orderItem.product?.id} className='flex items-center gap-10 max-w-screen-md' >
									<div className="m-2 min-w-96" >
										<label>Product Name</label>
										<p>
											{orderItem.product?.name} 
										</p>
									</div>
											
									<InputTextBox 
										label="Quantity" 
										type="number" 
										value={orderItem.quantity.toString()} 
										handleChange={(e:string) => handleQuantityChange(orderItem, parseInt(e))} 
									/>
									
									<InputTextBox 
											label="Price US$" 
											type="number" 
											value={orderItem.sellPrice.toString()} 
											handleChange={(e:string) => handlePriceChange(orderItem, parseFloat(e))} 
											/>
								</div>
							))}
						</div>
					)}

					<div style={{marginTop: 50, display:'flex', gap: 25}}>
						<button onClick={() => route.back()}>Back</button>
						<button  onClick={updateOrder}>Save</button>
					</div>
				</div>
			)
	}
}

export default Page
