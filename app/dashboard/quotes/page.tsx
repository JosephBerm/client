'use client'

import React, { useState, useEffect } from 'react'
import Quote from '@/classes/Quote'
import { TableColumn } from '@/interfaces/TableColumn'
import { toast } from 'react-toastify'
import API from '@/services/api'
import IsBusyLoading from '@/components/isBusyLoading'
import Table from '@/common/table'
import Link from 'next/link'

const Page = () => {
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const getQuotes = async () => {
		try {
			setIsLoading(true)
			const { data } = await API.Quote.get<Quote[]>(null)

			if (data.statusCode == 200 && data.payload) {
				setQuotes(data.payload)
			}
		} catch (err) {
			console.error(err)
			toast.error('Unable to retrieve the list of quotes at the moment.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleQuoteDeletion = async (id: string) => {
		const originalList = [...quotes]
		try {
			setIsLoading(true)

			const toDelete = originalList.findIndex((quote) => quote.id === id)
			if (toDelete < 0) return

			const newList = originalList.toSpliced(toDelete, 1)
			setQuotes(newList)

			const { data } = await API.Quote.delete(id)
			console.log('data', data)
			if (data.statusCode != 200) {
				throw Error(data.message ?? 'Item Not Found.')
			}
		} catch (err) {
			toast.error('Unable to delete item.')
			setQuotes(originalList)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		getQuotes()
	}, [])

	const columns: TableColumn<Quote>[] = [
		{
			path: 'name',
			label: 'Name',
		},
		{
			path: 'contactName',
			label: 'Contact Name',
		},
		{
			path: 'phoneNumber',
			label: 'Phone Number',
		},
		{
			key: 'edit',
			label: 'Edit',
			content: (quote) => <Link href={`/dashboard/quotes/${quote.id}`}>Edit</Link>,
		},
		{
			key: 'delete',
			label: 'Delete',
			content: (product) => <button onClick={() => handleQuoteDeletion(product.id!)}>Delete</button>,
		},
	]

	if (isLoading) {
		return (
			<div className='Quotes'>
				<h2 className='page-title'>Quotes</h2>
				<IsBusyLoading />
			</div>
		)
	} else {
		return (
			<div className='Quotes'>
				<h2 className='page-title'>Quotes</h2>

				<Table<Quote> data={quotes} columns={columns} isSortable={true} isPaged={true} isSearchable={true} />
			</div>
		)
	}
}

export default Page
