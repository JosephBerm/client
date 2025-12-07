'use client'

import { useEffect } from 'react'

import { logger } from '@_core'

import { useFinanceAnalytics } from '@_features/analytics'

import {
	AnalyticsFilters,
	AnalyticsSummaryCards,
	AnalyticsSalesMetrics,
	AnalyticsOrderMetrics,
	AnalyticsPerformanceTrends,
	DetailedMetricsSkeleton,
} from '@_components/analytics'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../_components'

// Component name for logging (FAANG-level best practice)
const COMPONENT_NAME = 'AnalyticsPage'

/**
 * Analytics Dashboard Page
 * 
 * Main analytics page displaying financial metrics and performance data.
 * Uses extracted components and custom hooks for clean separation of concerns.
 * 
 * **Architecture:**
 * - Custom hook handles all data fetching and state management
 * - Components handle UI rendering and user interactions
 * - Utilities handle formatting and validation
 * - Comprehensive logging and error handling
 * 
 * @module app/analytics/page
 */
const Page = () => {
	const {
		financeNumbers,
		filter,
		isLoading,
		hasLoaded,
		timeRange,
		error,
		hasData,
		profitMarginValue,
		averageOrderValueValue,
		productsPerOrderValue,
		handleTimeRangeChange,
		handleDateChange,
		handleApplyFilter,
		handleDownload,
		handleRetry,
	} = useFinanceAnalytics()

	// Log error state changes - always log errors for production debugging
	useEffect(() => {
		if (error) {
			logger.error('Analytics page error state', {
				component: COMPONENT_NAME,
				error,
			})
		}
	}, [error])

	try {
	return (
		<>
			<InternalPageHeader
				title="Analytics Dashboard"
				description="Track your business performance and financial metrics."
				loading={!hasLoaded && isLoading}
				actions={
					<Button
						variant="secondary"
						onClick={handleDownload}
						disabled={isLoading || !hasData}
					>
						Export Data
					</Button>
				}
			/>

			<div className="space-y-8">
				{error && (
					<div className="alert alert-error">
						<div className="flex-1">
						<span>{error}</span>
						</div>
						<Button variant="ghost" size="sm" onClick={handleRetry}>
							Retry
						</Button>
					</div>
				)}

				{isLoading && hasLoaded && (
					<div className="alert alert-info flex items-center gap-2">
						<span className="loading loading-spinner loading-sm" aria-hidden="true"></span>
						<span>Refreshing analytics&hellip;</span>
					</div>
				)}

				<AnalyticsFilters
					timeRange={timeRange}
					filter={filter}
					isLoading={isLoading}
					hasLoaded={hasLoaded}
					onTimeRangeChange={handleTimeRangeChange}
					onDateChange={handleDateChange}
					onApplyFilter={handleApplyFilter}
								/>

				<AnalyticsSummaryCards
					financeNumbers={financeNumbers}
					profitMarginValue={profitMarginValue}
					isLoading={isLoading}
					hasLoaded={hasLoaded}
					hasData={hasData}
				/>

				{/* Detailed Metrics Section */}
				{isLoading && !hasLoaded ? (
					<DetailedMetricsSkeleton />
				) : hasData ? (
				<section className="grid gap-6 lg:grid-cols-3">
						<AnalyticsSalesMetrics
							financeNumbers={financeNumbers}
							averageOrderValueValue={averageOrderValueValue}
							hasData={hasData}
						/>

						<AnalyticsOrderMetrics
							financeNumbers={financeNumbers}
							productsPerOrderValue={productsPerOrderValue}
							hasData={hasData}
						/>
				</section>
				) : null}

				{/* Performance Trends Section */}
				<section className="grid gap-6 lg:grid-cols-3">
					<AnalyticsPerformanceTrends />
				</section>
			</div>
		</>
	)
	} catch (error) {
		logger.error('Analytics page rendering error', {
			component: COMPONENT_NAME,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		})
		
		// Return error UI to prevent complete crash
		return (
			<>
				<InternalPageHeader
					title="Analytics Dashboard"
					description="Track your business performance and financial metrics."
				/>
				<div className="alert alert-error">
					<div className="flex-1">
						<span>An error occurred while loading the analytics dashboard. Please refresh the page.</span>
					</div>
					<Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
						Refresh Page
					</Button>
				</div>
			</>
		)
	}
}

export default Page
