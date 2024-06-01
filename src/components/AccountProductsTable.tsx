'use client'
import { useAccountStore } from '@/src/stores/user'
import React, { useEffect, useState } from 'react'
import Quote from '@/classes/Quote'
import API from '@/services/api'
import { toast } from 'react-toastify'
import CustomerSummary from '@/classes/Base/CustomerSummary'

function AccountProductsTable() {
	const User = useAccountStore((state) => state.User)
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [summary, setSummary] = useState<CustomerSummary>(new CustomerSummary({}))
	const [loadingSummary, setLoadingSummary] = useState<boolean>(false)

	const getQuotes = async () => {
		try {
			const { data } = await API.Quotes.getAll<Quote[]>()
			const allQuotes = data.payload
			if (allQuotes) setQuotes(allQuotes)
			else if (data.message) {
				toast.error(data.message)
			}
		} catch (err: any) {
			console.warn(err)
			toast.error(err)
		}
	}

	const fetchSummary = async () => {
		try {
			setLoadingSummary(true)
			const { data } = await API.Accounts.getDashboardSummary()
			if (data?.payload) setSummary(new CustomerSummary(data.payload))

		} catch (err: any) {
			console.warn(err)
			toast.error(err)
		} finally {
			setLoadingSummary(false)
		}
	}
	/*
		Table that shows all the products that have been requested in the past.
		Allow to filter this table to show Fulfilled, UnFulfilled, Requested Quote, In-Transit, In-Process, ...?
	*/

	useEffect(() => {
		getQuotes()
		fetchSummary()
	}, [])
	return <div className='recent-orders-table'></div>
}

export default AccountProductsTable
