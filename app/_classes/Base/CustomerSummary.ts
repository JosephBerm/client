class CustomerSummary {
	public productRequests: number = 0
	public ordersInProgress: number = 0
	public ordersCompleted: number = 0

	constructor(customerSummary: Partial<CustomerSummary>) {
		Object.assign(this, customerSummary)
	}

	GenerateOverviewDetails() {
		const overviewDetailsList: OverviewDetail[] = [
			new OverviewDetail({
				title: 'Product Requests',
				value: this.productRequests,
				selectedTime: 7,
				icon: 'fa-solid fa-bell-concierge',
			}),
			new OverviewDetail({
				title: 'Orders In Process',
				value: this.ordersInProgress,
				selectedTime: 30,
				icon: 'fa-solid fa-truck',
			}),
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

class OverviewDetail {
	public title: string = ''
	public value: number = 0
	public selectedTime: number = 0
	public icon: string = ''

	constructor(overviewDetail: Partial<OverviewDetail>) {
		Object.assign(this, overviewDetail)
	}
}

export { CustomerSummary, OverviewDetail }

export default CustomerSummary
