'use client'
import React, { useEffect, useState } from 'react'
import { useAccountStore } from '@/src/stores/user'
import { TableColumn } from '@/interfaces/Table'
import { toast } from 'react-toastify'

import Link from 'next/link'
import Routes from '@/services/routes'

import Quote from '@/classes/Quote'
import API from '@/services/api'
import CustomerSummary from '@/classes/Base/CustomerSummary'
import Table from '../common/table'
import { GenericSearchFilter } from '../classes/Base/GenericSearchFilter'

function AccountProductsTable() {
	const User = useAccountStore((state) => state.User)
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [summary, setSummary] = useState<CustomerSummary>(new CustomerSummary({}))
	const [isLoadingData, setIsLoadingData] = useState<boolean>(false)

	const getQuotes = async () => {
		try {
			setIsLoadingData(true)
			const searchCriteria = new GenericSearchFilter()

			const { data } = await API.Quotes.search(searchCriteria)
			const allQuotes = data.payload?.data
			if (allQuotes) setQuotes(allQuotes)
			else if (data.message) {
				toast.error(data.message)
			}
		} catch (err: any) {
			console.warn(err)
			toast.error(err)
		} finally {
			setIsLoadingData(false)
		}
	}

	/*
		Table that shows all the products that have been requested in the past.
		Allow to filter this table to show Fulfilled, UnFulfilled, Requested Quote, In-Transit, In-Process, ...?
	*/

	useEffect(() => {
		getQuotes()
	}, [])

	const columns: TableColumn<Quote>[] = [
		{
			name: 'name',
			label: 'Name',
			content: (quote) => <Link href={`${Routes.InternalAppRoute}/quotes/${quote.id}`}>{quote.name?.first} {quote.name?.last}</Link>,
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
			key: 'status',
			label: 'Status',
			content: (quote) => <div className='quote-status'>{quote.status}</div>,
		},
	]

	return (
		<div className='recent-orders-table'>
			{!quotes.length ? <h2>No quotes have been made</h2> : <Table<Quote> columns={columns} data={quotes} />}
		</div>
	)
}

export default AccountProductsTable
