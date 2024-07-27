import Company from './Company'
import { OrderStatus } from '@/classes/Enums'
import { Product } from './Product'
import Quote from './Quote'
import Address from './common/Address'

export default class Order {
	id: number | null = null
	products: OrderItem[] = []
	total: number = 0
	createdAt: Date = new Date()
	customer: Company | null = null
	customerId: number | null = null
	status: OrderStatus = OrderStatus.Pending
	salesTax = 0
	shipping = 0
	discount = 0

	CreateFromQuote(quote: Quote) {
		this.products = quote.products.map((cartProduct) => {
			const orderItem = new OrderItem({
				product: new Product(cartProduct.product ?? {}),
				quantity: cartProduct.quantity,
				total: (cartProduct.product?.price ?? 0) * (cartProduct.quantity ?? 0),
			})
			return orderItem
		})

		this.total = this.products.reduce((acc, item) => acc + item.total, 0)
	}

	constructor(param?: Partial<Order>) {
		if (param) {
			Object.assign(this, param)
			// Handle deep copying for nested objects and arrays
			if (param.products) {
				this.products = param.products.map((p) => new OrderItem(p))
			}
			if (param.createdAt) {
				this.createdAt = new Date(param.createdAt)
			}
			if (param.customer) {
				this.customer = new Company(param.customer)
			}
		}
	}
}

export class OrderItem {
	id: number | null = null
	productId: string | null = null
	product: Product | null = null
	quantity: number = 0
	sellPrice: number = 0
	buyPrice: number = 0
	isSold: boolean = false
	total: number = 0
	order: Order | null = null
	orderId: number = 0
	transitDetails: TransitDetails = new TransitDetails()

	constructor(param?: Partial<OrderItem>) {
		if (param) {
			Object.assign(this, param)
			// Handle deep copying for nested objects
			if (param.product) {
				this.product = new Product(param.product)
			}
			if (param.transitDetails) {
				this.transitDetails = new TransitDetails(param.transitDetails)
			}
		}
	}

	setProduct(product: Product) {
		this.productId = product.id
		this.product = product
	}
}

export class TransitDetails {
	locationDropoff: Address | null = null
	weight: number | null = null
	dimensions: Dimensions | null = null

	constructor(param?: Partial<TransitDetails>) {
		if (param) {
			Object.assign(this, param)
			// Handle deep copying for nested objects
			if (param.locationDropoff) {
				this.locationDropoff = new Address(param.locationDropoff)
			}
			if (param.dimensions) {
				this.dimensions = new Dimensions(param.dimensions)
			}
		}
	}
}

export class Dimensions {
	private width: number | null = null
	private length: number | null = null
	private height: number | null = null

	constructor(param?: Partial<Dimensions>) {
		if (param) {
			Object.assign(this, param)
		}
	}

	toString = () => {
		return `${this.width} x ${this.length} x ${this.height}cm`
	}
}
