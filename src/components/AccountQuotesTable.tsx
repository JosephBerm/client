'use client'

import React from 'react'
import { InternalRouteType } from '@/src/classes/Enums'
import { TableColumn } from '@/src/interfaces/Table'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Quote from '@/src/classes/Quote'
import Routes from '@/src/services/routes'
import Table from '@/src/common/table'
import API from '@/src/services/api'
import { toast } from 'react-toastify'

export default function AccountQuotesTable() {
	const router = useRouter()
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	useEffect(() => {
		const fetchLatestQuotes = async () => {
			try {
				const { data: res } = await API.Quotes.getLatest()
				if (res.statusCode === 200 && res.payload) {
					console.log('responsee sayss', res)
					const quotes = res.payload.map((quote: Quote) => new Quote(quote))
					setQuotes(quotes)
				} else {
					throw Error(res.message ?? 'Error Retrieving Quotes')
				}
			} catch (err: any) {
				toast.error(err.message)
				console.error(err)
			} finally {
				setIsLoading(true)
			}
		}
		fetchLatestQuotes()
	}, [])

	const handleRouteToQuote = (quote: Quote) => () => {
		router.push(Routes.getInternalRouteByValue(InternalRouteType.Quotes).location + '/' + quote.id)
	}
	const QuotesColumns: TableColumn<Quote>[] = [
		{
			name: 'name',
			label: 'Customer Name',
			content: (quote: Quote) => (
				<span className='order-id'>
					{quote.name.first} {quote.name.last}
				</span>
			),
		},
		{
			name: 'createdAt',
			label: 'Date Created',
			content: (quote: Quote) => (
				<div className='createdAt'>
					<span className='date'>{quote.createdAt.toLocaleDateString()}</span>
				</div>
			),
		},
		{
			name: 'status',
			label: 'Status',
			content: (quote: Quote) => (
				<div className='total'>
					<span className='price'>{quote.status}</span>
				</div>
			),
		},
		{
			label: 'Edit',
			content: (quote: Quote) => (
				<button onClick={handleRouteToQuote(quote)}>
					Edit
				</button>
			),
		},
	]
	return (
		<div className='AccountQuotesTable'>
			<h2 className='page-title'>Quotes</h2>

			{quotes.length !== 0 ? (
				<div className='table-container'>
					<Table<Quote> columns={QuotesColumns} data={quotes} />
				</div>
			) : (
				<div className='no-quotes-container flex flex-col items-center'>There are no new quotes.</div>
				// delete .no-option
			)}
		</div>
	)
}
