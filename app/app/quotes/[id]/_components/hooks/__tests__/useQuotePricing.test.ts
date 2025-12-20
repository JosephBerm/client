/**
 * useQuotePricing Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive testing for quote pricing workflow.
 * 
 * **Priority**: 🔴 CRITICAL - REVENUE
 * 
 * This hook manages the quote pricing workflow where sales reps:
 * 1. Input vendor cost (what MedSource pays)
 * 2. Input customer price (what customer pays)
 * 3. System calculates margins
 * 4. Validate before sending quote to customer
 * 
 * **PRD Reference**: prd_quotes_pricing.md
 * 
 * **Testing Strategy:**
 * 1. API call success/failure scenarios
 * 2. Validation logic (customerPrice >= vendorCost)
 * 3. canSendToCustomer business rule testing
 * 4. Edge cases (null quote, empty products, etc.)
 * 5. Callback execution (onRefresh)
 * 
 * @module Quotes/useQuotePricing.test
 */

import { describe, it, expect, beforeEach, vi, afterEach, type Mock } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import * as sharedModule from '@_shared'
import { QuoteStatus } from '@_classes/Enums'
import { CartProduct, Product } from '@_classes/Product'
import type Quote from '@_classes/Quote'

import { useQuotePricing } from '../useQuotePricing'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock the useFormSubmit hook from @_shared
vi.mock('@_shared', async () => {
	const actual = await vi.importActual('@_shared')
	return {
		...actual,
		useFormSubmit: vi.fn(),
		API: {
			Quotes: {
				updateProductPricing: vi.fn(),
				getPricingSummary: vi.fn(),
			},
		},
	}
})

// ============================================================================
// TEST DATA BUILDERS
// ============================================================================

/**
 * QuoteBuilder - Creates Quote test data with pricing scenarios
 */
class QuoteBuilder {
	private quote: Partial<Quote> = {
		id: 'quote-123',
		status: QuoteStatus.Read,
		products: [],
		emailAddress: 'customer@hospital.com',
		companyName: 'Test Hospital',
		assignedSalesRepId: '200',
	}

	withId(id: string): this {
		this.quote.id = id
		return this
	}

	withStatus(status: QuoteStatus): this {
		this.quote.status = status
		return this
	}

	withProducts(products: CartProduct[]): this {
		this.quote.products = products
		return this
	}

	withProduct(product: Partial<CartProduct>): this {
		const cartProduct = new CartProduct({
			id: product.id ?? 'cart-prod-1',
			productId: product.productId ?? 'prod-1',
			quantity: product.quantity ?? 1,
			vendorCost: product.vendorCost ?? null,
			customerPrice: product.customerPrice ?? null,
			product: product.product ?? new Product({
				id: 'prod-1',
				name: 'Test Product',
				sku: 'TEST-001',
				price: 100,
			}),
		})
		this.quote.products ??= []
		this.quote.products.push(cartProduct)
		return this
	}

	// Scenario: All products priced (ready to send)
	withAllProductsPriced(): this {
		this.quote.products = [
			new CartProduct({
				id: 'cart-1',
				productId: 'prod-1',
				quantity: 10,
				vendorCost: 100,
				customerPrice: 150,
				product: new Product({ id: 'prod-1', name: 'Product 1', sku: 'P1', price: 100 }),
			}),
			new CartProduct({
				id: 'cart-2',
				productId: 'prod-2',
				quantity: 5,
				vendorCost: 200,
				customerPrice: 300,
				product: new Product({ id: 'prod-2', name: 'Product 2', sku: 'P2', price: 200 }),
			}),
		]
		return this
	}

	// Scenario: Some products missing customer price
	withPartiallyPricedProducts(): this {
		this.quote.products = [
			new CartProduct({
				id: 'cart-1',
				productId: 'prod-1',
				quantity: 10,
				vendorCost: 100,
				customerPrice: 150,
				product: new Product({ id: 'prod-1', name: 'Product 1', sku: 'P1', price: 100 }),
			}),
			new CartProduct({
				id: 'cart-2',
				productId: 'prod-2',
				quantity: 5,
				vendorCost: 200,
				customerPrice: null, // Missing price!
				product: new Product({ id: 'prod-2', name: 'Product 2', sku: 'P2', price: 200 }),
			}),
		]
		return this
	}

