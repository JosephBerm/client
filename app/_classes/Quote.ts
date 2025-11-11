import { TypeOfBusiness, QuoteStatus } from '@_classes/Enums'
import { CartProduct } from '@_classes/Product'
import Address from './common/Address'
import Name from '@_classes/common/Name'
import Company from '@_classes/Company'
// RichConstructor decorator not needed in modern Next.js


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
