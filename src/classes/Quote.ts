import { TypeOfBusiness, QuoteStatus } from '@/classes/Enums'
import { CartProduct } from '@/classes/Product'
import Address from './common/Address'
import Name from '@/classes/common/Name'
import Company from '@/classes/Company'
import { RichConstructor } from '@/decorators/RichConstructor'


export default class Quote {
	id: string = ''
	name: Name = new Name()
	companyName: string = ''
	transitDetails: Address = new Address()
	emailAddress: string = ''
	phoneNumber: string = ''
	products: CartProduct[] = []
	description: string = ''
	createdAt: Date = new Date()
	status: QuoteStatus = QuoteStatus.Unread

	constructor(param?: Partial<Quote>) {
		if (param) {
			Object.assign(this, param)
			// Handle deep copying for nested objects and arrays
			if (param.name) {
				this.name = new Name(param.name)
			}
			if (param.transitDetails) {
				this.transitDetails = new Address(param.transitDetails)
			}
			if (param.products) {
				this.products = param.products.map((p) => new CartProduct(p))
			}
			if (param.createdAt) {
				this.createdAt = new Date(param.createdAt)
			}
		}
	}
}
