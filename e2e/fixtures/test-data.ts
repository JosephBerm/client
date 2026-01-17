/**
 * Test Data Fixtures
 *
 * ARCHITECTURE: Provides consistent test data across all tests
 * - Product data
 * - Address data
 * - Customer data
 * - Order data
 *
 * @see https://playwright.dev/docs/test-fixtures#creating-a-fixture
 */

// =============================================
// PRODUCT TEST DATA
// =============================================

export const TEST_PRODUCTS = {
	surgicalGloves: {
		name: 'Surgical Gloves',
		sku: 'SG-001',
		price: 29.99,
		category: 'PPE',
	},
	faceMasks: {
		name: 'N95 Face Masks',
		sku: 'FM-001',
		price: 49.99,
		category: 'PPE',
	},
	handSanitizer: {
		name: 'Hand Sanitizer 500ml',
		sku: 'HS-001',
		price: 9.99,
		category: 'Sanitation',
	},
	syringes: {
		name: 'Disposable Syringes 10ml',
		sku: 'DS-001',
		price: 15.99,
		category: 'Medical Supplies',
	},
	bandages: {
		name: 'Sterile Bandages Pack',
		sku: 'SB-001',
		price: 12.99,
		category: 'First Aid',
	},
} as const

// =============================================
// ADDRESS TEST DATA
// =============================================

export const TEST_ADDRESSES = {
	shipping: {
		street: '123 Medical Center Drive',
		street2: 'Suite 100',
		city: 'Healthcare City',
		state: 'CA',
		zip: '90210',
		country: 'USA',
	},
	billing: {
		street: '456 Business Park Ave',
		street2: '',
		city: 'Commerce Town',
		state: 'CA',
		zip: '90211',
		country: 'USA',
	},
	alternative: {
		street: '789 Hospital Road',
		street2: 'Building B',
		city: 'Medical District',
		state: 'NY',
		zip: '10001',
		country: 'USA',
	},
} as const

// =============================================
// CUSTOMER TEST DATA
// =============================================

export const TEST_CUSTOMERS = {
	newCustomer: {
		companyName: 'Test Healthcare Inc.',
		contactName: 'John Tester',
		email: 'john@testhealthcare.com',
		phone: '555-123-4567',
		businessType: 'Hospital',
	},
	existingCustomer: {
		companyName: 'Existing Medical Supply Co.',
		contactName: 'Jane Smith',
		email: 'jane@existingmedical.com',
		phone: '555-987-6543',
		businessType: 'Clinic',
	},
} as const

// =============================================
// ORDER TEST DATA
// =============================================

export const TEST_ORDERS = {
	smallOrder: {
		items: [{ product: TEST_PRODUCTS.surgicalGloves, quantity: 2 }],
		expectedTotal: 59.98,
	},
	mediumOrder: {
		items: [
			{ product: TEST_PRODUCTS.surgicalGloves, quantity: 5 },
			{ product: TEST_PRODUCTS.faceMasks, quantity: 3 },
		],
		expectedTotal: 299.92,
	},
	largeOrder: {
		items: [
			{ product: TEST_PRODUCTS.surgicalGloves, quantity: 10 },
			{ product: TEST_PRODUCTS.faceMasks, quantity: 10 },
			{ product: TEST_PRODUCTS.handSanitizer, quantity: 20 },
			{ product: TEST_PRODUCTS.syringes, quantity: 50 },
		],
		expectedTotal: 1799.1,
	},
} as const

// =============================================
// PAYMENT TEST DATA
// =============================================

export const TEST_PAYMENT_METHODS = {
	invoice: {
		type: 'invoice',
		terms: 'Net 30',
	},
	purchaseOrder: {
		type: 'purchase-order',
		poNumber: 'PO-2026-001',
	},
	creditCard: {
		type: 'credit-card',
		// Use Stripe test card numbers
		cardNumber: '4242424242424242',
		expiry: '12/28',
		cvc: '123',
	},
} as const

// =============================================
// QUOTE TEST DATA
// =============================================

export const TEST_QUOTES = {
	standardQuote: {
		items: [
			{ product: TEST_PRODUCTS.surgicalGloves, quantity: 100 },
			{ product: TEST_PRODUCTS.faceMasks, quantity: 50 },
		],
		validDays: 30,
		notes: 'Standard bulk order quote for testing',
	},
	rushQuote: {
		items: [{ product: TEST_PRODUCTS.syringes, quantity: 500 }],
		validDays: 7,
		notes: 'Rush order - expedited shipping required',
	},
} as const

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(prefix: string = 'test'): string {
	const timestamp = Date.now()
	return `${prefix}-${timestamp}@medsource-test.com`
}

/**
 * Generate a unique PO number for testing
 */
export function generateTestPONumber(): string {
	const timestamp = Date.now()
	return `PO-TEST-${timestamp}`
}

/**
 * Generate a unique company name for testing
 */
export function generateTestCompanyName(): string {
	const timestamp = Date.now()
	return `Test Company ${timestamp}`
}

/**
 * Calculate expected order total
 */
export function calculateOrderTotal(
	items: Array<{ product: { price: number }; quantity: number }>
): number {
	return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
}
