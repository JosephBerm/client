import { Product } from './Product'
import Address from '@_classes/common/Address'
// RichConstructor decorator not needed in modern Next.js
export default class Provider {
	id: number = 0
	name: string = ''
	email: string = ''
	phone: string = ''
	taxId: string = ''  // Added for tax identification
	website: string = ''
	identifier: string = ''
	address: Address = new Address()  // Restructured as Address object
	// Legacy flat address fields for backward compatibility
	city: string = ''
	state: string = ''
	zip: string = ''
	country: string = ''
	products: Product[] = []
	createdAt: Date = new Date()
	updatedAt: Date | null = null

	constructor(partial?: Partial<Provider>) {
		if (partial) {
			Object.assign(this, partial)
			if (partial.address) {
				this.address = new Address(partial.address)
			}
			if (partial.createdAt) this.createdAt = new Date(partial.createdAt)
			if (partial.updatedAt) this.updatedAt = new Date(partial.updatedAt)
			if (this.products) this.products = this.products.map((p) => new Product(p))
		}
	}
}
