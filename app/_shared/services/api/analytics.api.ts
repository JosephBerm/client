/**
 * Analytics API Module
 *
 * Business intelligence analytics for sales performance, revenue tracking.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/analytics
 */

import type {
	AnalyticsSummary,
	SalesRepPerformance as SalesRepPerformanceType,
	RevenueData as RevenueDataType,
} from '@_types/analytics.types'

import { HttpService } from '../httpService'

// =========================================================================
// ANALYTICS API
// =========================================================================

/**
 * Business Intelligence Analytics API
 * Role-based analytics for sales performance, revenue tracking, and quote pipeline.
 *
 * @see prd_analytics.md
 */
export const AnalyticsApi = {
	/**
	 * Gets analytics summary for the current user based on their role.
	 */
	getSummary: async (startDate?: string, endDate?: string) => {
		const params = new URLSearchParams()
		if (startDate) params.append('startDate', startDate)
		if (endDate) params.append('endDate', endDate)
		const query = params.toString()
		return HttpService.get<AnalyticsSummary>(`/analytics/summary${query ? `?${query}` : ''}`)
	},

	/**
	 * Gets team performance metrics.
	 * **Authorization:** SalesManager or Admin only.
	 */
	getTeamPerformance: async (startDate?: string, endDate?: string) => {
		const params = new URLSearchParams()
		if (startDate) params.append('startDate', startDate)
		if (endDate) params.append('endDate', endDate)
		const query = params.toString()
		return HttpService.get<SalesRepPerformanceType[]>(`/analytics/team${query ? `?${query}` : ''}`)
	},

	/**
	 * Gets revenue timeline data for charting.
	 * **Authorization:** SalesManager or Admin only.
	 */
	getRevenueTimeline: async (
		startDate: string,
		endDate: string,
		granularity: 'day' | 'week' | 'month' = 'month'
	) =>
		HttpService.get<RevenueDataType[]>(
			`/analytics/revenue?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`
		),

	/**
	 * Gets individual sales rep performance.
	 */
	getRepPerformance: async (salesRepId?: string, startDate?: string, endDate?: string) => {
		const params = new URLSearchParams()
		if (startDate) params.append('startDate', startDate)
		if (endDate) params.append('endDate', endDate)
		const query = params.toString()
		const path = salesRepId ? `/analytics/rep/${salesRepId}` : '/analytics/rep'
		return HttpService.get<SalesRepPerformanceType>(`${path}${query ? `?${query}` : ''}`)
	},
}
