import ProductsCategory from '@/classes/ProductsCategory'
import Provider from '@/classes/Provider'
import Guid from '@/classes/Base/Guid'
import HtmlImage from '@/classes/HtmlImage'
import UploadedFile from '@/classes/UploadedFile'

export class Product {
	id: string = ''

	sku: string = ''
	name: string = ''
	files: UploadedFile[] = []
	description: string = ''
	price: number = 0
	image: File | null = null
	category: ProductsCategory[] = []
	providerId: number | null = null
	provider: Provider | null = null
	createdAt: Date = new Date()

	toString(): string {
		return `Product: ${this.name} - ${this.description} - ${this.price} - ${this.category}`
	}

	constructor(product: Partial<Product>) {
		this.id = product?.id || Guid.newGuid()
		this.files = product?.files?.length ? product.files.map((x) => new UploadedFile(x)) : []
		this.sku = product?.sku || ''
		this.name = product?.name || ''
		this.description = product?.description || ''
		this.price = product?.price || 0
		this.image = product.image || null
		this.category = product?.category?.length ? product.category.map((x) => new ProductsCategory(x)) : []
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
	product: IProduct | null
	quantity: number
	productId: string | null = null

	constructor(product: Product | null, quantity: number) {
		this.product = product
		this.quantity = quantity
	}
}

export interface IProduct extends Product {}
