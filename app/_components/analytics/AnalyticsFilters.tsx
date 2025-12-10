/**
 * AnalyticsFilters Component
 * 
 * Filter section for analytics dashboard.
 * Provides time range presets and custom date range selection.
 * 
 * **Features:**
 * - Quick time range presets (7d, 30d, 90d, 1y)
 * - Custom date range selection
 * - Responsive design
 * - Comprehensive logging and error handling
 * 
 * @module components/analytics/AnalyticsFilters
 */

import { useEffect, type ChangeEvent } from 'react'

import type { TimeRange } from '@_features/analytics'

import { logger } from '@_core'

import { serializeDateOnly } from '@_lib'

import type FinanceSearchFilter from '@_classes/FinanceSearchFilter'

import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'

import { TIME_RANGES, rangeLabels } from './analytics.constants'

// Component name for logging (FAANG-level best practice)
const COMPONENT_NAME = 'AnalyticsFilters'

interface AnalyticsFiltersProps {
	/** Current time range selection */
	timeRange: TimeRange
	/** Current filter state */
	filter: FinanceSearchFilter
	/** Whether data is loading */
	isLoading: boolean
	/** Whether initial load has completed */
	hasLoaded: boolean
	/** Handler for time range changes */
	onTimeRangeChange: (range: TimeRange) => void
	/** Handler for date input changes */
	onDateChange: (key: 'FromDate' | 'ToDate') => (event: ChangeEvent<HTMLInputElement>) => void
	/** Handler for applying custom filter */
	onApplyFilter: () => void
}

/**
 * AnalyticsFilters Component
 * 
 * Filter controls for analytics dashboard.
 * 
 * @param props - Component props
 * @returns Filters section
 */
export default function AnalyticsFilters({
	timeRange,
	filter,
	isLoading,
	hasLoaded,
	onTimeRangeChange,
	onDateChange,
	onApplyFilter,
}: AnalyticsFiltersProps) {
	// No mount logging - not critical for observability and can impact performance

	// Validate date range - always log warnings for data integrity issues
	useEffect(() => {
		if (timeRange === 'custom' && filter.FromDate && filter.ToDate) {
			if (filter.FromDate > filter.ToDate) {
				logger.warn('Invalid date range: FromDate is after ToDate', {
					component: COMPONENT_NAME,
					fromDate: filter.FromDate.toISOString(),
					toDate: filter.ToDate.toISOString(),
				})
			}
		}
	}, [filter.FromDate, filter.ToDate, timeRange])

	const handleTimeRangeClick = (range: TimeRange) => {
		try {
			// Only log in development - user action logging for debugging
			if (process.env.NODE_ENV === 'development') {
				logger.debug('Time range button clicked', {
					component: COMPONENT_NAME,
					previousRange: timeRange,
					newRange: range,
				})
			}
			onTimeRangeChange(range)
		} catch (error) {
			// Always log errors - critical for production debugging
			logger.error('Failed to handle time range change', {
				component: COMPONENT_NAME,
				error: error instanceof Error ? error.message : 'Unknown error',
				range,
			})
		}
	}

	const handleDateInputChange = (key: 'FromDate' | 'ToDate') => {
		return (event: ChangeEvent<HTMLInputElement>) => {
			try {
				// No logging for frequent input changes - performance impact
				onDateChange(key)(event)
			} catch (error) {
				// Always log errors - critical for production debugging
				logger.error('Failed to handle date change', {
					component: COMPONENT_NAME,
					error: error instanceof Error ? error.message : 'Unknown error',
					field: key,
					value: event.target.value,
				})
			}
		}
	}

	const handleApplyFilterClick = () => {
		try {
			if (!filter.FromDate || !filter.ToDate) {
				// Always log warnings - important for production debugging
				logger.warn('Apply filter clicked with missing dates', {
					component: COMPONENT_NAME,
					hasFromDate: !!filter.FromDate,
					hasToDate: !!filter.ToDate,
				})
				return
			}

			// Only log in development - user action logging for debugging
			if (process.env.NODE_ENV === 'development') {
				logger.debug('Apply filter clicked', {
					component: COMPONENT_NAME,
					fromDate: filter.FromDate.toISOString(),
					toDate: filter.ToDate.toISOString(),
				})
			}
			onApplyFilter()
		} catch (error) {
			// Always log errors - critical for production debugging
			logger.error('Failed to apply filter', {
				component: COMPONENT_NAME,
				error: error instanceof Error ? error.message : 'Unknown error',
				fromDate: filter.FromDate?.toISOString(),
				toDate: filter.ToDate?.toISOString(),
			})
		}
	}

	return (
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
							onClick={() => handleTimeRangeClick(range)}
							className="min-w-[96px]"
							disabled={isLoading && !hasLoaded}
						>
							{rangeLabels[range]}
						</Button>
					))}
				</div>
			</div>

			{timeRange === 'custom' && (
				<div className="mt-6 grid gap-4 md:grid-cols-3">
					<div className="form-control w-full">
						<label htmlFor="from-date" className="label">
							<span className="label-text text-sm font-medium text-base-content">From date</span>
						</label>
						<Input
							id="from-date"
							type="date"
							value={serializeDateOnly(filter.FromDate) ?? ''}
							onChange={handleDateInputChange('FromDate')}
							disabled={isLoading}
							aria-label="From date"
						/>
					</div>

					<div className="form-control w-full">
						<label htmlFor="to-date" className="label">
							<span className="label-text text-sm font-medium text-base-content">To date</span>
						</label>
						<Input
							id="to-date"
							type="date"
							value={serializeDateOnly(filter.ToDate) ?? ''}
							onChange={handleDateInputChange('ToDate')}
							disabled={isLoading}
							aria-label="To date"
						/>
					</div>

					<div className="flex items-end">
						<Button
							variant="primary"
							className="w-full"
							onClick={handleApplyFilterClick}
							disabled={isLoading || !filter.FromDate || !filter.ToDate}
						>
							Apply Filter
						</Button>
					</div>
				</div>
			)}
		</section>
	)
}
