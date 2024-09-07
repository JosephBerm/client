'use client'

import React, { useState, useEffect } from 'react'
import FinanceNumbers from '@/classes/FinanceNumbers'
import API from '@/services/api'
import DatePicker from '@/src/components/DatePicker'
import FinanceSearchFilter from '@/src/classes/FinanceSearchFilter'
import 'react-calendar/dist/Calendar.css';

import '@/styles/pages/analytics.css'

function Page() {
	const [financeNumbers, setFinanceNumbers] = useState(new FinanceNumbers())
	const [filter, setFilter] = useState<FinanceSearchFilter>(new FinanceSearchFilter())
	const getFinanceNumbers = async () => {
		try {
			const { data } = await API.Finance.getFinanceNumbers()
			if (data.statusCode !== 200 || !data.payload)
				throw new Error(data?.message ?? 'An error occurred while fetching finance numbers')

			console.log('FINANCE NUMBERS', data.payload)
			setFinanceNumbers(new FinanceNumbers(data.payload))
		} catch (e) {
			console.error('Error fetching finance numbers', e)
		}
	}

	const search = async () => {
		try {
			const { data } = await API.Finance.searchFinnanceNumbers(filter)
			if (data.statusCode !== 200 || !data.payload)
				throw new Error(data?.message ?? 'An error occurred while fetching finance numbers')

			console.log('FINANCE NUMBERS', data.payload)
			setFinanceNumbers(new FinanceNumbers(data.payload))
		} catch (e) {
			console.error('Error fetching finance numbers', e)
		}
	}

	const download = async () => {
		try {
			const { data } = await API.Finance.downloadFinanceNumbers(filter)

			console.log(data)
			if(data == null) throw new Error('No data to download')
			const url = window.URL.createObjectURL(data)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', 'finance-numbers.csv')
			document.body.appendChild(link)
			link.click()
		} catch (e) {
			console.error('Error downloading finance numbers', e)
		}
	}


	useEffect(() => {
		getFinanceNumbers()
	}, [])

	return (
		<div className='page-container Analytics'>
			<div className='page-header'>
				<h2 className='page-title'>Analytics</h2>
			</div>

			<section className='orders'>
				<h4>Orders Figures</h4>
				<div className="date-range-container"> 
					<DatePicker
						label="From"
						onChange={(date) => setFilter({ ...filter, FromDate: date })}
						value={filter.FromDate}
						clearIcon={null}
					/>
					<DatePicker
						label="To"
						onChange={(date) => setFilter({ ...filter, ToDate: date })}
						value={filter.ToDate}
						clearIcon={null}
					/>
				</div>
					<button onClick={search}>Filter</button>
					<button onClick={download}>Download</button>
				<div className='overview-container strict-col-2'>
					<div className='details'>
						<h4>Total Orders</h4>
						<span className='value'>{financeNumbers.orders.totalOrders}</span>
					</div>
					<div className='details'>
						<h4>Total Products Sold</h4>
						<span className='value'>{financeNumbers.orders.totalProductsSold}</span>
					</div>
				</div>
			</section>

			<section className='sales'>
				<h4>Sales Figures</h4>
				<div className='overview-container'>
					<div className='details'>
						<h4>Total Cost</h4>
						<span className='value cash'>{financeNumbers.sales.totalCost}</span>
					</div>
					<div className='details'>
						<h4>Total Revenue</h4>
						<span className='value cash'>{financeNumbers.sales.totalRevenue}</span>
					</div>
					<div className='details'>
						<h4>Total Discounted</h4>
						<span className='value cash'>{financeNumbers.sales.totalDiscount}</span>
					</div>
					<div className='details'>
						<h4>Total Shipping</h4>
						<span className='value cash'>{financeNumbers.sales.totalShipping}</span>
					</div>
					<div className='details'>
						<h4>Total Sales</h4>
						<span className='value cash'>{financeNumbers.sales.totalSales}</span>
					</div>
					<div className='details'>
						<h4>Total Tax</h4>
						<span className='value cash'>{financeNumbers.sales.totalTax}</span>
					</div>
					<div className='details col-2'>
						<h4>Total Profit</h4>
						<span className='value cash'>{financeNumbers.sales.totalProfit}</span>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Page
