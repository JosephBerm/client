'use client'

/**
 * Pricing Analytics Component
 *
 * Displays detailed pricing analytics for Sales Managers and Admins.
 * Includes:
 * - Average margins by price list
 * - Total discounts given
 * - Margin distribution visualization
 * - Recent pricing activity
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 4.2 Sales Manager
 * > "See pricing analytics (average margins, discounts given)"
 *
 * **DRY Compliance:**
 * - Uses shared PricingAnalyticsResponse from @_classes/Pricing
 * - Uses usePricingAnalytics hook from @_features/pricing/hooks
 *
 * @module app/pricing/_components/PricingAnalytics
 */

import { useMemo, useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import {
	Activity,
	AlertTriangle,
	BarChart3,
	Calendar,
	CheckCircle,
	DollarSign,
	Percent,
	PieChart,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'

import { usePricingAnalytics } from '@_features/pricing/hooks'

import { parseDateOrNow } from '@_lib/dates'
import { formatCurrency } from '@_lib/formatters'

import type { MarginDistributionBucket, PriceListAnalytics, PricingAnalyticsResponse } from '@_classes/Pricing'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import { Tab, TabPanel, Tabs, TabsList } from '@_components/ui/Tabs'
import { DataGrid } from '@_components/tables'

// =========================================================================
// HELPERS
// =========================================================================

/** Format percentage value with % sign */
const formatPercent = (value: number): string => `${value.toFixed(1)}%`

// =========================================================================
// TYPES (Props only - data types imported from @_classes/Pricing)
// =========================================================================

interface PricingAnalyticsProps {
	/** Whether to show admin-only metrics */
	isAdmin?: boolean
}

type TimePeriod = 'week' | 'month' | 'quarter' | 'year'

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

function MetricCard({
	label,
	value,
	icon,
	trend,
	trendLabel,
	variant = 'default',
}: {
	label: string
	value: string | number
	icon: ReactNode
	trend?: number
	trendLabel?: string
	variant?: 'default' | 'success' | 'warning' | 'error'
}) {
	const bgColors = {
		default: 'bg-base-200/50',
		success: 'bg-success/10',
		warning: 'bg-warning/10',
		error: 'bg-error/10',
	}

	return (
		<Card className='border border-base-300 bg-base-100 p-5 shadow-sm'>
			<div className='flex items-start justify-between'>
				<div>
					<p className='text-sm text-base-content/60 mb-1'>{label}</p>
					<p className='text-2xl font-bold text-base-content'>{value}</p>
					{trend !== undefined && (
						<div className='flex items-center gap-1 mt-2'>
							{trend >= 0 ? (
								<TrendingUp className='h-4 w-4 text-success' />
							) : (
								<TrendingDown className='h-4 w-4 text-error' />
							)}
							<span className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-error'}`}>
								{trend > 0 ? '+' : ''}
								{trend.toFixed(1)}%
							</span>
							{trendLabel && <span className='text-xs text-base-content/50'>{trendLabel}</span>}
						</div>
					)}
				</div>
				<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColors[variant]}`}>
					{icon}
				</div>
			</div>
		</Card>
	)
}

function MarginDistributionChart({ distribution }: { distribution: MarginDistributionBucket[] }) {
	const maxPercentage = Math.max(...distribution.map((d) => d.percentage))

	return (
		<Card className='border border-base-300 bg-base-100 p-5 shadow-sm'>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='font-semibold text-base-content'>Margin Distribution</h3>
				<BarChart3 className='h-5 w-5 text-base-content/40' />
			</div>

			<div className='space-y-3'>
				{distribution.map((item) => (
					<div key={item.range}>
						<div className='flex items-center justify-between mb-1'>
							<span className='text-sm text-base-content/70'>{item.range}</span>
							<span className='text-sm font-medium text-base-content'>
								{item.count} ({item.percentage.toFixed(1)}%)
							</span>
						</div>
						<div className='h-2 bg-base-200 rounded-full overflow-hidden'>
							<div
								className={`h-full rounded-full transition-all duration-500 ${
									item.range.includes('0-10') || item.range.includes('10-15')
										? 'bg-warning'
										: 'bg-success'
								}`}
								style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
							/>
						</div>
					</div>
				))}
			</div>

			<div className='mt-4 pt-4 border-t border-base-200'>
				<div className='flex items-center gap-4 text-xs text-base-content/60'>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-3 bg-warning rounded' />
						<span>Below target (&lt;15%)</span>
					</div>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-3 bg-success rounded' />
						<span>On target (≥15%)</span>
					</div>
				</div>
			</div>
		</Card>
	)
}

function PriceListPerformanceTable({ analytics }: { analytics: PriceListAnalytics[] }) {
	const sortedAnalytics = useMemo(() => {
		return [...analytics].sort((a, b) => b.averageMargin - a.averageMargin)
	}, [analytics])

	return (
		<Card className='border border-base-300 bg-base-100 shadow-sm overflow-hidden'>
			<div className='p-4 border-b border-base-200'>
				<div className='flex items-center justify-between'>
					<h3 className='font-semibold text-base-content'>Price List Performance</h3>
					<PieChart className='h-5 w-5 text-base-content/40' />
				</div>
			</div>

			<div className='overflow-x-auto'>
				<PriceListPerformanceDataGrid analytics={sortedAnalytics} />
			</div>
		</Card>
	)
}

// =========================================================================
// DATA GRID COMPONENT
// =========================================================================

interface PriceListPerformanceDataGridProps {
	analytics: PriceListAnalytics[]
}

/**
 * DataGrid component for displaying price list performance - mobile-first responsive
 */
function PriceListPerformanceDataGrid({ analytics }: PriceListPerformanceDataGridProps) {
	const columns = useMemo<ColumnDef<PriceListAnalytics>[]>(
		() => [
			{
				accessorKey: 'priceListName',
				header: 'Price List',
				cell: ({ row }) => {
					const item = row.original
					return (
						<div className='min-w-0'>
							<span className='text-xs sm:text-sm font-medium text-base-content block truncate'>
								{item.priceListName}
							</span>
							<span className='text-[10px] sm:text-xs text-base-content/60'>
								{item.itemCount} products
							</span>
						</div>
					)
				},
				size: 140,
			},
			{
				accessorKey: 'averageMargin',
				header: 'Margin',
				cell: ({ row }) => {
					const item = row.original
					return (
						<div className='text-right'>
							<Badge
								variant={
									item.averageMargin >= 20
										? 'success'
										: item.averageMargin >= 15
										? 'warning'
										: 'error'
								}
								size='sm'
								className='text-[10px] sm:text-xs'>
								{formatPercent(item.averageMargin)}
							</Badge>
						</div>
					)
				},
				size: 80,
			},
			{
				accessorKey: 'totalDiscountGiven',
				header: 'Discounts',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm text-right font-medium block'>
						{formatCurrency(row.original.totalDiscountGiven)}
					</span>
				),
				size: 90,
			},
			{
				accessorKey: 'calculationCount',
				header: 'Calcs',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm text-right text-base-content/70 block'>
						{row.original.calculationCount.toLocaleString()}
					</span>
				),
				size: 70,
			},
			{
				accessorKey: 'customerCount',
				header: 'Cust.',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm text-right text-base-content/70 block'>
						{row.original.customerCount}
					</span>
				),
				size: 60,
			},
		],
		[]
	)

	return (
		<div className='min-w-[400px]'>
			<DataGrid
				columns={columns}
				data={analytics}
				ariaLabel='Price list performance'
			/>
		</div>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export default function PricingAnalytics({ isAdmin = false }: PricingAnalyticsProps) {
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month')
	const [selectedTab, setSelectedTab] = useState<string>('distribution')

	// Fetch analytics using shared hook (DRY compliance)
	const { data, isLoading } = usePricingAnalytics({ period: selectedPeriod })

	const handlePeriodChange = (period: TimePeriod) => {
		setSelectedPeriod(period)
	}

	// Loading state
	if (isLoading || !data) {
		return (
			<div className='space-y-6'>
				{/* Period selector skeleton */}
				<div className='flex items-center justify-between'>
					<div className='h-8 w-48 bg-base-300 rounded animate-pulse' />
					<div className='h-10 w-64 bg-base-300 rounded animate-pulse' />
				</div>

				{/* Metric cards skeleton */}
				<div className='grid gap-4 md:grid-cols-4'>
					{[...Array(4)].map((_, i) => (
						<Card
							key={i}
							className='border border-base-300 bg-base-100 p-5 shadow-sm animate-pulse'>
							<div className='h-4 w-24 bg-base-300 rounded mb-2' />
							<div className='h-8 w-16 bg-base-200 rounded' />
						</Card>
					))}
				</div>

				{/* Charts skeleton */}
				<div className='grid gap-6 md:grid-cols-2'>
					{[...Array(2)].map((_, i) => (
						<Card
							key={i}
							className='border border-base-300 bg-base-100 p-5 shadow-sm animate-pulse'>
							<div className='h-6 w-32 bg-base-300 rounded mb-4' />
							<div className='h-48 bg-base-200 rounded' />
						</Card>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Header with Period Selector */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
				<div>
					<h2 className='text-xl font-semibold text-base-content'>Pricing Analytics</h2>
					<p className='text-sm text-base-content/60'>
						{data.periodStart.toLocaleDateString()} - {data.periodEnd.toLocaleDateString()}
					</p>
				</div>

				<div className='flex items-center gap-2'>
					<Calendar className='h-4 w-4 text-base-content/60' />
					<div className='btn-group'>
						{(['week', 'month', 'quarter', 'year'] as TimePeriod[]).map((period) => (
							<Button
								key={period}
								size='sm'
								variant={selectedPeriod === period ? 'primary' : 'ghost'}
								onClick={() => handlePeriodChange(period)}>
								{period.charAt(0).toUpperCase() + period.slice(1)}
							</Button>
						))}
					</div>
				</div>
			</div>

			{/* Summary Metrics */}
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<MetricCard
					label='Average Margin'
					value={formatPercent(data.averageMargin)}
					icon={<Percent className='h-5 w-5 text-base-content/60' />}
					trend={data.marginTrend}
					trendLabel='vs. last period'
					variant={data.averageMargin >= 20 ? 'success' : data.averageMargin >= 15 ? 'warning' : 'error'}
				/>
				<MetricCard
					label='Total Discounts Given'
					value={formatCurrency(data.totalDiscountGiven)}
					icon={<DollarSign className='h-5 w-5 text-base-content/60' />}
					trend={data.discountTrend}
					trendLabel='vs. last period'
				/>
				<MetricCard
					label='Price Calculations'
					value={data.totalCalculations.toLocaleString()}
					icon={<Activity className='h-5 w-5 text-base-content/60' />}
				/>
				<MetricCard
					label='Margin Protected'
					value={`${data.marginProtectedCount} (${data.marginProtectedPercent.toFixed(1)}%)`}
					icon={<AlertTriangle className='h-5 w-5 text-base-content/60' />}
					variant={data.marginProtectedPercent > 5 ? 'warning' : 'success'}
				/>
			</div>

			{/* Health Indicators */}
			<Card className='border border-base-300 bg-base-100 p-5 shadow-sm'>
				<h3 className='font-semibold text-base-content mb-4'>Pricing Health</h3>
				<div className='grid gap-4 sm:grid-cols-3'>
					<div className='flex items-center gap-3'>
						{data.averageMargin >= 20 ? (
							<CheckCircle className='h-6 w-6 text-success' />
						) : (
							<AlertTriangle className='h-6 w-6 text-warning' />
						)}
						<div>
							<p className='text-sm font-medium text-base-content'>
								{data.averageMargin >= 20 ? 'Healthy Margins' : 'Margins Need Review'}
							</p>
							<p className='text-xs text-base-content/60'>
								Average margin is {formatPercent(data.averageMargin)}
							</p>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						{data.marginTrend >= 0 ? (
							<TrendingUp className='h-6 w-6 text-success' />
						) : (
							<TrendingDown className='h-6 w-6 text-error' />
						)}
						<div>
							<p className='text-sm font-medium text-base-content'>
								{data.marginTrend >= 0 ? 'Margins Improving' : 'Margins Declining'}
							</p>
							<p className='text-xs text-base-content/60'>
								{data.marginTrend > 0 ? '+' : ''}
								{data.marginTrend.toFixed(1)}% from last period
							</p>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						{data.marginProtectedPercent <= 5 ? (
							<CheckCircle className='h-6 w-6 text-success' />
						) : (
							<AlertTriangle className='h-6 w-6 text-warning' />
						)}
						<div>
							<p className='text-sm font-medium text-base-content'>
								{data.marginProtectedPercent <= 5
									? 'Price Lists Configured Well'
									: 'Review Price List Configuration'}
							</p>
							<p className='text-xs text-base-content/60'>
								{formatPercent(data.marginProtectedPercent)} of prices margin-protected
							</p>
						</div>
					</div>
				</div>
			</Card>

			{/* Detailed Analytics */}
			<Tabs
				value={selectedTab}
				onValueChange={setSelectedTab}>
				<TabsList className='mb-4'>
					<Tab
						value='distribution'
						icon={<BarChart3 className='h-4 w-4' />}>
						Margin Distribution
					</Tab>
					<Tab
						value='price-lists'
						icon={<PieChart className='h-4 w-4' />}>
						Price List Performance
					</Tab>
				</TabsList>

				<TabPanel value='distribution'>
					<MarginDistributionChart distribution={data.marginDistribution} />
				</TabPanel>

				<TabPanel value='price-lists'>
					<PriceListPerformanceTable analytics={data.priceListAnalytics} />
				</TabPanel>
			</Tabs>

			{/* Admin-only section */}
			{isAdmin && (
				<Card className='border border-warning/30 bg-warning/5 p-5'>
					<div className='flex items-center gap-2 mb-3'>
						<AlertTriangle className='h-5 w-5 text-warning' />
						<h3 className='font-semibold text-base-content'>Admin Insights</h3>
					</div>
					<p className='text-sm text-base-content/70 mb-4'>
						Consider reviewing price lists with margins below 15% threshold. High margin protection rates
						indicate price lists may need adjustment.
					</p>
					<div className='flex gap-2'>
						<Button
							variant='accent'
							size='sm'>
							Review Low Margin Price Lists
						</Button>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => handleExportReport(data)}>
							Export Full Report
						</Button>
					</div>
				</Card>
			)}
		</div>
	)
}

// =========================================================================
// EXPORT UTILITIES
// =========================================================================

/**
 * Exports pricing analytics data to CSV format.
 * Generates a downloadable report with summary metrics and price list performance.
 */
function handleExportReport(data: PricingAnalyticsResponse) {
	const now = parseDateOrNow()
	const timestamp = now.toISOString().split('T')[0]

	// Build CSV content
	const lines: string[] = []

	// Header
	lines.push('Pricing Analytics Report')
	lines.push(`Generated: ${now.toLocaleString()}`)
	lines.push(`Period: ${data.periodStart.toLocaleDateString()} - ${data.periodEnd.toLocaleDateString()}`)
	lines.push('')

	// Summary metrics
	lines.push('SUMMARY METRICS')
	lines.push('Metric,Value')
	lines.push(`Average Margin,${data.averageMargin.toFixed(2)}%`)
	lines.push(`Total Discounts Given,$${data.totalDiscountGiven.toFixed(2)}`)
	lines.push(`Total Calculations,${data.totalCalculations}`)
	lines.push(`Margin Protected Count,${data.marginProtectedCount}`)
	lines.push(`Margin Protected Percent,${data.marginProtectedPercent.toFixed(2)}%`)
	lines.push(`Margin Trend,${data.marginTrend >= 0 ? '+' : ''}${data.marginTrend.toFixed(2)}%`)
	lines.push(`Discount Trend,${data.discountTrend >= 0 ? '+' : ''}${data.discountTrend.toFixed(2)}%`)
	lines.push('')

	// Price list performance
	lines.push('PRICE LIST PERFORMANCE')
	lines.push('Price List,Average Margin,Total Discounts,Items,Customers,Calculations')
	for (const pl of data.priceListAnalytics) {
		lines.push(
			`"${pl.priceListName}",${pl.averageMargin.toFixed(2)}%,$${pl.totalDiscountGiven.toFixed(2)},${
				pl.itemCount
			},${pl.customerCount},${pl.calculationCount}`
		)
	}
	lines.push('')

	// Margin distribution
	lines.push('MARGIN DISTRIBUTION')
	lines.push('Range,Count,Percentage')
	for (const dist of data.marginDistribution) {
		lines.push(`${dist.range},${dist.count},${dist.percentage.toFixed(2)}%`)
	}

	// Create and download file
	const csvContent = lines.join('\n')
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = `pricing-analytics-report-${timestamp}.csv`
	link.click()
	URL.revokeObjectURL(link.href)
}
