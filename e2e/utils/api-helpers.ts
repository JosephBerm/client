/**
 * API Helpers for E2E Test Data Management
 *
 * MAANG Best Practice: Use API setup over UI setup for speed and reliability.
 * These helpers provide deterministic data creation and cleanup.
 *
 * @see https://playwright.dev/docs/api-testing
 */

import { APIRequestContext, request } from '@playwright/test'

// =============================================
// CONFIGURATION
// =============================================

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5254/api/v1'

// =============================================
// TYPES
// =============================================

export interface TestQuote {
	id: string
	quoteNumber: string
	customerId: string
	status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Converted'
	totalAmount: number
	items: TestQuoteItem[]
}

export interface TestQuoteItem {
	productId: string
	productName: string
	quantity: number
	unitPrice: number
	vendorCost: number
}

export interface TestOrder {
	id: string
	orderNumber: string
	quoteId?: string
	customerId: string
	status: 'Placed' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
	paymentStatus: 'Pending' | 'Paid' | 'Refunded' | 'PartialRefund'
	totalAmount: number
	trackingNumber?: string
	carrier?: string
}

export interface TestCustomer {
	id: string
	companyName: string
	contactEmail: string
	contactName: string
}

export interface TestProduct {
	id: string
	name: string
	sku: string
	basePrice: number
	vendorCost: number
	stockOnHand: number
	stockReserved: number
}

export interface TestUser {
	id: string
	email: string
	role: string
	firstName: string
	lastName: string
}

// =============================================
// API CLIENT
// =============================================

export class ApiTestHelper {
	private context: APIRequestContext | null = null
	private authToken: string | null = null
	private createdEntities: { type: string; id: string }[] = []

	/**
	 * Initialize the API helper with authentication
	 */
	async init(storageStatePath?: string): Promise<void> {
		// Create API context
		this.context = await request.newContext({
			baseURL: API_BASE_URL,
			extraHTTPHeaders: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		})

		// If storage state provided, extract auth token
		if (storageStatePath) {
			try {
				const fs = await import('fs')
				const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'))
				// Extract token from cookies or localStorage
				const authCookie = state.cookies?.find((c: { name: string }) => c.name.includes('auth') || c.name.includes('token'))
				if (authCookie) {
					this.authToken = authCookie.value
				}
			} catch {
				// No auth token available
			}
		}
	}

	/**
	 * Clean up all created entities (call in afterEach/afterAll)
	 */
	async cleanup(): Promise<void> {
		// Delete in reverse order (dependencies first)
		for (const entity of [...this.createdEntities].reverse()) {
			try {
				await this.deleteEntity(entity.type, entity.id)
			} catch {
				// Best effort cleanup
			}
		}
		this.createdEntities = []

		if (this.context) {
			await this.context.dispose()
			this.context = null
		}
	}

	/**
	 * Track entity for cleanup
	 */
	private trackEntity(type: string, id: string): void {
		this.createdEntities.push({ type, id })
	}

	/**
	 * Delete an entity by type and ID
	 */
	private async deleteEntity(type: string, id: string): Promise<void> {
		if (!this.context) return

		const endpoints: Record<string, string> = {
			quote: `/quotes/${id}`,
			order: `/orders/${id}`,
			customer: `/customers/${id}`,
			product: `/products/${id}`,
			user: `/users/${id}`,
		}

		const endpoint = endpoints[type]
		if (endpoint) {
			await this.context.delete(endpoint, {
				headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
			})
		}
	}

	// =============================================
	// QUOTE OPERATIONS
	// =============================================

	/**
	 * Create a test quote with items
	 */
	async createQuote(data: {
		customerId: string
		items: { productId: string; quantity: number; unitPrice: number; vendorCost: number }[]
		status?: TestQuote['status']
	}): Promise<TestQuote> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.post('/quotes', {
			data: {
				customerId: data.customerId,
				items: data.items,
				status: data.status || 'Draft',
			},
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to create quote: ${response.status()} ${await response.text()}`)
		}

		const quote = (await response.json()) as TestQuote
		this.trackEntity('quote', quote.id)
		return quote
	}

	/**
	 * Update quote status
	 */
	async updateQuoteStatus(quoteId: string, status: TestQuote['status']): Promise<TestQuote> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.patch(`/quotes/${quoteId}/status`, {
			data: { status },
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to update quote status: ${response.status()}`)
		}

