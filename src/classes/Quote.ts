import { TypeOfBusiness, QuoteStatus } from '@/classes/Enums'
import { CartProduct } from '@/classes/Product'
import Address from './Address'
import Name from '@/classes/common/Name'
import Company from '@/classes/Company'

export default class Quote {
	id: string = ''
	name: Name = new Name()
	companyName: string = ''
	transitDetails: Address = new Address()
	emailAddress: string = ''
	phoneNumber: string = ''
	products: CartProduct[] = []
	description: string = ''
	dateCreated: Date = new Date()
	status: QuoteStatus = QuoteStatus.Unread
}
