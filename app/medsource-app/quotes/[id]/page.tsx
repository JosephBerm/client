'use client'
import Quote from '@/classes/Quote'
import IsBusyLoading from '@/components/isBusyLoading'
import API from '@/services/api'
import Routes from '@/services/routes'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import  { format } from 'date-fns'

const Page = () => {
	const params = useParams()
	const route = useRouter()
	const [quote, setQuote] = useState<Quote | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const getQuote = async (id: string) => {
		try {
			setIsLoading(true)
			const { data } = await API.Quotes.get<Quote>(id)

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
			const { data } = await API.Orders.createFromQuote<Quote>(params.id as string)

			if (data.payload) {
				route.push(`${Routes.InternalAppRoute}/orders/${data.payload.id}`)
			}
		} catch (err) {
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


	return (
		<div className='page-container EditQuoteForm'>
			<h2 className='page-title'>Quote</h2>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<div className='buttons-container'>
					<div className="w-full flex justify-between mb-10 mt-10">
						<button onClick={() => route.back()}>Go back</button>
						<button onClick={createOrderFromQuote}>Create Order</button>
					</div>
					{quote && (
						<div>
							<h4>{(quote.name.first?.toUpperCase() ?? "" )+ " "+ (quote.name.last?.toUpperCase() ?? "")}</h4>
							<p className="font-bold">{quote.emailAddress}</p>
							<p>{quote.phoneNumber}</p>
							<p >{quote.description}</p>
							<p className="text-sm">{format(quote.createdAt, 'PPP')}</p>
						</div>
					)}

					{quote && quote.products && (
						<div className="mt-10">
							<h4 className="text-lg font-semibold mb-4">Products</h4>
							<div className="space-y-2">
								{quote.products.map((productEntry) => (
									<div key={productEntry.product?.id ?? ""} className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg justify-between">
										<p className="font-medium">SKU: <span className="font-normal">{productEntry.product?.sku}</span></p>
										<span>-</span>
										<p className="font-medium"><span className="font-normal">{productEntry.product?.name ?? "N/A"}</span></p>
										<span>-</span>
										<p className="font-medium">Quantity: <span className="font-normal">{productEntry.quantity ?? "N/A"}</span></p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default Page
