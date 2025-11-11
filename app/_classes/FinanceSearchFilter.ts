/**
 * FinanceSearchFilter Entity Class
 * 
 * Represents search/filter parameters for financial analytics queries.
 * Used to filter finance data by date range, order status range, and optional customer ID.
 * Enables targeted financial reporting and analytics for specific time periods and statuses.
 * 
 * **Features:**
 * - Date range filtering (from/to dates)
 * - Order status range (from/to status)
 * - Optional customer filtering
 * - Used with finance analytics endpoints
 * 
 * **Use Cases:**
 * - Financial reports for specific date ranges
 * - Revenue analysis by order status
 * - Customer-specific financial metrics
 * - Date-based analytics (monthly, quarterly, yearly reports)
 * 
 * **Related Classes:**
 * - FinanceNumbers: Response data structure
 * - OrderStatus: Enum for order status values
 * 
 * @example
 * ```typescript
 * // Filter for Q1 2024 delivered orders
 * const filter = new FinanceSearchFilter();
 * filter.FromDate = new Date('2024-01-01');
 * filter.ToDate = new Date('2024-03-31');
 * filter.FromStatus = OrderStatus.Placed;
 * filter.ToStatus = OrderStatus.Delivered;
 * 
 * const response = await API.Finance.searchFinnanceNumbers(filter);
 * const analytics = new FinanceNumbers(response.data.payload);
 * console.log('Q1 Revenue:', analytics.sales.totalRevenue);
 * 
 * // Filter for specific customer
 * const customerFilter = new FinanceSearchFilter();
 * customerFilter.customerId = '12345';
 * customerFilter.FromDate = new Date('2023-01-01');
 * customerFilter.ToDate = new Date('2023-12-31');
 * 
 * // Download finance report
 * const downloadFilter = new FinanceSearchFilter();
 * downloadFilter.FromDate = new Date('2024-01-01');
 * downloadFilter.ToDate = new Date('2024-12-31');
 * const fileResponse = await API.Finance.downloadFinanceNumbers(downloadFilter);
 * ```
 * 
 * @module FinanceSearchFilter
 */

import { OrderStatus } from '@_classes/Enums'

/**
 * FinanceSearchFilter Entity Class
 * 
 * Filter parameters for financial analytics queries.
 * Defines date range, order status range, and optional customer ID for targeted financial reports.
 */
export default class FinanceSearchFilter {
	/**
	 * Start date for financial data (inclusive).
	 * Defaults to Unix epoch (Jan 1, 1970) to include all historical data.
	 */
	public FromDate: Date | null = new Date(0)

	/**
	 * End date for financial data (inclusive).
	 * Defaults to current date/time.
	 */
	public ToDate: Date | null = new Date()

	/**
	 * Starting order status to include in results.
	 * Defaults to Placed (earliest status in order lifecycle).
	 */
	public FromStatus: OrderStatus = OrderStatus.Placed

	/**
	 * Ending order status to include in results.
	 * Defaults to Delivered (final status in order lifecycle).
	 */
	public ToStatus: OrderStatus = OrderStatus.Delivered

	/**
	 * Optional customer ID to filter results for specific customer.
	 * When undefined, includes all customers.
	 */
	public customerId?: string
}

