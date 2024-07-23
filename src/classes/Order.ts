import Company from './Company'
import { OrderStatus } from '@/classes/Enums'
import { Product } from './Product'
import Quote from './Quote'
import Address from './Address'

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

	constructor(init?: Partial<Order>) {
		this.id = init?.id ?? null
		this.products = init?.products?.map((p) => new OrderItem(p)) ?? []
		this.total = init?.total ?? 0

		this.createdAt =  new Date(init?.createdAt as Date);
		this.customer = init?.customer ?? null
		this.customerId = init?.customerId ?? null
		this.status = init?.status ?? OrderStatus.Pending
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
	orderId = 0
	transitDetails: TransitDetails = new TransitDetails()

	constructor(init?: Partial<OrderItem>) {
		this.id = null
		this.productId = null
		this.product = null
		this.quantity = 0
		this.sellPrice = 0
		this.buyPrice = 0
		this.isSold = false
		this.total = 0
		this.order = null
		this.orderId = 0
		this.transitDetails = new TransitDetails()

		this.id = init?.id ?? null
		this.productId = init?.productId ?? null
		this.product = init?.product ? new Product(init.product) : null
		this.quantity = init?.quantity ?? 0
		this.sellPrice = init?.sellPrice ?? 0
		this.buyPrice = init?.buyPrice ?? 0
		this.isSold = init?.isSold ?? false
		this.total = init?.total ?? 0
		this.order = init?.order ?? null
		this.orderId = init?.orderId ?? 0
		this.transitDetails = init?.transitDetails ? new TransitDetails(init.transitDetails) : new TransitDetails()
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

	constructor(init?: Partial<TransitDetails>) {
		Object.assign(this, init)
		if (init?.locationDropoff) {
			this.locationDropoff = new Address(init.locationDropoff)
		}
		if (init?.dimensions) {
			this.dimensions = new Dimensions(init.dimensions)
		}
	}
}

export class Dimensions {
	private width: number | null = null
	private length: number | null = null
	private height: number | null = null

	constructor(init?: Partial<Dimensions>) {
		Object.assign(this, init)
	}

	toString = () => {
		return `${this.width} x ${this.length} x ${this.height}cm`
	}
}

