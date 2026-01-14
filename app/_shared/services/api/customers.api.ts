/**
 * Customers API Module
 *
 * B2B customer organization management and relationships.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/customers
 */

import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type Company from '@_classes/Company'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

import { HttpService } from '../httpService'

// =========================================================================
// CUSTOMERS API
// =========================================================================

/**
 * Customer/Company Management API
 * Manages B2B customer organizations and their relationships.
 */
export const CustomersApi = {
	/**
	 * Gets a single customer by ID.
	 */
	get: async <Customer>(id: number) => HttpService.get<Customer>(`/customer/${id}`),

	/**
	 * Gets all customers.
	 * For SalesReps: Returns only assigned customers (backend filters).
	 * For Admin/SalesManager: Returns all customers.
	 */
	getAll: async <Customer>() => HttpService.get<Customer[]>('/customers'),

	/**
	 * Creates a new customer.
	 */
	create: async <Customer>(customer: Customer) => HttpService.post<Customer>('/customer', customer),

	/**
	 * Updates an existing customer.
	 */
	update: async <Customer>(customer: Customer) => HttpService.put<Customer>('/customer', customer),

	/**
	 * Deletes a customer (Admin only).
	 */
	delete: async (customerId: number) => HttpService.delete<boolean>(`/customer/${customerId}`),

	/**
	 * Searches customers with pagination and filtering.
	 */
	search: async (search: GenericSearchFilter) => HttpService.post<PagedResult<Company>>(`/customers/search`, search),

	/**
	 * Rich search for customers with advanced filtering, sorting, and facets.
	 */
	richSearch: async (filter: RichSearchFilter) =>
		HttpService.post<RichPagedResult<Company>>(`/customers/search/rich`, filter),

	/**
	 * Gets customer statistics (order count, revenue, etc.).
	 */
	getStats: async (customerId: number) =>
		HttpService.get<{
			customerId: number
			totalOrders: number
			totalQuotes: number
			totalAccounts: number
			totalRevenue: number
			lastOrderDate: string | null
			createdAt: string
		}>(`/customer/${customerId}/stats`),

	/**
	 * Gets aggregate statistics for customer dashboard.
	 */
	getAggregateStats: async () =>
		HttpService.get<{
			totalCustomers: number
			activeCustomers: number
			pendingVerification: number
			suspendedCustomers: number
			inactiveCustomers: number
			churnedCustomers: number
			assignedToSalesRep: number
			unassigned: number
			byBusinessType: Record<string, number>
		}>('/customers/stats/aggregate'),

	/**
	 * Assigns a primary sales rep to a customer.
	 */
	assignSalesRep: async (customerId: number, salesRepId: number) =>
		HttpService.put<Company>(`/customer/${customerId}/assign-sales-rep`, { salesRepId }),
}
