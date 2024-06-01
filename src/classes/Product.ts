import { ProductsCategory } from '@/classes/Enums'
import Provider from '@/classes/Provider';
import Guid from '@/classes/Base/Guid';

export class Product {
	id: string = "";
	
	sku: string = ''
	name: string = ''
	description: string = ''
	price: number = 0
	image: string | null = null
	category: ProductsCategory | null = null
	providerId: number | null = null
	provider: Provider | null = null

	toString(): string {
		return `Product: ${this.name} - ${this.description} - ${this.price} - ${this.image} - ${this.category}`
	}

	constructor(product: Partial<Product>) {
		this.id = product?.id || Guid.newGuid();
		this.sku = product?.sku || '';
		this.name = product?.name || '';
		this.description = product?.description || '';
		this.price = product?.price || 0;
		this.image = product?.image || null;
		this.category = product?.category || null;
		this.providerId = product?.providerId || null;
		this.provider = product?.provider || null;
	}
}

export class CartProduct {
	product: IProduct | null
	quantity: number
	productId: string | null = null

	constructor(product: Product | null, quantity: number) {
		this.product = product
		this.quantity = quantity
	}
}

export interface IProduct extends Product {}
