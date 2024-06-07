'use client'

import React, { useState, useEffect } from 'react'
import Quote from '@/classes/Quote'
import { TableColumn } from '@/interfaces/Table'
import { toast } from 'react-toastify'
import API from '@/services/api'
import IsBusyLoading from '@/components/isBusyLoading'
import Table from '@/common/table'
import Link from 'next/link'
import Routes from '@/services/routes'
import { GenericSearchFilter } from '@/src/classes/Base/GenericSearchFilter'

const Page = () => {
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const getQuotes = async () => {
		try {
			setIsLoading(true)
			const searchCriteria = new GenericSearchFilter()
			
			const { data } = await API.Quotes.search(searchCriteria)
			// const { data } = await API.Quotes.getAll<Quote[]>()

			if (data.statusCode == 200 && data.payload) {
				setQuotes(data.payload?.data ?? [])
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

			const { data } = await API.Quotes.delete(id)
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
			name: 'name',
			label: 'Name',
		},
		{
			name: 'contactName',
			label: 'Contact Name',
		},
		{
			name: 'phoneNumber',
			label: 'Phone Number',
		},
		{
			key: 'edit',
			label: 'Edit',
			content: (quote) => <Link href={`${Routes.InternalAppRoute}/quotes/${quote.id}`}>Edit</Link>,
		},
		{
			key: 'delete',
			label: 'Delete',
			content: (product) => (
				<button className='delete' onClick={() => handleQuoteDeletion(product.id!)}>
					Delete
				</button>
			),
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
