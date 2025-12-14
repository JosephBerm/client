/**
 * Customer Feature Types
 * 
 * Type definitions for customer management functionality.
 * 
 * @module customers/types
 */

import type Company from '@_classes/Company'

/**
 * Customer statistics returned from the API.
 */
export interface CustomerStats {
	customerId: number
	totalOrders: number
	totalQuotes: number
	totalAccounts: number
	totalRevenue: number
	lastOrderDate: Date | null
	createdAt: Date
}

/**
 * Customer filter options for search.
 */
export interface CustomerFilterOptions {
	searchTerm?: string
	typeOfBusiness?: TypeOfBusiness
	status?: CustomerStatus
	primarySalesRepId?: number
	showArchived?: boolean
}

/**
 * Customer list item with computed properties.
 */
export interface CustomerListItem extends Company {
	salesRepName?: string
	orderCount?: number
	lastActivityDate?: Date
}

/**
 * Sales rep assignment request.
 */
export interface AssignSalesRepRequest {
	salesRepId: number
}

/**
 * Customer status badge configuration.
 */
export interface CustomerStatusConfig {
	label: string
	color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
	icon?: string
}

/**
 * Business type configuration for display.
 */
export interface BusinessTypeConfig {
	label: string
	icon: string
	description: string
}

/**
 * Aggregate customer statistics for dashboard.
 * Provides counts by status and assignment metrics.
 */
export interface AggregateCustomerStats {
	totalCustomers: number
	activeCustomers: number
	pendingVerification: number
	suspendedCustomers: number
	inactiveCustomers: number
	churnedCustomers: number
	assignedToSalesRep: number
	unassigned: number
	byBusinessType: Record<string, number>
}

