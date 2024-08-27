'use client'

import React, { useState, useEffect } from 'react'
import FinanceNumbers from '@/classes/FinanceNumbers'
import API from '@/services/api'
import '@/styles/pages/analytics.css'

function Page() {
	const [financeNumbers, setFinanceNumbers] = useState(new FinanceNumbers())
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
