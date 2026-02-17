/**
 * Order Entity Classes
 * 
 * Represents orders in the MedSource Pro system with full order lifecycle management.
 * Orders are created from quotes or directly, and track products, pricing, shipping,
 * and order status through various stages.
 * 
 * **Features:**
 * - Order header with customer and status
 * - Line items (OrderItem) with product details
 * - Financial calculations (subtotal, tax, shipping, discount)
 * - Order status tracking (Pending, Approved, Shipped, Delivered, etc.)
 * - Create order from quote functionality
 * - Transit/shipping details per item
 * - Package dimensions tracking
 * - Timestamp tracking
 * 
 * **Order Status Flow:**
 * 1. Pending - Initial state, awaiting review
 * 2. Approved - Approved for processing
 * 3. Processing - Being prepared for shipment
 * 4. Shipped - In transit to customer
 * 5. Delivered - Received by customer
 * 6. Cancelled - Order cancelled
 * 
 * **Related Entities:**
 * - Company: Customer placing the order
 * - Product: Products being ordered
 * - Quote: Source quote (if order created from quote)
 * - Address: Delivery/dropoff addresses
 * 
 * **Classes:**
 * - Order: Main order entity
 * - OrderItem: Individual line items in an order
 * - TransitDetails: Shipping/transit information per item
 * - Dimensions: Package dimensions (width × length × height)
 * 
 * @example
 * ```typescript
 * // Create an order
 * const order = new Order({
 *   customerId: 123,
 *   customer: company,
 *   status: OrderStatus.Pending,
 *   products: [
 *     new OrderItem({
 *       product: product1,
 *       quantity: 10,
 *       sellPrice: 99.99,
 *       total: 999.90
 *     }),
 *     new OrderItem({
 *       product: product2,
 *       quantity: 5,
 *       sellPrice: 49.99,
 *       total: 249.95
 *     })
 *   ],
 *   salesTax: 124.99,
 *   shipping: 25.00,
 *   discount: 50.00,
 *   notes: 'Rush delivery requested'
 * });
 * 
 * // Create order from quote
 * import { logger } from '@_core';
 * 
 * const order2 = new Order();
 * order2.CreateFromQuote(quote);
 * logger.info('Order created from quote', { orderTotal: order2.total, quoteId: quote.id });
 * 
 * // Add transit details to item
 * const orderItem = new OrderItem({
 *   product: product,
 *   quantity: 100,
 *   transitDetails: new TransitDetails({
 *     locationDropoff: shippingAddress,
 *     weight: 25.5,
 *     dimensions: new Dimensions({
 *       width: 12,
 *       length: 18,
 *       height: 6
 *     })
 *   }),
 *   trackingNumber: 'TRK123456789'
 * });
 * ```
 * 
 * @module Order
 */

import { parseDateSafe, parseRequiredTimestamp } from '@_lib/dates'

import { OrderStatus } from '@_classes/Enums'

import Address from './common/Address'
import Company from './Company'
import { Product } from './Product'

import type Quote from './Quote'


/**
 * Order Entity Class
 *
 * Main order entity representing a purchase order from a customer.
 * Tracks order details, line items, financial calculations, and order status.
 */
export default class Order {
	/** Unique identifier (UUID/GUID from backend) */
	id: string | null = null
	
	/** Array of order line items (products with quantities and pricing) */
	products: OrderItem[] = []
	
	/** Grand total (subtotal + tax + shipping - discount) */
	total: number = 0
	
	/** Order creation timestamp */
	createdAt: Date = new Date()
	
	/** Customer company object */
	customer: Company | null = null
	
	/** Customer company ID (GUID foreign key) */
	customerId: string | null = null
	
	/** Current order status */
	status: OrderStatus = OrderStatus.Pending
	
	/** Sales tax amount */
	salesTax = 0
	
	/** Shipping cost */
	shipping = 0
	
	/** Discount amount */
	discount = 0
	
	/** Optional order notes/instructions */
	notes: string = ""

	/** Internal notes for staff (not visible to customers) */
	internalNotes?: string | null = null

	/** Assigned sales rep ID (for RBAC) */
	assignedSalesRepId?: string | null = null

	/** Payment confirmation timestamp */
	paymentConfirmedAt?: Date | null = null

	/** Payment confirmer user ID */
	paymentConfirmedBy?: string | null = null

	/** Payment reference (check #, transaction ID, etc.) */
	paymentReference?: string | null = null

	/** Order processing timestamp */
	processingAt?: Date | null = null

