/**
 * Customer summary data model containing aggregated analytics information.
 * Used in the analytics dashboard to display customer activity metrics.
 * 
 * @example
 * ```typescript
 * const summary = new CustomerSummary({
 *   productRequests: 15,
 *   ordersInProgress: 8,
 *   ordersCompleted: 42
 * });
 * 
 * const details = summary.GenerateOverviewDetails();
 * // Returns an array of OverviewDetail objects for UI display
 * ```
 */
class CustomerSummary {
	/** Number of product/quote requests made by the customer */
	public productRequests: number = 0
	
	/** Number of orders currently in progress (not yet completed) */
	public ordersInProgress: number = 0
	
	/** Total number of completed orders */
	public ordersCompleted: number = 0

	/**
	 * Creates a new CustomerSummary instance.
	 * 
	 * @param {Partial<CustomerSummary>} customerSummary - Partial initialization object
	 * 
	 * @example
	 * ```typescript
	 * const summary = new CustomerSummary({
	 *   productRequests: 5,
	 *   ordersInProgress: 2,
	 *   ordersCompleted: 10
	 * });
	 * ```
	 */
	constructor(customerSummary: Partial<CustomerSummary>) {
		Object.assign(this, customerSummary)
	}

	/**
	 * Generates an array of overview details for dashboard display.
	 * Each detail includes a title, value, time period, and icon.
	 * 
	 * @returns {OverviewDetail[]} Array of formatted overview details
	 * 
	 * @example
	 * ```typescript
	 * const summary = new CustomerSummary({ ... });
	 * const widgets = summary.GenerateOverviewDetails();
	 * // [
	 * //   { title: 'Product Requests', value: 15, selectedTime: 7, icon: '...' },
	 * //   { title: 'Orders In Process', value: 8, selectedTime: 30, icon: '...' },
	 * //   { title: 'Total Orders Completed', value: 42, selectedTime: 90, icon: '...' }
	 * // ]
	 * ```
	 */
	GenerateOverviewDetails(): OverviewDetail[] {
		const overviewDetailsList: OverviewDetail[] = [
			// Product requests overview (last 7 days)
			new OverviewDetail({
				title: 'Product Requests',
				value: this.productRequests,
				selectedTime: 7,
				icon: 'fa-solid fa-bell-concierge',
			}),
			// In-progress orders overview (last 30 days)
			new OverviewDetail({
				title: 'Orders In Process',
				value: this.ordersInProgress,
				selectedTime: 30,
				icon: 'fa-solid fa-truck',
			}),
			// Completed orders overview (last 90 days)
			new OverviewDetail({
				title: 'Total Orders Completed',
				value: this.ordersCompleted,
				selectedTime: 90,
				icon: 'fa-solid fa-box',
			}),
		]
		return overviewDetailsList
	}
}

/**
 * Overview detail model for dashboard widgets.
 * Represents a single metric tile in the analytics dashboard.
 * 
 * @example
 * ```typescript
 * const detail = new OverviewDetail({
 *   title: 'Active Orders',
 *   value: 25,
 *   selectedTime: 30,
 *   icon: 'fa-solid fa-shopping-cart'
 * });
 * ```
 */
class OverviewDetail {
	/** Display title for the metric */
	public title: string = ''
	
	/** Numeric value of the metric */
	public value: number = 0
	
	/** Time period in days for the metric (e.g., 7, 30, 90) */
	public selectedTime: number = 0
	
	/** Font Awesome icon class for visual representation */
	public icon: string = ''

	/**
	 * Creates a new OverviewDetail instance.
	 * 
	 * @param {Partial<OverviewDetail>} overviewDetail - Partial initialization object
	 * 
	 * @example
	 * ```typescript
	 * const detail = new OverviewDetail({
	 *   title: 'New Customers',
	 *   value: 12,
	 *   selectedTime: 7,
	 *   icon: 'fa-solid fa-user-plus'
	 * });
	 * ```
	 */
	constructor(overviewDetail: Partial<OverviewDetail>) {
		Object.assign(this, overviewDetail)
	}
}

export { CustomerSummary, OverviewDetail }

export default CustomerSummary
