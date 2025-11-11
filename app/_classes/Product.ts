import ProductsCategory from '@_classes/ProductsCategory'
import Provider from '@_classes/Provider'
import Guid from '@_classes/Base/Guid'
import HtmlImage from '@_classes/HtmlImage'
import UploadedFile from '@_classes/UploadedFile'
// RichConstructor decorator not needed in modern Next.js

export class Product {
	id: string = ''

	sku: string = ''
	name: string = ''
	files: UploadedFile[] = []
	description: string = ''
	price: number = 0
	stock: number = 0  // Added for inventory tracking
	category: string = ''  // Added for simplified category reference
	manufacturer: string = ''  // Added for manufacturer reference
	categoryIds: number[] = []
	categories: ProductsCategory[] = []
	providerId: number | null = null
	provider: Provider | null = null
	createdAt: Date = new Date()
	updatedAt: Date = new Date()
	images: HtmlImage[] = []  // Added for image references

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
		this.stock = product?.stock || 0
		this.category = product?.category || ''
		this.manufacturer = product?.manufacturer || ''
		this.categories = product?.categories?.length ? product.categories.map((x) => new ProductsCategory(x)) : []
		this.categoryIds = product?.categoryIds || []
		this.providerId = product?.providerId || null
		this.provider = product?.provider || null
		this.images = product?.images?.length ? product.images.map((x) => new HtmlImage(x)) : []
		this.createdAt = product?.createdAt ? new Date(product?.createdAt) : new Date()
		this.updatedAt = product?.updatedAt ? new Date(product?.updatedAt) : new Date()
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
