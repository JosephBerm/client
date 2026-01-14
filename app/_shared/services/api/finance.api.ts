/**
 * Finance API Module
 *
 * Financial reports, analytics, and data exports.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/finance
 */

import type FinanceNumbers from '@_classes/FinanceNumbers'
import type FinanceSearchFilter from '@_classes/FinanceSearchFilter'

import { HttpService } from '../httpService'

// =========================================================================
// FINANCE API
// =========================================================================

/**
 * Finance and Analytics API
 * Financial reports, analytics, and data exports.
 */
export const FinanceApi = {
	/**
	 * Gets current finance analytics numbers.
	 */
	getFinanceNumbers: async () => HttpService.get<FinanceNumbers>('/finance/analytics'),

	/**
	 * Searches finance numbers with date range filtering.
	 */
	searchFinnanceNumbers: async (search: FinanceSearchFilter) =>
		HttpService.post<FinanceNumbers>('/finance/analytics/search', search),

	/**
	 * Downloads finance data as Excel/CSV file.
	 */
	downloadFinanceNumbers: async (search: FinanceSearchFilter) =>
		HttpService.download<Blob>('/finance/orders/download', search, { responseType: 'blob' }),
}
