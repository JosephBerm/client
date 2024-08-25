import ProductsCategory from '@/classes/ProductsCategory'
import Provider from '@/classes/Provider'
import Guid from '@/classes/Base/Guid'
import HtmlImage from '@/classes/HtmlImage'
import UploadedFile from '@/classes/UploadedFile'
import { RichConstructor } from '@/decorators/RichConstructor'

export class Product {
	id: string = ''

	sku: string = ''
	name: string = ''
	files: UploadedFile[] = []
	description: string = ''
	price: number = 0
	categoryIds: number[] = []
	categories: ProductsCategory[] = []
	providerId: number | null = null
	provider: Provider | null = null
	createdAt: Date = new Date()
	updatedAt: Date = new Date()

	toString(): string {
		return `Product: ${this.name} - ${this.description} - ${this.price} - ${this.categories}`
	}

	constructor(product: Partial<Product>) {
		this.id = product?.id || Guid.newGuid()
		this.files = product?.files?.length ? product.files.map((x) => new UploadedFile(x)) : []
		this.sku = product?.sku || ''
		this.name = product?.name || ''
		this.description = product?.description || ''
		this.price = product?.price || 0
		this.categories = product?.categories?.length ? product.categories.map((x) => new ProductsCategory(x)) : []
		this.providerId = product?.providerId || null
		this.provider = product?.provider || null
		this.createdAt = product?.createdAt ? new Date(product?.createdAt) : new Date()
	}

	getFileName(): string {
		return this.files[0]?.name ?? ''
	}

	hasImage(): boolean {
		return this.files.length > 0 && this.files[0].name !== null
	}
}

export class CartProduct {
	product: IProduct | null = null
	quantity: number = 0
	productId: string | null = null

	constructor(param?: Partial<CartProduct>) {
		if (param) {
			Object.assign(this, param)
			// // Handle deep copying for nested objects if necessary
			// if (param.product) {
			// 	this.product = { ...param.product, getFileName: () => '', hasImage: () => false }
			// }

			// the problme with the code above is that getFileName and hasImage are overriden by meaningless functions
		}
	}
}

export interface IProduct extends Product {}
