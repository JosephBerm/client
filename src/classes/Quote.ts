import { TypeOfBusiness } from '@/classes/Enums'
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
}
