import Company from './Company'
import { OrderStatus } from '@/classes/Enums'
import { Product } from './Product'
import Quote from './Quote'

export default class Order {
	id: number | null = null
	products: OrderItem[] = []
	total: number = 0
	createdAt: Date = new Date()
	customer: Company | null = null
	customerId: number | null = null
	status: OrderStatus = OrderStatus.Pending

	CreateFromQuote(quote: Quote) {
		this.products = quote.products.map((cartProduct) => {
			const orderItem = new OrderItem()
			orderItem.setProduct(new Product(cartProduct.product ?? {}))
			orderItem.quantity = cartProduct.quantity
			orderItem.total = cartProduct.product?.price ?? 0 * cartProduct.quantity ?? 0
			return orderItem
		})
		this.total = this.products.reduce((acc, item) => acc + item.total, 0)
	}

	constructor(init?: Partial<Order>) {
		Object.assign(this, init)
	}
}

export class OrderItem {
	id: number | null = null
	private productId: string | null = null
	product: Product | null = null
	quantity: number = 0
	sellPrice: number = 0
	buyPrice: number = 0
	isSold: boolean = false
	total: number = 0
	order: Order | null = null
	orderId = 0
	transitDetails: TransitDetails = new TransitDetails()

	constructor(init?: Partial<OrderItem>) {
		Object.assign(this, init)
	}

	setProduct(product: Product) {
		this.productId = product.id
		this.product = product
	}
}

export class TransitDetails {
	locationDropoff: string | null = null
	weight: number | null = null
	dimensions: Dimensions | null = null
}

export class Dimensions {
	private width: number | null = null
	private length: number | null = null
	private height: number | null = null

	toString = () => {
		return `${this.width} x ${this.length} x ${this.height}cm`
	}
}
