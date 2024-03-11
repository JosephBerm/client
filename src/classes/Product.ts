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
