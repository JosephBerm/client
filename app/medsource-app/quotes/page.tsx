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
import { useRouter } from 'next/navigation'
import ServerTable from '@/src/common/ServerTable'
import {format} from 'date-fns'

const Page = () => {
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()
	const searchCriteria = new GenericSearchFilter({
		sortBy: 'CreatedAt',
		sortOrder: 'desc',
	
	})

	

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

	const columns: TableColumn<Quote>[] = [
		{
			name: 'name',
			label: 'Name',
			content: (quote) => (
				<Link href={`${Routes.InternalAppRoute}/quotes/${quote.id}`}>
					{quote.companyName}
				</Link>
			),
		},
		{
			name: 'phoneNumber',
			label: 'Phone Number',
			content: (quote) => <p>{quote.phoneNumber}</p>,
		},
		{
			key: 'delete',
			label: 'Actions',
			content: (quote) => (
				<div className='flex gap-5'>
					<button
						onClick={() => {
							route.push(`${Routes.InternalAppRoute}/quotes/${quote.id}`)
						}}>

							Edit
						</button>
					<button className='delete' onClick={() => handleQuoteDeletion(quote.id!)}>
						Delete
					</button>
				</div>
			),
		},
		{
			key: 'createdAt',
			label: 'Date Created',
			content: (quote) => <p>
				{format(quote.createdAt, 'PPP') ?? ""}
			</p>
		},
	]

	return (
		<div className='page-container Quotes'>
			<div className='page-header'>
				<h2 className='page-title'>Quotes</h2>
			</div>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<ServerTable<Quote> 						
				columns={columns}
				methodToQuery = {API.Quotes.search}
				searchCriteria = {searchCriteria}
				/>
			)}
		</div>
	)
}

export default Page
