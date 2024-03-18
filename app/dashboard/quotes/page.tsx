'use client'

import React, { useState, useEffect } from 'react'
import Quote from '@/classes/Quote'
import { useRouter } from 'next/navigation'
import API from '@/services/api'
import IsBusyLoading from '@/components/isBusyLoading'

const Page = () => {
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const router = useRouter()

	const getQuotes = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.quote.get<Quote[]>(null)

			if (data.statusCode == 200 && data.payload) {
				setQuotes(data.payload)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		getQuotes()
	}, [])

	if (isLoading) {
		return (
			<div className='Quotes'>
				<h3 className='page-title'>Quotes</h3>
				<IsBusyLoading />
			</div>
		)
	} else {
		return (
			<div className='Quotes'>
				<h3 className='page-title'>Quotes</h3>

				{quotes.map((quote, index) => (
					<div key={index}>
						<h4>{quote.name}</h4>
						<p>{quote.contactName}</p>

						<button onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}>View</button>

						<hr />
					</div>
				))}
			</div>
		)
	}
}

export default Page