	/** Shipment tracking number (order-level) */
	trackingNumber?: string | null = null

	/** Order shipped timestamp */
	shippedAt?: Date | null = null

	/** Order delivered timestamp */
	deliveredAt?: Date | null = null

	/** Order cancelled timestamp */
	cancelledAt?: Date | null = null

	/**
	 * Creates an order from an existing quote.
	 * Converts quote cart products to order items and calculates total.
	 * 
	 * @param {Quote} quote - Source quote to create order from
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core';
	 * 
	 * const order = new Order();
	 * order.CreateFromQuote(quote);
	 * order.customerId = quote.customer.id;
	 * order.status = OrderStatus.Pending;
	 * logger.info('Order created from quote', { orderTotal: order.total, quoteId: quote.id });
	 * ```
	 */
	CreateFromQuote(quote: Quote) {
		// Convert quote cart products to order items
		this.products = quote.products.map((cartProduct) => {
			const orderItem = new OrderItem({
				product: new Product(cartProduct.product ?? {}),
				quantity: cartProduct.quantity,
				total: (cartProduct.product?.price ?? 0) * (cartProduct.quantity ?? 0),
			})
			return orderItem
		})

		// Calculate order total from line items
		this.total = this.products.reduce((acc, item) => acc + item.total, 0)
	}

	/**
	 * Creates a new Order instance.
	 * Deeply copies nested objects (products, customer).
	 * Parses date strings to Date objects.
	 * 
	 * @param {Partial<Order>} param - Partial order data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic order
	 * const order = new Order({
	 *   customerId: 123,
	 *   status: OrderStatus.Pending,
	 *   notes: 'Urgent delivery'
	 * });
	 * 
	 * // Order with line items
	 * const order2 = new Order({
	 *   customerId: 456,
	 *   products: [
	 *     new OrderItem({
	 *       product: product1,
	 *       quantity: 10,
	 *       sellPrice: 99.99,
	 *       total: 999.90
	 *     })
	 *   ],
	 *   salesTax: 99.99,
	 *   shipping: 25.00,
	 *   total: 1124.89
	 * });
	 * ```
	 */
	constructor(param?: Partial<Order>) {
		if (param) {
			Object.assign(this, param)
			
			// Deep copy products (order items) array
			if (param.products) {
				this.products = param.products.map((p) => new OrderItem(p))
			}
			
			// Parse creation date from string if needed (required timestamp - always validate)
			this.createdAt = parseRequiredTimestamp(param.createdAt, 'Order', 'createdAt')

			// Optional timestamps (defensive parsing)
			this.paymentConfirmedAt = parseDateSafe(param.paymentConfirmedAt) ?? null
			this.processingAt = parseDateSafe(param.processingAt) ?? null
			this.shippedAt = parseDateSafe(param.shippedAt) ?? null
			this.deliveredAt = parseDateSafe(param.deliveredAt) ?? null
			this.cancelledAt = parseDateSafe(param.cancelledAt) ?? null
			
			// Deep copy customer object
			if (param.customer) {
				this.customer = new Company(param.customer)
			}
		}
	}
}

/**
 * Order Line Item Entity Class
 * 
 * Represents a single line item in an order.
 * Contains product reference, quantity, pricing, and shipping details.
 * 
 * **Pricing:**
 * - sellPrice: Price charged to customer
 * - buyPrice: Cost from supplier (for margin calculation)
 * - total: Line total (sellPrice × quantity)
 * - tax: Tax amount for this line item
 */
export class OrderItem {
	/** Unique identifier for order item (GUID) */
	id: string | null = null
	
	/** Product ID (foreign key) */
	productId: string | null = null
	
	/** Product object */
	product: Product | null = null
	
	/** Quantity ordered */
	quantity: number = 0
	
	/** Selling price (charged to customer) */
	sellPrice: number = 0
	
	/** Buying price (cost from supplier) */
	buyPrice: number = 0
	
	/** Whether item has been sold/fulfilled */
	isSold: boolean = false
	
	/** Line item total (sellPrice × quantity) */
	total: number = 0
	
	/** Parent order object */
	order: Order | null = null

	/** Parent order ID (UUID/GUID foreign key) */
	orderId: string | null = null
	
	/** Shipping/transit details for this item */
	transitDetails: TransitDetails = new TransitDetails()
	
	/** Shipment tracking number */
	trackingNumber: string | null = null
	
	/** Tax amount for this line item */
	tax: number = 0

