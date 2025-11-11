export default class FinanceNumbers {
	sales: FSales = new FSales()
	orders: COrders = new COrders()

	constructor(param?: Partial<FinanceNumbers>) {
		if (param) {
			Object.assign(this, param)
			if (param.sales) {
				this.sales = new FSales(param.sales)
			}
			if (param.orders) {
				this.orders = new COrders(param.orders)
			}
		}
	}

	/**
	 * @description Profit Margin
	 * @returns {number}
	 */
	get profitMargin() {
		return (this.sales.totalProfit / this.sales.totalRevenue) * 100
	}

	/**
	 * @description Average Order Value
	 * @returns {number}
	 */
	get averageOrderValue() {
		return this.sales.totalRevenue / this.orders.totalOrders
	}
}

export class FSales {
	totalSales: number = 0
	totalRevenue: number = 0
	totalCost: number = 0
	totalProfit: number = 0
	totalDiscount: number = 0
	totalTax: number = 0
	totalShipping: number = 0

	constructor(partial?: Partial<FSales>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}

export class COrders {
	totalOrders: number = 0
	totalProductsSold: number = 0

	constructor(partial?: Partial<COrders>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}
