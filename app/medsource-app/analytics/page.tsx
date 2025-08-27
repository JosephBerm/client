'use client'

import React, { useState, useEffect } from 'react'
import FinanceNumbers from '@/classes/FinanceNumbers'
import API from '@/services/api'
import DatePicker from '@/src/components/DatePicker'
import FinanceSearchFilter from '@/src/classes/FinanceSearchFilter'
import 'react-calendar/dist/Calendar.css'

import '@/styles/pages/analytics.css'

function Page() {
	const [financeNumbers, setFinanceNumbers] = useState(new FinanceNumbers())
	const [filter, setFilter] = useState<FinanceSearchFilter>(new FinanceSearchFilter())
	const [isLoading, setIsLoading] = useState(false)
	const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d, 1y, custom

	const getFinanceNumbers = async () => {
		setIsLoading(true)
		try {
			const { data } = await API.Finance.getFinanceNumbers()
			if (data.statusCode !== 200 || !data.payload)
				throw new Error(data?.message ?? 'An error occurred while fetching finance numbers')

			console.log('FINANCE NUMBERS', data.payload)
			setFinanceNumbers(new FinanceNumbers(data.payload))
		} catch (e) {
			console.error('Error fetching finance numbers', e)
		} finally {
			setIsLoading(false)
		}
	}

	const search = async () => {
		setIsLoading(true)
		try {
			const { data } = await API.Finance.searchFinnanceNumbers(filter)
			if (data.statusCode !== 200 || !data.payload)
				throw new Error(data?.message ?? 'An error occurred while fetching finance numbers')

			console.log('FINANCE NUMBERS', data.payload)
			setFinanceNumbers(new FinanceNumbers(data.payload))
		} catch (e) {
			console.error('Error fetching finance numbers', e)
		} finally {
			setIsLoading(false)
		}
	}

	const download = async () => {
		alert('This feature is not available yet!')
		// try {

		// 	const { data } = await API.Finance.downloadFinanceNumbers(filter)

		// 	console.log(data)
		// 	if (data == null) throw new Error('No data to download')
		// 	const url = window.URL.createObjectURL(data)
		// 	const link = document.createElement('a')
		// 	link.href = url
		// 	link.setAttribute('download', 'finance-numbers.csv')
		// 	document.body.appendChild(link)
		// 	link.click()
		// } catch (e) {
		// 	console.error('Error downloading finance numbers', e)
		// }
	}

	const handleTimeRangeChange = (range: string) => {
		setTimeRange(range)
		// Auto-apply filter based on time range
		const now = new Date()
		let fromDate = new Date()

		switch (range) {
			case '7d':
				fromDate.setDate(now.getDate() - 7)
				break
			case '30d':
				fromDate.setDate(now.getDate() - 30)
				break
			case '90d':
				fromDate.setDate(now.getDate() - 90)
				break
			case '1y':
				fromDate.setFullYear(now.getFullYear() - 1)
				break
			case 'custom':
				return // Don't auto-apply for custom
		}

		setFilter({ ...filter, FromDate: fromDate, ToDate: now })
	}

	function getProductsPerOrder() {
		if (financeNumbers.orders.totalOrders === 0) return '0.0'

		const productsPerOrder = financeNumbers.orders.totalProductsSold / financeNumbers.orders.totalOrders

		return productsPerOrder.toFixed(1)
	}

	useEffect(() => {
		getFinanceNumbers()
	}, [])

	// Calculate additional metrics
	const profitMargin = financeNumbers.profitMargin.toFixed(1)
	const averageOrderValue = financeNumbers.averageOrderValue.toFixed(2)

	return (
		<div className='analytics-dashboard page-container'>
			{/* Header Section */}
			<fieldset className='dashboard-header' disabled={true}>
				<div className='header-content'>
					<h1 className='dashboard-title'>Analytics Dashboard</h1>
					<p className='dashboard-subtitle'>Track your business performance and financial metrics</p>
				</div>
				<div className='header-actions'>
					<button
						className='btn btn-secondary'
						onClick={download}>
						<svg
							className='icon'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
							/>
						</svg>
						Export Data
					</button>
				</div>
			</fieldset>

			{/* Quick Filters */}
			<div className='quick-filters'>
				<fieldset className='filter-tabs' disabled={true}>
					{['7d', '30d', '90d', '1y', 'custom'].map((range) => (
						<button
							key={range}
							className={`filter-tab ${timeRange === range ? 'active' : ''}`}
							onClick={() => handleTimeRangeChange(range)}>
							{range === '7d'
								? '7 Days'
								: range === '30d'
								? '30 Days'
								: range === '90d'
								? '90 Days'
								: range === '1y'
								? '1 Year'
								: 'Custom'}
						</button>
					))}
				</fieldset>

				{timeRange === 'custom' && (
					<div className='custom-date-range'>
						<DatePicker
							label='From Date'
							onChange={(date) => setFilter({ ...filter, FromDate: date })}
							value={filter.FromDate}
							clearIcon={null}
						/>
						<DatePicker
							label='To Date'
							onChange={(date) => setFilter({ ...filter, ToDate: date })}
							value={filter.ToDate}
							clearIcon={null}
						/>
						<button
							className='btn btn-primary'
							onClick={search}
							disabled={isLoading}>
							{isLoading ? 'Loading...' : 'Apply Filter'}
						</button>
					</div>
				)}
			</div>

			{/* Key Metrics Overview */}
			<div className='metrics-overview'>
				<div className='metric-card primary'>
					<div className='metric-icon'>
						<svg
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
							/>
						</svg>
					</div>
					<div className='metric-content'>
						<h3 className='metric-label'>Total Revenue</h3>
						<p className='metric-value'>${financeNumbers.sales.totalRevenue}</p>
						<p className='metric-change positive'>-% vs last period</p>
					</div>
				</div>

				<div className='metric-card success'>
					<div className='metric-icon'>
						<svg
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
							/>
						</svg>
					</div>
					<div className='metric-content'>
						<h3 className='metric-label'>Total Profit</h3>
						<p className='metric-value'>${financeNumbers.sales.totalProfit}</p>
						<p className='metric-change positive'>-% vs last period</p>
					</div>
				</div>

				<div className='metric-card warning'>
					<div className='metric-icon'>
						<svg
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
							/>
						</svg>
					</div>
					<div className='metric-content'>
						<h3 className='metric-label'>Total Orders</h3>
						<p className='metric-value'>{financeNumbers.orders.totalOrders}</p>
						<p className='metric-change positive'>-% vs last period</p>
					</div>
				</div>

				<div className='metric-card info'>
					<div className='metric-icon'>
						<svg
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
							/>
						</svg>
					</div>
					<div className='metric-content'>
						<h3 className='metric-label'>Profit Margin</h3>
						<p className='metric-value'>{profitMargin}%</p>
						<p className='metric-change positive'>-% vs last period</p>
					</div>
				</div>
			</div>

			{/* Detailed Metrics Grid */}
			<div className='metrics-grid'>
				{/* Sales Performance */}
				<div className='metric-section'>
					<h3 className='section-title'>Sales Performance</h3>
					<div className='section-grid'>
						<div className='metric-item'>
							<span className='metric-name'>Total Sales</span>
							<span className='metric-value'>${financeNumbers.sales.totalSales}</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Total Cost</span>
							<span className='metric-value'>${financeNumbers.sales.totalCost}</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Total Discount</span>
							<span className='metric-value'>${financeNumbers.sales.totalDiscount}</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Total Tax</span>
							<span className='metric-value'>${financeNumbers.sales.totalTax}</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Total Shipping</span>
							<span className='metric-value'>${financeNumbers.sales.totalShipping}</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Average Order Value</span>
							<span className='metric-value'>${averageOrderValue}</span>
						</div>
					</div>
				</div>

				{/* Order Analytics */}
				<div className='metric-section'>
					<h3 className='section-title'>Order Analytics</h3>
					<div className='section-grid'>
						<div className='metric-item'>
							<span className='metric-name'>Total Products Sold</span>
							<span className='metric-value'>{financeNumbers.orders.totalProductsSold}</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Products per Order</span>
							<span className='metric-value'>{getProductsPerOrder()}</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Conversion Rate</span>
							<span className='metric-value'>-%</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Customer Lifetime Value</span>
							<span className='metric-value'>$-</span>
						</div>
					</div>
				</div>

				{/* Financial Health */}
				<div className='metric-section'>
					<h3 className='section-title'>Financial Health</h3>
					<div className='section-grid'>
						<div className='metric-item'>
							<span className='metric-name'>Cash Flow</span>
							<span className='metric-value positive'>$-</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Expense Ratio</span>
							<span className='metric-value'>-%</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Return on Investment</span>
							<span className='metric-value positive'>-%</span>
						</div>
						<div className='metric-item'>
							<span className='metric-name'>Break-even Point</span>
							<span className='metric-value'>$-</span>
						</div>
					</div>
				</div>
			</div>

			{/* Performance Chart Placeholder */}
			<div className='chart-section'>
				<h3 className='section-title'>Performance Trends</h3>
				<div className='chart-placeholder'>
					<div className='chart-content'>
						<svg
							className='chart-icon'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
							/>
						</svg>
						<p>Chart visualization would go here</p>
						<p className='chart-note'>Revenue, Profit, and Order trends over time</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Page
