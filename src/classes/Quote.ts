import { TypeOfBusiness, QuoteStatus } from '@/classes/Enums'
import { CartProduct } from '@/classes/Product'

export default class Quote {
	id: string = ''
	name: string = ''
	emailAddress: string = ''
	contactName: string = ''
	phoneNumber: string = ''
	typeOfBusiness: TypeOfBusiness | null = null
	description: string = ''
	products: CartProduct[] = []
	status: QuoteStatus = QuoteStatus.Unread
	dateCreated: Date | null = null
}
