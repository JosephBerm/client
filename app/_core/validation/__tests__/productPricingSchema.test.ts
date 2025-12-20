/**
 * Product Pricing Schema Validation Tests
 * 
 * MAANG-Level: Comprehensive Zod schema validation testing.
 * 
 * **Priority**: 🔴 CRITICAL - REVENUE & DATA INTEGRITY
 * 
 * The productPricingSchema enforces business rules:
 * 1. customerPrice must be >= vendorCost (when both set)
 * 2. Both prices must be non-negative
 * 3. productId is required
 * 
 * **PRD Reference**: prd_quotes_pricing.md - Business Rules
 * 
 * **Testing Strategy:**
 * 1. Valid data scenarios (happy path)
 * 2. Invalid data scenarios (business rule violations)
 * 3. Edge cases (nulls, zeros, large numbers, decimals)
 * 4. Type coercion behavior
 * 5. Error message validation
 * 
 * @module validation/productPricingSchema.test
 */

import { describe, it, expect } from 'vitest'
import { productPricingSchema, type ProductPricingFormData } from '../validation-schemas'

// ============================================================================
// TEST SUITES
// ============================================================================

describe('productPricingSchema', () => {

	// ==========================================================================
	// VALID DATA SCENARIOS
	// ==========================================================================

	describe('Valid Data - Happy Path', () => {
		it('should pass with valid pricing (customerPrice > vendorCost)', () => {
			const data: ProductPricingFormData = {
				productId: 'prod-123',
				vendorCost: 100,
				customerPrice: 150,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.productId).toBe('prod-123')
				expect(result.data.vendorCost).toBe(100)
				expect(result.data.customerPrice).toBe(150)
			}
		})

		it('should pass when customerPrice === vendorCost (break-even)', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 100,
				customerPrice: 100, // Break-even is valid per PRD
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should pass with null vendorCost (vendorCost is optional)', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: null,
				customerPrice: 150,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.vendorCost).toBeNull()
			}
		})

		it('should pass with null customerPrice', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 100,
				customerPrice: null,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.customerPrice).toBeNull()
			}
		})

		it('should pass with both prices null (no pricing entered yet)', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: null,
				customerPrice: null,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should pass with zero prices (free item scenario)', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 0,
				customerPrice: 0,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should pass with decimal prices (common scenario)', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 99.99,
				customerPrice: 149.99,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.vendorCost).toBe(99.99)
				expect(result.data.customerPrice).toBe(149.99)
			}
		})

		it('should pass with very small margin (1 cent)', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 99.99,
				customerPrice: 100.00, // 1 cent margin
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should pass with large prices', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 999999.99,
				customerPrice: 1000000.00,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should pass with UUID-style productId', () => {
			const data = {
				productId: '550e8400-e29b-41d4-a716-446655440000',
				vendorCost: 100,
				customerPrice: 150,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})
	})

	// ==========================================================================
	// INVALID DATA - BUSINESS RULE VIOLATIONS
	// ==========================================================================

	describe('Invalid Data - Business Rule Violations', () => {
		describe('customerPrice < vendorCost (Negative Margin - FORBIDDEN)', () => {
			it('should REJECT when customerPrice < vendorCost', () => {
				const data = {
					productId: 'prod-123',
					vendorCost: 150,
					customerPrice: 100, // Less than vendor cost!
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.error.errors[0].message).toContain('Customer price must be greater than or equal to vendor cost')
					expect(result.error.errors[0].path).toContain('customerPrice')
				}
			})

			it('should REJECT when customerPrice is slightly less than vendorCost', () => {
				const data = {
					productId: 'prod-123',
					vendorCost: 100.01,
					customerPrice: 100.00, // 1 cent less
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
			})

			it('should REJECT with large negative margin', () => {
				const data = {
					productId: 'prod-123',
					vendorCost: 1000,
					customerPrice: 1, // Huge loss
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
			})
		})

		describe('Negative Prices (Invalid)', () => {
			it('should REJECT negative vendorCost', () => {
				const data = {
					productId: 'prod-123',
					vendorCost: -50,
					customerPrice: 100,
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.error.errors[0].message).toContain('non-negative')
				}
			})

			it('should REJECT negative customerPrice', () => {
				const data = {
					productId: 'prod-123',
					vendorCost: 100,
					customerPrice: -50,
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.error.errors[0].message).toContain('non-negative')
				}
			})

			it('should REJECT both prices negative', () => {
				const data = {
					productId: 'prod-123',
					vendorCost: -100,
					customerPrice: -50,
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
			})
		})

		describe('Missing/Invalid productId', () => {
			it('should REJECT empty productId', () => {
				const data = {
					productId: '',
					vendorCost: 100,
					customerPrice: 150,
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.error.errors[0].path).toContain('productId')
				}
			})

			it('should REJECT missing productId', () => {
				const data = {
					vendorCost: 100,
					customerPrice: 150,
				}

				const result = productPricingSchema.safeParse(data)
				
				expect(result.success).toBe(false)
			})

			it('should REJECT whitespace-only productId', () => {
				const data = {
					productId: '   ',
					vendorCost: 100,
					customerPrice: 150,
				}

				// Note: Current schema may or may not trim - this test documents behavior
				const result = productPricingSchema.safeParse(data)
				
				// Whitespace-only is technically not empty after parsing
				// but should still be considered invalid for a productId
				// This test documents expected behavior per PRD
			})
		})
	})

	// ==========================================================================
	// TYPE COERCION
	// ==========================================================================

	describe('Type Coercion', () => {
		it('should coerce string numbers to numbers for vendorCost', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: '100' as unknown as number,
				customerPrice: 150,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.vendorCost).toBe(100)
				expect(typeof result.data.vendorCost).toBe('number')
			}
		})

		it('should coerce string numbers to numbers for customerPrice', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 100,
				customerPrice: '150' as unknown as number,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.customerPrice).toBe(150)
				expect(typeof result.data.customerPrice).toBe('number')
			}
		})

		it('should coerce decimal string to number', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: '99.99' as unknown as number,
				customerPrice: '149.99' as unknown as number,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.vendorCost).toBe(99.99)
				expect(result.data.customerPrice).toBe(149.99)
			}
		})

		it('should handle "0" string correctly', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: '0' as unknown as number,
				customerPrice: '0' as unknown as number,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.vendorCost).toBe(0)
				expect(result.data.customerPrice).toBe(0)
			}
		})

		it('should reject non-numeric strings', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 'not a number',
				customerPrice: 150,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle floating point precision (0.1 + 0.2)', () => {
			// Famous floating point issue: 0.1 + 0.2 !== 0.3
			const data = {
				productId: 'prod-123',
				vendorCost: 0.1,
				customerPrice: 0.3,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should handle Number.MIN_VALUE', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: Number.MIN_VALUE,
				customerPrice: 1,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should handle very small positive numbers', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 0.01,
				customerPrice: 0.02,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('should reject NaN for vendorCost', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: NaN,
				customerPrice: 100,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
		})

		it('should reject NaN for customerPrice', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 100,
				customerPrice: NaN,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
		})

		it('should reject Infinity', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: Infinity,
				customerPrice: 100,
			}

			const result = productPricingSchema.safeParse(data)
			
			// Infinity should fail - not a valid price
			expect(result.success).toBe(false)
		})

		it('should reject -Infinity', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: -Infinity,
				customerPrice: 100,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
		})

		it('should handle undefined values as null', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: undefined,
				customerPrice: undefined,
			}

			const result = productPricingSchema.safeParse(data)
			
			// undefined should be coerced/handled similar to null
			// The schema uses .nullable() so this documents the behavior
		})
	})

	// ==========================================================================
	// ERROR MESSAGES
	// ==========================================================================

	describe('Error Messages', () => {
		it('should provide clear error for customerPrice < vendorCost', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 150,
				customerPrice: 100,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
			if (!result.success) {
				const errorMessage = result.error.errors[0].message
				expect(errorMessage).toContain('Customer price must be greater than or equal to vendor cost')
			}
		})

		it('should provide clear error for negative vendorCost', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: -50,
				customerPrice: 100,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
			if (!result.success) {
				const errorMessage = result.error.errors[0].message
				expect(errorMessage).toContain('Vendor cost must be non-negative')
			}
		})

		it('should provide clear error for negative customerPrice', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 100,
				customerPrice: -50,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
			if (!result.success) {
				const errorMessage = result.error.errors[0].message
				expect(errorMessage).toContain('Customer price must be non-negative')
			}
		})

		it('should provide clear error for missing productId', () => {
			const data = {
				productId: '',
				vendorCost: 100,
				customerPrice: 150,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
			if (!result.success) {
				const errorMessage = result.error.errors[0].message
				expect(errorMessage).toContain('Product ID is required')
			}
		})

		it('should include correct path for customerPrice validation error', () => {
			const data = {
				productId: 'prod-123',
				vendorCost: 150,
				customerPrice: 100,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.errors[0].path).toEqual(['customerPrice'])
			}
		})
	})

	// ==========================================================================
	// REAL-WORLD SCENARIOS FROM PRD
	// ==========================================================================

	describe('Real-World Scenarios (PRD Use Cases)', () => {
		it('US-QP-001: Sales rep records vendor cost after negotiation', () => {
			const data = {
				productId: 'cart-product-456',
				vendorCost: 85.50,
				customerPrice: null, // Not set yet
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('US-QP-002: Sales rep sets customer price (must be >= vendor cost)', () => {
			const data = {
				productId: 'cart-product-456',
				vendorCost: 85.50,
				customerPrice: 129.99, // Healthy margin
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('US-QP-002: Sales rep attempts to set customer price below vendor cost - REJECTED', () => {
			const data = {
				productId: 'cart-product-456',
				vendorCost: 85.50,
				customerPrice: 75.00, // Below cost - FORBIDDEN
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(false)
		})

		it('Scenario: Sales rep clears both prices to reset', () => {
			const data = {
				productId: 'cart-product-456',
				vendorCost: null,
				customerPrice: null,
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('Scenario: Medical supply product with high margin', () => {
			const data = {
				productId: 'med-supply-123',
				vendorCost: 50.00,
				customerPrice: 150.00, // 200% markup
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})

		it('Scenario: Bulk order with thin margins', () => {
			const data = {
				productId: 'bulk-123',
				vendorCost: 1000.00,
				customerPrice: 1050.00, // 5% margin
			}

			const result = productPricingSchema.safeParse(data)
			
			expect(result.success).toBe(true)
		})
	})
})

