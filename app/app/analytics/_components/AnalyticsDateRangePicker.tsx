'use client'

/**
 * AnalyticsDateRangePicker Component
 *
 * Date range selector for analytics filtering.
 * Supports preset ranges and custom date selection.
 *
 * @see prd_analytics.md - Section 5.2 Frontend Components
 * @module analytics/components/AnalyticsDateRangePicker
 */

import { Calendar, ChevronDown } from 'lucide-react'

import type { TimeRangePreset } from '@_types/analytics.types'

import { TIME_RANGE_PRESETS, TIME_RANGE_LABELS } from '../_constants'

interface AnalyticsDateRangePickerProps {
	/** Current time range preset */
	timeRange: TimeRangePreset
	/** Custom start date (when timeRange is 'custom') */
	startDate?: string | null
	/** Custom end date (when timeRange is 'custom') */
	endDate?: string | null
	/** Handler for preset change */
	onPresetChange: (preset: TimeRangePreset) => void
	/** Handler for custom date range change */
	onCustomRangeChange: (startDate: string, endDate: string) => void
	/** Disabled state */
	disabled?: boolean
}

/**
 * Date range picker for analytics filtering.
 *
 * @example
 * ```tsx
 * <AnalyticsDateRangePicker
 *   timeRange={timeRange}
 *   onPresetChange={setTimeRange}
 *   onCustomRangeChange={setCustomDateRange}
 * />
 * ```
 */
export function AnalyticsDateRangePicker({
	timeRange,
	startDate,
	endDate,
	onPresetChange,
	onCustomRangeChange,
	disabled = false,
}: AnalyticsDateRangePickerProps) {
	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (endDate) {
			onCustomRangeChange(e.target.value, endDate)
		}
	}

	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (startDate) {
			onCustomRangeChange(startDate, e.target.value)
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-3">
			{/* Preset Dropdown */}
			<div className="dropdown dropdown-end">
				<label
					tabIndex={0}
					className={`btn btn-outline btn-sm gap-2 ${disabled ? 'btn-disabled' : ''}`}
				>
					<Calendar className="h-4 w-4" />
					{TIME_RANGE_LABELS[timeRange] || 'Select Range'}
					<ChevronDown className="h-4 w-4" />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu bg-base-100 rounded-box z-50 mt-1 w-52 p-2 shadow-lg border border-base-300"
				>
					{TIME_RANGE_PRESETS.map((option) => (
						<li key={option.value}>
							<button
								type="button"
								className={timeRange === option.value ? 'active' : ''}
								onClick={() => onPresetChange(option.value)}
							>
								{option.label}
							</button>
						</li>
					))}
				</ul>
			</div>

			{/* Custom Date Inputs (shown when 'custom' is selected) */}
			{timeRange === 'custom' && (
				<div className="flex items-center gap-2">
					<input
						type="date"
						className="input input-bordered input-sm"
						value={startDate || ''}
						onChange={handleStartDateChange}
						disabled={disabled}
						aria-label="Start date"
					/>
					<span className="text-base-content/60">to</span>
					<input
						type="date"
						className="input input-bordered input-sm"
						value={endDate || ''}
						onChange={handleEndDateChange}
						disabled={disabled}
						aria-label="End date"
					/>
				</div>
			)}
		</div>
	)
}

export default AnalyticsDateRangePicker
