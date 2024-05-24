'use client'
import Quote from '@/classes/Quote'
import IsBusyLoading from '@/src/components/isBusyLoading'
import API from '@/src/services/api'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
	const params = useParams()
	const route = useRouter()
	const [quote, setQuote] = useState<Quote | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const getQuote = async (id: string) => {
		try {
			setIsLoading(true)
			const { data } = await API.Quote.get<Quote>(id)

			if (data.statusCode == 200 && data.payload) {
				setQuote(data.payload)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	const createOrderFromQuote = async () => {
		setIsLoading(true)
		try {
			const {data } = await API.Orders.createFromQuote<Quote>(params.id as string)

			if (data.payload) {
				route.push(`/employee-dashboard/orders/${data.payload.id}`)
			}
		} catch(err ){
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (params.id) {
			getQuote(params.id as string)
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
				<h2 className='page-title'>Quote</h2>
				<button onClick={() => route.back()}>Go back</button>
				<button onClick={createOrderFromQuote}> Create Order</button>
				{quote && (
					<div>
						<h4>{quote.name}</h4>
						<p>{quote.contactName}</p>
						<p>{quote.emailAddress}</p>
						<p>{quote.phoneNumber}</p>
						<p>{quote.typeOfBusiness}</p>

						<p>{quote.description}</p>
					</div>
				)}
			</div>
		)
	}
}

export default Page
