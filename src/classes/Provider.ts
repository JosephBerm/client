import { Product } from './Product'
import { RichConstructor } from '@/decorators/RichConstructor'
export default class Provider {
	id: number = 0
	name: string = ''
	email: string = ''
	phone: string = ''
	address: string = ''
	city: string = ''
	state: string = ''
	zip: string = ''
	country: string = ''
	website: string = ''
	identifier: string = ''
	products: Product[] = []
	createdAt: Date = new Date()
	updatedAt: Date | null = null

	constructor(partial?: Partial<Provider>) {
		if (partial) {
			Object.assign(this, partial)
			if (partial.createdAt) this.createdAt = new Date(partial.createdAt)
			if (partial.updatedAt) this.updatedAt = new Date(partial.updatedAt)
			if (this.products) this.products = this.products.map((p) => new Product(p))
		}
	}
}