	/**
	 * Creates a new OrderItem instance.
	 * Deeply copies nested objects (product, transit details).
	 * 
	 * @param {Partial<OrderItem>} param - Partial order item data
	 * 
	 * @example
	 * ```typescript
	 * const orderItem = new OrderItem({
	 *   product: product,
	 *   quantity: 50,
	 *   sellPrice: 12.99,
	 *   buyPrice: 8.50,
	 *   total: 649.50,
	 *   tax: 64.95
	 * });
	 * ```
	 */
	constructor(param?: Partial<OrderItem>) {
		if (param) {
			Object.assign(this, param)
			
			// Deep copy product object
			if (param.product) {
				this.product = new Product(param.product)
			}
			
			// Deep copy transit details
			if (param.transitDetails) {
				this.transitDetails = new TransitDetails(param.transitDetails)
			}
		}
	}

	/**
	 * Sets the product for this order item.
	 * Updates both product object and product ID.
	 * 
	 * @param {Product} product - Product to assign to this order item
	 * 
	 * @example
	 * ```typescript
	 * const orderItem = new OrderItem();
	 * orderItem.setProduct(product);
	 * orderItem.quantity = 10;
	 * orderItem.sellPrice = product.price;
	 * orderItem.total = orderItem.sellPrice * orderItem.quantity;
	 * ```
	 */
	setProduct(product: Product) {
		this.productId = product.id
		this.product = product
	}
}

/**
 * Transit Details Entity Class
 * 
 * Shipping and transit information for an order item.
 * Tracks delivery location, package weight, and dimensions.
 * 
 * **Use Cases:**
 * - Shipping cost calculation
 * - Carrier selection
 * - Delivery tracking
 * - Warehouse logistics
 */
export class TransitDetails {
	/** Delivery/dropoff address */
	locationDropoff: Address | null = null
	
	/** Package weight in pounds or kilograms */
	weight: number | null = null
	
	/** Package dimensions (width × length × height) */
	dimensions: Dimensions | null = null

	/**
	 * Creates a new TransitDetails instance.
	 * Deeply copies nested objects (address, dimensions).
	 * 
	 * @param {Partial<TransitDetails>} param - Partial transit details data
	 * 
	 * @example
	 * ```typescript
	 * const transit = new TransitDetails({
	 *   locationDropoff: new Address({
	 *     addressOne: '123 Medical Center Dr',
	 *     city: 'Boston',
	 *     state: 'MA',
	 *     zipCode: '02101',
	 *     country: 'USA'
	 *   }),
	 *   weight: 15.5,
	 *   dimensions: new Dimensions({
	 *     width: 10,
	 *     length: 14,
	 *     height: 8
	 *   })
	 * });
	 * ```
	 */
	constructor(param?: Partial<TransitDetails>) {
		if (param) {
			Object.assign(this, param)
			
			// Deep copy dropoff address
			if (param.locationDropoff) {
				this.locationDropoff = new Address(param.locationDropoff)
			}
			
			// Deep copy dimensions
			if (param.dimensions) {
				this.dimensions = new Dimensions(param.dimensions)
			}
		}
	}
}

/**
 * Package Dimensions Entity Class
 * 
 * Represents package dimensions (width × length × height).
 * Used for shipping cost calculation and logistics planning.
 * 
 * **Format:** All measurements in centimeters (cm)
 */
export class Dimensions {
	/** Package width in centimeters */
	private width: number | null = null
	
	/** Package length in centimeters */
	private length: number | null = null
	
	/** Package height in centimeters */
	private height: number | null = null

	/**
	 * Creates a new Dimensions instance.
	 * 
	 * @param {Partial<Dimensions>} param - Partial dimensions data
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core';
	 * 
	 * const dimensions = new Dimensions({
	 *   width: 30,
	 *   length: 45,
	 *   height: 20
	 * });
	 * logger.debug('Dimensions formatted', { formatted: dimensions.toString() }); // "30 x 45 x 20cm"
	 * ```
	 */
	constructor(param?: Partial<Dimensions>) {
		if (param) {
			Object.assign(this, param)
		}
	}

	/**
	 * Converts dimensions to formatted string.
	 * Format: "width x length x heightcm"
	 * 
	 * @returns {string} Formatted dimensions string
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core';
	 * 
	 * const dimensions = new Dimensions({ width: 12, length: 18, height: 6 });
	 * logger.debug('Dimensions formatted', { formatted: dimensions.toString() }); // "12 x 18 x 6cm"
	 * ```
	 */
	toString = () => {
		return `${this.width} x ${this.length} x ${this.height}cm`
	}
}
