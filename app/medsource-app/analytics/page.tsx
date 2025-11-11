'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Button from '@_components/ui/Button'
import FinanceNumbers from '@_classes/FinanceNumbers'
import FinanceSearchFilter from '@_classes/FinanceSearchFilter'
import API from '@_services/api'

const TIME_RANGES = ['7d', '30d', '90d', '1y', 'custom'] as const
type TimeRange = (typeof TIME_RANGES)[number]

const rangeLabels: Record<TimeRange, string> = {
	'7d': '7 Days',
	'30d': '30 Days',
	'90d': '90 Days',
	'1y': '1 Year',
	custom: 'Custom',
}

const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(Number.isFinite(value) ? value : 0)

const mergeFilter = (base: FinanceSearchFilter, updates: Partial<FinanceSearchFilter>) =>
	Object.assign(new FinanceSearchFilter(), base, updates)

const Page = () => {
	const [financeNumbers, setFinanceNumbers] = useState(() => new FinanceNumbers())
	const [filter, setFilter] = useState(() => new FinanceSearchFilter())
	const [isLoading, setIsLoading] = useState(false)
	const [hasLoaded, setHasLoaded] = useState(false)
	const [timeRange, setTimeRange] = useState<TimeRange>('30d')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchFinanceNumbers = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const { data } = await API.Finance.getFinanceNumbers()
				if (data.statusCode !== 200 || !data.payload) {
					throw new Error(data?.message ?? 'Unable to fetch finance numbers')
				}

				setFinanceNumbers(new FinanceNumbers(data.payload))
			} catch (err) {
				console.error('Error fetching finance numbers', err)
				setError(err instanceof Error ? err.message : 'Unable to fetch finance numbers')
			} finally {
				setIsLoading(false)
				setHasLoaded(true)
			}
		}

		void fetchFinanceNumbers()
	}, [])

	const applySearch = async (override?: FinanceSearchFilter) => {
		const payload = override ?? filter

		setIsLoading(true)
		setError(null)

		try {
			const { data } = await API.Finance.searchFinnanceNumbers(payload)
			if (data.statusCode !== 200 || !data.payload) {
				throw new Error(data?.message ?? 'Unable to fetch finance numbers')
			}

			setFinanceNumbers(new FinanceNumbers(data.payload))
		} catch (err) {
			console.error('Error fetching finance numbers', err)
			setError(err instanceof Error ? err.message : 'Unable to fetch finance numbers')
		} finally {
			setIsLoading(false)
			setHasLoaded(true)
		}
	}

	const handleTimeRangeChange = (range: TimeRange) => {
		setTimeRange(range)

		if (range === 'custom') {
			return
		}

		const now = new Date()
		const fromDate = new Date(now)

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
		}

		const updatedFilter = mergeFilter(filter, { FromDate: fromDate, ToDate: now })
		setFilter(updatedFilter)
		void applySearch(updatedFilter)
	}

	const handleDateChange =
		(key: 'FromDate' | 'ToDate') =>
		(event: ChangeEvent<HTMLInputElement>) => {
			const value = event.target.value ? new Date(event.target.value) : null
			const updatedFilter = mergeFilter(filter, { [key]: value } as Partial<FinanceSearchFilter>)
			setFilter(updatedFilter)
		}

	const handleApplyFilter = () => {
		void applySearch()
	}

	const handleDownload = () => {
		alert('This feature is not available yet!')
	}

	const profitMarginValue = Number.isFinite(financeNumbers.profitMargin) ? financeNumbers.profitMargin : 0
	const averageOrderValueValue = Number.isFinite(financeNumbers.averageOrderValue)
		? financeNumbers.averageOrderValue
		: 0
	const productsPerOrderValue = financeNumbers.orders.totalOrders
		? financeNumbers.orders.totalProductsSold / financeNumbers.orders.totalOrders
		: 0

	const summaryCards = [
		{
			title: 'Total Revenue',
			value: formatCurrency(financeNumbers.sales.totalRevenue),
			borderClass: 'border-primary/20',
			bgClass: 'bg-primary/10',
			titleClass: 'text-primary',
			subtitleClass: 'text-primary/80',
			trend: '-% vs last period',
		},
		{
			title: 'Total Profit',
			value: formatCurrency(financeNumbers.sales.totalProfit),
			borderClass: 'border-success/20',
			bgClass: 'bg-success/10',
			titleClass: 'text-success',
			subtitleClass: 'text-success/80',
			trend: '-% vs last period',
		},
		{
			title: 'Total Orders',
			value: financeNumbers.orders.totalOrders.toLocaleString(),
			borderClass: 'border-warning/20',
			bgClass: 'bg-warning/10',
			titleClass: 'text-warning',
			subtitleClass: 'text-warning/80',
			trend: '-% vs last period',
		},
		{
			title: 'Profit Margin',
			value: `${profitMarginValue.toFixed(1)}%`,
			borderClass: 'border-info/20',
			bgClass: 'bg-info/10',
			titleClass: 'text-info',
			subtitleClass: 'text-info/80',
			trend: '-% vs last period',
		},
	]

	const salesMetrics = [
		{ label: 'Total Sales', value: formatCurrency(financeNumbers.sales.totalSales) },
		{ label: 'Total Cost', value: formatCurrency(financeNumbers.sales.totalCost) },
		{ label: 'Total Discount', value: formatCurrency(financeNumbers.sales.totalDiscount) },
		{ label: 'Total Tax', value: formatCurrency(financeNumbers.sales.totalTax) },
		{ label: 'Total Shipping', value: formatCurrency(financeNumbers.sales.totalShipping) },
		{ label: 'Average Order Value', value: formatCurrency(averageOrderValueValue) },
	]

	const orderMetrics = [
		{ label: 'Total Products Sold', value: financeNumbers.orders.totalProductsSold.toLocaleString() },
		{ label: 'Products per Order', value: productsPerOrderValue.toFixed(1) },
		{ label: 'Conversion Rate', value: '—' },
		{ label: 'Customer Lifetime Value', value: '—' },
	]

	const healthMetrics = [
		{ label: 'Cash Flow', value: '—' },
		{ label: 'Expense Ratio', value: '—' },
		{ label: 'Return on Investment', value: '—' },
		{ label: 'Break-even Point', value: '—' },
	]

	return (
		<ClientPageLayout
			title="Analytics Dashboard"
			description="Track your business performance and financial metrics."
			loading={!hasLoaded && isLoading}
			maxWidth="full"
			actions={
				<Button variant="secondary" onClick={handleDownload} disabled={isLoading}>
					Export Data
				</Button>
			}
		>
			<div className="space-y-8">
				{error && (
					<div className="alert alert-error">
						<span>{error}</span>
					</div>
				)}

				{isLoading && hasLoaded && (
					<div className="alert alert-info flex items-center gap-2">
						<span className="loading loading-spinner loading-sm" aria-hidden="true"></span>
						<span>Refreshing analytics&hellip;</span>
					</div>
				)}

				<section className="rounded-xl border border-base-300 bg-base-100/80 p-6 shadow-sm">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h2 className="text-lg font-semibold text-base-content">Quick Filters</h2>
							<p className="text-sm text-base-content/70">
								Select a time range to update the analytics shown below.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{TIME_RANGES.map((range) => (
								<Button
									key={range}
									variant={timeRange === range ? 'primary' : 'ghost'}
									onClick={() => handleTimeRangeChange(range)}
									className="min-w-[96px]"
									disabled={isLoading && !hasLoaded}
								>
									{rangeLabels[range]}
								</Button>
							))}
						</div>
					</div>

					{timeRange === 'custom' && (
						<div className="mt-6 grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))]">
							<label className="form-control w-full">
								<span className="label-text text-sm font-medium text-base-content">From date</span>
								<input
									type="date"
									className="input input-bordered mt-1"
									value={filter.FromDate ? filter.FromDate.toISOString().split('T')[0] : ''}
									onChange={handleDateChange('FromDate')}
								/>
							</label>

							<label className="form-control w-full">
								<span className="label-text text-sm font-medium text-base-content">To date</span>
								<input
									type="date"
									className="input input-bordered mt-1"
									value={filter.ToDate ? filter.ToDate.toISOString().split('T')[0] : ''}
									onChange={handleDateChange('ToDate')}
								/>
							</label>

							<div className="flex items-end">
								<Button
									variant="primary"
									className="w-full"
									onClick={handleApplyFilter}
									disabled={isLoading || !filter.FromDate || !filter.ToDate}
								>
									Apply Filter
								</Button>
							</div>
						</div>
					)}
				</section>

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{summaryCards.map((card) => (
						<div
							key={card.title}
							className={`rounded-xl border ${card.borderClass} ${card.bgClass} p-6 shadow-sm`}
						>
							<p className={`text-sm font-medium ${card.titleClass}`}>{card.title}</p>
							<p className={`mt-2 text-2xl font-bold ${card.titleClass}`}>{card.value}</p>
							<p className={`mt-1 text-xs ${card.subtitleClass}`}>{card.trend}</p>
						</div>
					))}
				</section>

				<section className="grid gap-6 lg:grid-cols-3">
					<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm lg:col-span-2">
						<h3 className="text-base font-semibold text-base-content">Sales Performance</h3>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							{salesMetrics.map((metric) => (
								<div key={metric.label} className="rounded-lg border border-base-200 p-4">
									<p className="text-xs uppercase tracking-wide text-base-content/60">{metric.label}</p>
									<p className="mt-2 text-lg font-semibold text-base-content">{metric.value}</p>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
						<h3 className="text-base font-semibold text-base-content">Order Analytics</h3>
						<div className="mt-4 space-y-4">
							{orderMetrics.map((metric) => (
								<div key={metric.label} className="rounded-lg border border-base-200 p-4">
									<p className="text-xs uppercase tracking-wide text-base-content/60">{metric.label}</p>
									<p className="mt-2 text-lg font-semibold text-base-content">{metric.value}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-3">
					<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
						<h3 className="text-base font-semibold text-base-content">Financial Health</h3>
						<div className="mt-4 space-y-4">
							{healthMetrics.map((metric) => (
								<div key={metric.label} className="rounded-lg border border-base-200 p-4">
									<p className="text-xs uppercase tracking-wide text-base-content/60">{metric.label}</p>
									<p className="mt-2 text-lg font-semibold text-base-content">{metric.value}</p>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-xl border border-dashed border-base-300 bg-base-100 p-6 shadow-sm lg:col-span-2">
						<h3 className="text-base font-semibold text-base-content">Performance Trends</h3>
						<div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-base-200 p-8 text-center text-sm text-base-content/70">
							<svg
								className="mb-4 h-12 w-12 text-base-content/50"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M3 3v18h18" />
								<path d="M7 14l4-4 3 3 4-5" />
							</svg>
							<p className="font-medium text-base-content">Analytics chart coming soon</p>
							<p className="mt-2 max-w-sm">
								Tie into your preferred charting library to visualize revenue, profit, and order trends over
								time.
							</p>
						</div>
					</div>
				</section>
			</div>
		</ClientPageLayout>
	)
}

export default Page
