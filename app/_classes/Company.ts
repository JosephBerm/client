import Quote from '@_classes/Quote'
import User from '@_classes/User'
import Order from '@_classes/Order'
import Address from '@_classes/common/Address'

export default class Company {
	id: number = 0
	name: string = ''
	email: string = ''
	phone: string = ''
	city: string = ''
	state: string = ''
	zip: string = ''
	country: string = ''
	identifier: string = ''
	taxId: string = ''  // Added for tax identification
	website: string = ''  // Added for company website
	address: Address = new Address()  // Added for simplified address reference
	createdAt: Date = new Date()
	updatedAt: Date | null = null
	shippingAddress: Address = new Address()
	billingAddress: Address = new Address()

	quotes: Quote[] = []
	orders: Order[] = []
	users: User[] = []

	constructor(partial?: Partial<Company>) {
		if (partial) {
			Object.assign(this, partial) // Assign provided properties

			// Handle deep copying for nested objects
			if (partial.address) {
				this.address = new Address(partial.address)
			}
			if (partial.shippingAddress) {
				this.shippingAddress = new Address(partial.shippingAddress)
			}
			if (partial.billingAddress) {
				this.billingAddress = new Address(partial.billingAddress)
			}
			if (partial.quotes) {
				this.quotes = partial.quotes.map((q) => new Quote(q))
			}
			if (partial.orders) {
				this.orders = partial.orders.map((o) => new Order(o))
			}
			if (partial.users) {
				this.users = partial.users.map((u) => new User(u))
			}

			// Ensure identifier is never null
			this.identifier = partial.identifier || ''
			// Ensure createdAt is always a Date object
			this.createdAt =
				partial.createdAt instanceof Date ? partial.createdAt : new Date(partial.createdAt ?? Date.now())
		}
	}
}