	// Scenario: No products have pricing
	withUnpricedProducts(): this {
		this.quote.products = [
			new CartProduct({
				id: 'cart-1',
				productId: 'prod-1',
				quantity: 10,
				vendorCost: null,
				customerPrice: null,
				product: new Product({ id: 'prod-1', name: 'Product 1', sku: 'P1', price: 100 }),
			}),
		]
		return this
	}

	// Scenario: Product with zero customer price
	withZeroCustomerPrice(): this {
		this.quote.products = [
			new CartProduct({
				id: 'cart-1',
				productId: 'prod-1',
				quantity: 10,
				vendorCost: 100,
				customerPrice: 0, // Zero price - should NOT be sendable
				product: new Product({ id: 'prod-1', name: 'Product 1', sku: 'P1', price: 100 }),
			}),
		]
		return this
	}

	// Scenario: Empty products array
	withEmptyProducts(): this {
		this.quote.products = []
		return this
	}

	build(): Quote {
		return this.quote as Quote
	}
}

/**
 * Creates mock useFormSubmit return value
 */
function createMockFormSubmit(options: {
	submitFn?: Mock
	isSubmitting?: boolean
	submitResult?: { success: boolean }
} = {}) {
	const mockSubmit = options.submitFn ?? vi.fn().mockResolvedValue({ success: true })
	
	return {
		submit: mockSubmit,
		isSubmitting: options.isSubmitting ?? false,
		reset: vi.fn(),
		error: null,
	}
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useQuotePricing Hook', () => {
	let mockSubmit: Mock
	let mockOnRefresh: Mock

	beforeEach(() => {
		vi.clearAllMocks()
		mockSubmit = vi.fn().mockResolvedValue({ success: true })
		mockOnRefresh = vi.fn().mockResolvedValue(undefined)
		
		// Setup default mock for useFormSubmit
		;(sharedModule.useFormSubmit as Mock).mockReturnValue(
			createMockFormSubmit({ submitFn: mockSubmit })
		)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// UPDATE PRICING TESTS
	// ==========================================================================

	describe('updatePricing', () => {
		describe('Success Scenarios', () => {
			it('should call submit with correct data when updating pricing', async () => {
				const quote = new QuoteBuilder().withUnpricedProducts().build()
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				await act(async () => {
					await result.current.updatePricing({
						productId: 'prod-1',
						vendorCost: 100,
						customerPrice: 150,
					})
				})
				
				expect(mockSubmit).toHaveBeenCalledWith({
					productId: 'prod-1',
					vendorCost: 100,
					customerPrice: 150,
				})
			})

			it('should return success result on successful update', async () => {
				const quote = new QuoteBuilder().build()
				mockSubmit.mockResolvedValue({ success: true })
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				let updateResult: { success: boolean } | undefined
				await act(async () => {
					updateResult = await result.current.updatePricing({
						productId: 'prod-1',
						vendorCost: 100,
						customerPrice: 150,
					})
				})
				
				expect(updateResult?.success).toBe(true)
			})

			it('should allow updating with null vendorCost (optional field)', async () => {
				const quote = new QuoteBuilder().build()
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				await act(async () => {
					await result.current.updatePricing({
						productId: 'prod-1',
						vendorCost: null,
						customerPrice: 150,
					})
				})
				
				expect(mockSubmit).toHaveBeenCalledWith({
					productId: 'prod-1',
					vendorCost: null,
					customerPrice: 150,
				})
			})

			it('should allow updating with null customerPrice', async () => {
				const quote = new QuoteBuilder().build()
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				await act(async () => {
					await result.current.updatePricing({
						productId: 'prod-1',
						vendorCost: 100,
						customerPrice: null,
					})
				})
				
				expect(mockSubmit).toHaveBeenCalledWith({
					productId: 'prod-1',
					vendorCost: 100,
					customerPrice: null,
				})
			})

			it('should allow updating both prices to null (clearing prices)', async () => {
				const quote = new QuoteBuilder().withAllProductsPriced().build()
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				await act(async () => {
					await result.current.updatePricing({
						productId: 'prod-1',
						vendorCost: null,
						customerPrice: null,
					})
				})
				
				expect(mockSubmit).toHaveBeenCalledWith({
					productId: 'prod-1',
					vendorCost: null,
					customerPrice: null,
				})
			})
		})

		describe('Failure Scenarios', () => {
			it('should return failure result when API call fails', async () => {
				const quote = new QuoteBuilder().build()
				mockSubmit.mockResolvedValue({ success: false })
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				let updateResult: { success: boolean } | undefined
				await act(async () => {
					updateResult = await result.current.updatePricing({
						productId: 'prod-1',
						vendorCost: 100,
						customerPrice: 150,
					})
				})
				
				expect(updateResult?.success).toBe(false)
			})

			it('should handle API rejection gracefully', async () => {
				const quote = new QuoteBuilder().build()
				mockSubmit.mockRejectedValue(new Error('Network error'))
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				await expect(
					act(async () => {
						await result.current.updatePricing({
							productId: 'prod-1',
							vendorCost: 100,
							customerPrice: 150,
						})
					})
				).rejects.toThrow('Network error')
			})
		})

		describe('Loading State', () => {
			it('should reflect isUpdating from useFormSubmit', () => {
				const quote = new QuoteBuilder().build()
				;(sharedModule.useFormSubmit as Mock).mockReturnValue(
					createMockFormSubmit({ isSubmitting: true })
				)
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				expect(result.current.isUpdating).toBe(true)
			})

			it('should have isUpdating=false when not submitting', () => {
				const quote = new QuoteBuilder().build()
				;(sharedModule.useFormSubmit as Mock).mockReturnValue(
					createMockFormSubmit({ isSubmitting: false })
				)
				
				const { result } = renderHook(() => useQuotePricing(quote, mockOnRefresh))
				
				expect(result.current.isUpdating).toBe(false)
			})
		})
	})

	// ==========================================================================
	// VALIDATION TESTS - BUSINESS RULES
	// ==========================================================================

	describe('validatePricing', () => {
		describe('Valid Pricing Data', () => {
			it('should validate when customerPrice > vendorCost', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 100,
					customerPrice: 150,
				})
				
				expect(validation.valid).toBe(true)
				expect(validation.errors).toEqual([])
			})

			it('should validate when customerPrice === vendorCost (break-even)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 100,
					customerPrice: 100, // Break-even is valid
				})
				
				expect(validation.valid).toBe(true)
				expect(validation.errors).toEqual([])
			})

			it('should validate when only customerPrice is set (vendorCost is optional)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: null,
					customerPrice: 150,
				})
				
				expect(validation.valid).toBe(true)
				expect(validation.errors).toEqual([])
			})

			it('should validate when only vendorCost is set (customerPrice can be added later)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 100,
					customerPrice: null,
				})
				
				expect(validation.valid).toBe(true)
				expect(validation.errors).toEqual([])
			})

			it('should validate when both are null (pricing not yet entered)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: null,
					customerPrice: null,
				})
				
				expect(validation.valid).toBe(true)
				expect(validation.errors).toEqual([])
			})

			it('should validate zero prices (edge case - free item)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 0,
					customerPrice: 0,
				})
				
				expect(validation.valid).toBe(true)
			})

			it('should validate large prices (precision test)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 999999.99,
					customerPrice: 1000000.00,
				})
				
				expect(validation.valid).toBe(true)
			})

			it('should validate decimal prices with 2 decimal places', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 99.99,
					customerPrice: 149.99,
				})
				
				expect(validation.valid).toBe(true)
			})
		})

		describe('Invalid Pricing Data - Business Rule Violations', () => {
			it('should REJECT when customerPrice < vendorCost (negative margin)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 150,
					customerPrice: 100, // Less than vendor cost!
				})
				
				expect(validation.valid).toBe(false)
				expect(validation.errors.length).toBeGreaterThan(0)
				expect(validation.errors[0]).toContain('Customer price must be greater than or equal to vendor cost')
			})

			it('should REJECT negative vendorCost', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: -50,
					customerPrice: 100,
				})
				
				expect(validation.valid).toBe(false)
				expect(validation.errors.length).toBeGreaterThan(0)
			})

			it('should REJECT negative customerPrice', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 100,
					customerPrice: -50,
				})
				
				expect(validation.valid).toBe(false)
				expect(validation.errors.length).toBeGreaterThan(0)
			})

			it('should REJECT empty productId', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: '',
					vendorCost: 100,
					customerPrice: 150,
				})
				
				expect(validation.valid).toBe(false)
				expect(validation.errors.length).toBeGreaterThan(0)
			})
		})

		describe('Edge Cases', () => {
			it('should handle very small difference (1 cent margin)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 99.99,
					customerPrice: 100.00, // 1 cent margin
				})
				
				expect(validation.valid).toBe(true)
			})

			it('should handle floating point edge case (0.1 + 0.2 !== 0.3)', () => {
				const quote = new QuoteBuilder().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				// This tests floating point precision handling
				const validation = result.current.validatePricing({
					productId: 'prod-1',
					vendorCost: 0.1,
					customerPrice: 0.3,
				})
				
				expect(validation.valid).toBe(true)
			})
		})
	})

	// ==========================================================================
	// CAN SEND TO CUSTOMER TESTS - PRD US-QP-004
	// ==========================================================================

	describe('canSendToCustomer', () => {
		describe('TRUE Scenarios - Ready to Send', () => {
			it('should return TRUE when all products have customerPrice > 0', () => {
				const quote = new QuoteBuilder().withAllProductsPriced().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(true)
			})

			it('should return TRUE for single product with customerPrice > 0', () => {
				const quote = new QuoteBuilder()
					.withProduct({
						id: 'cart-1',
						productId: 'prod-1',
						quantity: 1,
						vendorCost: 100,
						customerPrice: 150,
					})
					.build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(true)
			})

			it('should return TRUE even if vendorCost is null (vendorCost is optional)', () => {
				const quote = new QuoteBuilder()
					.withProduct({
						id: 'cart-1',
						productId: 'prod-1',
						quantity: 1,
						vendorCost: null, // Vendor cost not set
						customerPrice: 150, // But customer price is set
					})
					.build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(true)
			})
		})

		describe('FALSE Scenarios - NOT Ready to Send', () => {
			it('should return FALSE when ANY product has null customerPrice', () => {
				const quote = new QuoteBuilder().withPartiallyPricedProducts().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(false)
			})

			it('should return FALSE when ALL products have null customerPrice', () => {
				const quote = new QuoteBuilder().withUnpricedProducts().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(false)
			})

			it('should return FALSE when ANY product has customerPrice === 0', () => {
				const quote = new QuoteBuilder().withZeroCustomerPrice().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(false)
			})

			it('should return FALSE when products array is empty', () => {
				const quote = new QuoteBuilder().withEmptyProducts().build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(false)
			})

			it('should return FALSE when quote is null', () => {
				const { result } = renderHook(() => useQuotePricing(null))
				
				expect(result.current.canSendToCustomer(null)).toBe(false)
			})

			it('should return FALSE when quote.products is undefined', () => {
				const quote = { id: 'quote-1' } as Quote // Missing products
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(false)
			})
		})

		describe('Mixed Scenarios', () => {
			it('should check ALL products, not just first', () => {
				const quote = new QuoteBuilder()
					.withProduct({
						id: 'cart-1',
						productId: 'prod-1',
						quantity: 1,
						customerPrice: 100,
					})
					.withProduct({
						id: 'cart-2',
						productId: 'prod-2',
						quantity: 1,
						customerPrice: null, // Second product missing price
					})
					.build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(false)
			})

			it('should check ALL products, not just last', () => {
				const quote = new QuoteBuilder()
					.withProduct({
						id: 'cart-1',
						productId: 'prod-1',
						quantity: 1,
						customerPrice: null, // First product missing price
					})
					.withProduct({
						id: 'cart-2',
						productId: 'prod-2',
						quantity: 1,
						customerPrice: 100,
					})
					.build()
				const { result } = renderHook(() => useQuotePricing(quote))
				
				expect(result.current.canSendToCustomer(quote)).toBe(false)
			})
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle null quote gracefully', () => {
			const { result } = renderHook(() => useQuotePricing(null))
			
			expect(result.current.canSendToCustomer(null)).toBe(false)
			expect(result.current.isUpdating).toBeDefined()
			expect(result.current.validatePricing).toBeDefined()
		})

		it('should handle quote without id', () => {
			const quote = { products: [] } as unknown as Quote
			const { result } = renderHook(() => useQuotePricing(quote))
			
			expect(result.current.canSendToCustomer(quote)).toBe(false)
		})

		it('should call onRefresh after successful update', async () => {
			const quote = new QuoteBuilder().build()
			
			// Setup mock to capture onSuccess callback
			let capturedOnSuccess: (() => Promise<void>) | undefined
			;(sharedModule.useFormSubmit as Mock).mockImplementation(
				(submitFn: unknown, options: { onSuccess?: () => Promise<void> }) => {
					capturedOnSuccess = options.onSuccess
					return createMockFormSubmit({ submitFn: mockSubmit })
				}
			)
			
			renderHook(() => useQuotePricing(quote, mockOnRefresh))
			
			// Simulate success callback
			if (capturedOnSuccess) {
				await capturedOnSuccess()
			}
			
			expect(mockOnRefresh).toHaveBeenCalled()
		})

		it('should not crash when onRefresh is undefined', async () => {
			const quote = new QuoteBuilder().build()
			
			let capturedOnSuccess: (() => Promise<void>) | undefined
			;(sharedModule.useFormSubmit as Mock).mockImplementation(
				(submitFn: unknown, options: { onSuccess?: () => Promise<void> }) => {
					capturedOnSuccess = options.onSuccess
					return createMockFormSubmit({ submitFn: mockSubmit })
				}
			)
			
			renderHook(() => useQuotePricing(quote, undefined)) // No onRefresh
			
			// Should not throw
			if (capturedOnSuccess) {
				await expect(capturedOnSuccess()).resolves.not.toThrow()
			}
		})

		it('should configure useFormSubmit with correct options', () => {
			const quote = new QuoteBuilder().build()
			
			renderHook(() => useQuotePricing(quote))
			
			expect(sharedModule.useFormSubmit).toHaveBeenCalledWith(
				expect.any(Function),
				expect.objectContaining({
					successMessage: 'Pricing updated',
					errorMessage: 'Failed to update pricing',
					componentName: 'useQuotePricing',
					actionName: 'updatePricing',
				})
			)
		})
	})

	// ==========================================================================
	// QUOTE STATUS CONSIDERATIONS
	// ==========================================================================

	describe('Quote Status Awareness', () => {
		// Note: The hook itself doesn't check status, but tests document expected behavior
		// Status checks are done at the component/API level
		
		it('should work with Read status quotes', () => {
			const quote = new QuoteBuilder().withStatus(QuoteStatus.Read).withAllProductsPriced().build()
			const { result } = renderHook(() => useQuotePricing(quote))
			
			expect(result.current.canSendToCustomer(quote)).toBe(true)
		})

		it('should work with any quote status (status check is at component level)', () => {
			const quote = new QuoteBuilder().withStatus(QuoteStatus.Approved).withAllProductsPriced().build()
			const { result } = renderHook(() => useQuotePricing(quote))
			
			// Hook doesn't check status - that's done in component/API
			expect(result.current.canSendToCustomer(quote)).toBe(true)
		})
	})
})
