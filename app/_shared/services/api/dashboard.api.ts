/**
 * Dashboard API Module
 *
 * Role-based dashboard statistics, tasks, and recent items.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/dashboard
 */

import type { DashboardStats, DashboardTask, RecentItem } from '@_types/dashboard.types'

import { HttpService } from '../httpService'

// =========================================================================
// DASHBOARD API
// =========================================================================

/**
 * Dashboard API
 * Role-based dashboard statistics, tasks, and recent items.
 *
 * @see prd_dashboard.md
 */
export const DashboardApi = {
	/**
	 * Gets dashboard statistics for the current user based on their role.
	 */
	getStats: async () => HttpService.get<DashboardStats>('/dashboard/stats'),

	/**
	 * Gets dashboard tasks requiring attention for the current user.
	 */
	getTasks: async () => HttpService.get<DashboardTask[]>('/dashboard/tasks'),

	/**
	 * Gets recent items (quotes and orders) for dashboard display.
	 */
	getRecentItems: async (count: number = 5) => HttpService.get<RecentItem[]>(`/dashboard/recent?count=${count}`),
}
