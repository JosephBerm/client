import { CartProduct } from "./Product"

export class Quote {
    id: string = ''
	name: string = ''
	emailAddress: string = ''
	contactName: string = ''
	phoneNumber: string = ''
	typeOfBusiness: TypeOfBusiness | null = null
	description: string = ''
	products: CartProduct[] = []
}

export enum TypeOfBusiness {
	Dentist,
	SurgeryCenter,
	Hospital,
	Veterinarian,
	Restaurant,
	Construction,
	Other,
}