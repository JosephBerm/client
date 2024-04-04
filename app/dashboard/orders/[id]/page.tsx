'use client'
import Quote from '@/classes/Quote'
import Order from '@/src/classes/Order'
import IsBusyLoading from '@/src/components/isBusyLoading'
import API from '@/src/services/api'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
	const params = useParams()
	const route = useRouter()
	const [order, setOrder] = useState<Order>(new Order())
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const getOrder = async (id: string) => {
		if(id == "create") return;
		try {
			setIsLoading(true)
			const { data } = await API.Orders.get<Order>(parseInt(id))

			if (data.statusCode == 200 && data.payload) {
				setOrder(data.payload)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const getQuotes = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Quote.get<Quote[]>(null)

			if (data.statusCode == 200 && data.payload) {
				setQuotes(data.payload)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}
	// This methods gets and sets. Set method should be away
	const getQuote = async (id: string) => {
		try {
			setIsLoading(true)
			const { data } = await API.Quote.get<Quote>(id)

			if (data.statusCode == 200 && data.payload) {
				return data.payload;
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSelectQuote = async (event:React.FormEvent<HTMLSelectElement>) => {
		const response = await getQuote(event.currentTarget.value)

		if(response){
			order.CreateFromQuote(response)
			setOrder(order)
		}
	}

	useEffect(() => {
		if (params.id) {
			getOrder(params.id as string)
			getQuotes()
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
				<h2 className='page-title'>Order</h2>
				
				
								<select onChange={handleSelectQuote}>
									<option value="">Select</option>
									{quotes.map((quote) => (
										<option key={quote.id} value={quote.id}>
											{quote.name}
										</option>
									))}
								</select>

								{order && (
									<div>
										<h4>{order.id}</h4>
										{order.products.map((product) => (
											<div key={product.product?.id}>
												{product.product?.name} - {product.quantity}
											</div>
										))}
									</div>
								)}
							</div>
						)
	}
}

export default Page
