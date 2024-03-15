import { ProductsCategory } from '@/classes/Enums'

export class Product {
	id: string | null = null
	sku: string = ''
	name: string = ''
	description: string = ''
	price: number = 0
	image: string | null = null
	category: ProductsCategory | null = null

	toString(): string {
		return `Product: ${this.name} - ${this.description} - ${this.price} - ${this.image} - ${this.category}`
	}
}

export class CartProduct {
	product: IProduct
	quantity: number

	constructor(product: IProduct, quantity: number) {
		this.product = product
		this.quantity = quantity
	}
}

export interface IProduct  extends Product {}
