/**
 * Finance Analytics Entity Classes
 * 
 * Represents financial analytics and metrics for the MedSource Pro system.
 * Provides comprehensive sales and order statistics with calculated metrics
 * like profit margin and average order value.
 * 
 * **Features:**
 * - Sales metrics (revenue, cost, profit, tax, shipping, discount)
 * - Order metrics (total orders, products sold)
 * - Calculated financial KPIs (profit margin, average order value)
 * - Real-time analytics dashboard data
 * 
 * **Key Metrics:**
 * - **Total Revenue**: Sum of all order totals
 * - **Total Cost**: Sum of product costs
 * - **Total Profit**: Revenue - Cost
 * - **Profit Margin**: (Profit / Revenue) × 100
 * - **Average Order Value**: Revenue / Total Orders
 * - **Total Tax**: Sum of sales tax collected
 * - **Total Shipping**: Sum of shipping charges
 * - **Total Discount**: Sum of discounts applied
 * 
 * **Classes:**
 * - FinanceNumbers: Main analytics container with calculated metrics
 * - FSales: Sales financial data (revenue, cost, profit, etc.)
 * - COrders: Order count data (total orders, products sold)
 * 
 * @example
 * ```typescript
 * // Create finance analytics from backend data
 * const analytics = new FinanceNumbers({
 *   sales: new FSales({
 *     totalSales: 150,
 *     totalRevenue: 125000.00,
 *     totalCost: 75000.00,
 *     totalProfit: 50000.00,
 *     totalDiscount: 5000.00,
 *     totalTax: 11250.00,
 *     totalShipping: 3000.00
 *   }),
 *   orders: new COrders({
 *     totalOrders: 150,
 *     totalProductsSold: 3250
 *   })
 * });
 * 
 * // Calculate KPIs
 * import { logger } from '@_core';
 * 
 * logger.info('Financial KPIs calculated', {
 *   profitMargin: analytics.profitMargin + '%',
 *   averageOrderValue: analytics.averageOrderValue
 * }); // Profit Margin: 40%, Average Order Value: $833.33
 * 
 * // Display on dashboard
 * <Card>
 *   <h3>Financial Overview</h3>
 *   <p>Revenue: ${analytics.sales.totalRevenue}</p>
 *   <p>Profit: ${analytics.sales.totalProfit}</p>
 *   <p>Profit Margin: {analytics.profitMargin.toFixed(2)}%</p>
 *   <p>Avg Order Value: ${analytics.averageOrderValue.toFixed(2)}</p>
 * </Card>
 * ```
 * 
 * @module FinanceNumbers
 */

/**
 * FinanceNumbers Entity Class
 * 
 * Main financial analytics entity containing sales and order metrics.
 * Provides calculated KPIs like profit margin and average order value.
 */
export default class FinanceNumbers {
	/** Sales financial data (revenue, cost, profit, etc.) */
	sales: FSales = new FSales()
	
	/** Order count data (total orders, products sold) */
	orders: COrders = new COrders()

	/**
	 * Creates a new FinanceNumbers instance.
	 * Deeply copies nested sales and orders objects.
	 * 
	 * @param {Partial<FinanceNumbers>} param - Partial finance data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic analytics
	 * const finance = new FinanceNumbers({
	 *   sales: new FSales({
	 *     totalRevenue: 50000,
	 *     totalCost: 30000,
	 *     totalProfit: 20000
	 *   }),
	 *   orders: new COrders({
	 *     totalOrders: 75
	 *   })
	 * });
	 * 
	 * // From backend response
	 * const response = await API.Finance.getFinanceNumbers();
	 * const analytics = new FinanceNumbers(response.data.payload);
	 * ```
	 */
	constructor(param?: Partial<FinanceNumbers>) {
		if (param) {
			Object.assign(this, param)
			
			// Deep copy sales object
			if (param.sales) {
				this.sales = new FSales(param.sales)
			}
			
			// Deep copy orders object
			if (param.orders) {
				this.orders = new COrders(param.orders)
			}
		}
	}

	/**
	 * Calculates profit margin percentage.
	 * Formula: (Total Profit / Total Revenue) × 100
	 * 
	 * @returns {number} Profit margin percentage (0-100)
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core';
	 * 
	 * const finance = new FinanceNumbers({
	 *   sales: new FSales({
	 *     totalRevenue: 100000,
	 *     totalProfit: 35000
	 *   })
	 * });
	 * 
	 * logger.debug('Profit margin calculated', { profitMargin: finance.profitMargin }); // 35
	 * ```
	 */
	get profitMargin() {
		return (this.sales.totalProfit / this.sales.totalRevenue) * 100
	}

	/**
	 * Calculates average order value (AOV).
	 * Formula: Total Revenue / Total Orders
	 * 
	 * @returns {number} Average order value in dollars
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core';
	 * 
	 * const finance = new FinanceNumbers({
	 *   sales: new FSales({ totalRevenue: 50000 }),
	 *   orders: new COrders({ totalOrders: 100 })
	 * });
	 * 
	 * logger.debug('Average order value calculated', { averageOrderValue: finance.averageOrderValue }); // 500
	 * ```
	 */
	get averageOrderValue() {
		return this.sales.totalRevenue / this.orders.totalOrders
	}
}

/**
 * FSales Entity Class
 * 
 * Financial sales data including revenue, costs, taxes, and other financial metrics.
 * Used within FinanceNumbers to represent the sales side of analytics.
 */
export class FSales {
	/** Total number of completed sales */
	totalSales: number = 0
	
	/** Total revenue from all orders (sum of order totals) */
	totalRevenue: number = 0
	
	/** Total cost of goods sold (sum of product costs) */
	totalCost: number = 0
	
	/** Total profit (revenue - cost) */
	totalProfit: number = 0
	
	/** Total discounts applied to orders */
	totalDiscount: number = 0
	
	/** Total sales tax collected */
	totalTax: number = 0
	
	/** Total shipping charges */
	totalShipping: number = 0

	/**
	 * Creates a new FSales instance.
	 * 
	 * @param {Partial<FSales>} partial - Partial sales data to initialize
	 * 
	 * @example
	 * ```typescript
	 * const sales = new FSales({
	 *   totalSales: 200,
	 *   totalRevenue: 250000.00,
	 *   totalCost: 150000.00,
	 *   totalProfit: 100000.00,
	 *   totalDiscount: 10000.00,
	 *   totalTax: 22500.00,
	 *   totalShipping: 5000.00
	 * });
	 * ```
	 */
	constructor(partial?: Partial<FSales>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}

/**
 * COrders Entity Class
 * 
 * Order count metrics including total orders and products sold.
 * Used within FinanceNumbers to represent the order volume side of analytics.
 */
export class COrders {
	/** Total number of orders processed */
	totalOrders: number = 0
	
	/** Total number of individual products sold across all orders */
	totalProductsSold: number = 0

	/**
	 * Creates a new COrders instance.
	 * 
	 * @param {Partial<COrders>} partial - Partial order data to initialize
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core';
	 * 
	 * const orders = new COrders({
	 *   totalOrders: 150,
	 *   totalProductsSold: 3500
	 * });
	 * 
	 * const avgProducts = orders.totalProductsSold / orders.totalOrders;
	 * logger.debug('Average products per order calculated', { averageProductsPerOrder: avgProducts }); // 23.33
	 * ```
	 */
	constructor(partial?: Partial<COrders>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}
