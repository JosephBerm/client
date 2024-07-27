import Quote from '@/classes/Quote'
import User from '@/classes/User'
import Order from '@/classes/Order'
import Address from '@/classes/common/Address'

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
			if (partial.shippingAddress) {
				console.log('partial.shippingAddress', partial.shippingAddress)
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