		return (await response.json()) as TestQuote
	}

	/**
	 * Get quote by ID
	 */
	async getQuote(quoteId: string): Promise<TestQuote | null> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.get(`/quotes/${quoteId}`, {
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) return null
		return (await response.json()) as TestQuote
	}

	// =============================================
	// ORDER OPERATIONS
	// =============================================

	/**
	 * Create a test order (typically from approved quote)
	 */
	async createOrder(data: {
		customerId: string
		quoteId?: string
		items: { productId: string; quantity: number; unitPrice: number }[]
		status?: TestOrder['status']
		paymentStatus?: TestOrder['paymentStatus']
	}): Promise<TestOrder> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.post('/orders', {
			data: {
				customerId: data.customerId,
				quoteId: data.quoteId,
				items: data.items,
				status: data.status || 'Placed',
				paymentStatus: data.paymentStatus || 'Pending',
			},
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to create order: ${response.status()} ${await response.text()}`)
		}

		const order = (await response.json()) as TestOrder
		this.trackEntity('order', order.id)
		return order
	}

	/**
	 * Update order status
	 */
	async updateOrderStatus(orderId: string, status: TestOrder['status']): Promise<TestOrder> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.patch(`/orders/${orderId}/status`, {
			data: { status },
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to update order status: ${response.status()}`)
		}

		return (await response.json()) as TestOrder
	}

	/**
	 * Update order payment status
	 */
	async updateOrderPaymentStatus(orderId: string, paymentStatus: TestOrder['paymentStatus']): Promise<TestOrder> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.patch(`/orders/${orderId}/payment`, {
			data: { paymentStatus },
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to update payment status: ${response.status()}`)
		}

		return (await response.json()) as TestOrder
	}

	/**
	 * Add tracking to order
	 */
	async addOrderTracking(orderId: string, trackingNumber: string, carrier: string): Promise<TestOrder> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.patch(`/orders/${orderId}/tracking`, {
			data: { trackingNumber, carrier },
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to add tracking: ${response.status()}`)
		}

		return (await response.json()) as TestOrder
	}

	/**
	 * Get order by ID
	 */
	async getOrder(orderId: string): Promise<TestOrder | null> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.get(`/orders/${orderId}`, {
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) return null
		return (await response.json()) as TestOrder
	}

	// =============================================
	// CUSTOMER OPERATIONS
	// =============================================

	/**
	 * Create a test customer
	 */
	async createCustomer(data: {
		companyName: string
		contactEmail: string
		contactName: string
	}): Promise<TestCustomer> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.post('/customers', {
			data,
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to create customer: ${response.status()}`)
		}

		const customer = (await response.json()) as TestCustomer
		this.trackEntity('customer', customer.id)
		return customer
	}

	/**
	 * Get customer by ID
	 */
	async getCustomer(customerId: string): Promise<TestCustomer | null> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.get(`/customers/${customerId}`, {
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) return null
		return (await response.json()) as TestCustomer
	}

	// =============================================
	// PRODUCT/INVENTORY OPERATIONS
	// =============================================

	/**
	 * Get product with inventory
	 */
	async getProduct(productId: string): Promise<TestProduct | null> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.get(`/products/${productId}`, {
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) return null
		return (await response.json()) as TestProduct
	}

	/**
	 * Update product inventory
	 */
	async updateProductInventory(
		productId: string,
		data: { stockOnHand?: number; stockReserved?: number }
	): Promise<TestProduct> {
		if (!this.context) throw new Error('API helper not initialized')

		const response = await this.context.patch(`/products/${productId}/inventory`, {
			data,
			headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
		})

		if (!response.ok()) {
			throw new Error(`Failed to update inventory: ${response.status()}`)
		}

		return (await response.json()) as TestProduct
	}

	// =============================================
	// UTILITY METHODS
	// =============================================

	/**
	 * Generate unique test identifier
	 */
	static generateTestId(prefix: string = 'test'): string {
		const timestamp = Date.now()
		const random = Math.random().toString(36).substring(2, 8)
		return `${prefix}-${timestamp}-${random}`
	}

	/**
	 * Generate unique email for testing
	 */
	static generateTestEmail(prefix: string = 'test'): string {
		return `${prefix}-${Date.now()}@test.medsource.local`
	}

	/**
	 * Generate unique company name for testing
	 */
	static generateTestCompanyName(): string {
		return `Test Company ${Date.now().toString().slice(-6)}`
	}
}

// =============================================
// FACTORY FUNCTIONS FOR COMMON SCENARIOS
// =============================================

/**
 * Create a complete quote→order flow for testing
 */
export async function createTestOrderFlow(
	api: ApiTestHelper,
	options: {
		customerId: string
		productId: string
		quantity?: number
		approveQuote?: boolean
		payOrder?: boolean
	}
): Promise<{ quote: TestQuote; order?: TestOrder }> {
	const { customerId, productId, quantity = 1, approveQuote = true, payOrder = false } = options

	// Create quote
	const quote = await api.createQuote({
		customerId,
		items: [{ productId, quantity, unitPrice: 100, vendorCost: 60 }],
		status: 'Draft',
	})

	// Approve if requested
	if (approveQuote) {
		await api.updateQuoteStatus(quote.id, 'Approved')
	}

	// Convert to order if approved
	if (approveQuote) {
		const order = await api.createOrder({
			customerId,
			quoteId: quote.id,
			items: [{ productId, quantity, unitPrice: 100 }],
			status: 'Placed',
			paymentStatus: payOrder ? 'Paid' : 'Pending',
		})

		return { quote, order }
	}

	return { quote }
}

/**
 * Create a paid order ready for fulfillment
 */
export async function createPaidOrderForFulfillment(
	api: ApiTestHelper,
	options: {
		customerId: string
		productId: string
		quantity?: number
	}
): Promise<TestOrder> {
	const { customerId, productId, quantity = 1 } = options

	const order = await api.createOrder({
		customerId,
		items: [{ productId, quantity, unitPrice: 100 }],
		status: 'Paid',
		paymentStatus: 'Paid',
	})

	return order
}

export default ApiTestHelper
