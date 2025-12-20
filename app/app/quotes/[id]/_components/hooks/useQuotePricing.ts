/**
 * useQuotePricing Hook
 * 
 * Manages quote pricing updates (vendor cost, customer price).
 * Uses useFormSubmit for DRY API handling with automatic
 * loading state, error notifications, and success callbacks.
 * 
 * **Features:**
 * - Update pricing for individual products
 * - Client-side validation before API calls
 * - Check if quote can be sent to customer
 * - Optimistic update pattern ready
 * 
 * **Business Rules:**
 * - customerPrice must be >= vendorCost (when both set)
 * - All products need customerPrice before quote can be sent
 * - Only quotes with status 'Read' can have pricing edited
 * 
 * @see prd_quotes_pricing.md - Full specification
 * @module app/quotes/[id]/_components/hooks/useQuotePricing
 */

'use client'

import { useCallback } from 'react'

import { useFormSubmit, API } from '@_shared'
import { productPricingSchema, type ProductPricingFormData } from '@_core/validation/validation-schemas'

import type Quote from '@_classes/Quote'

/**
 * Return type for useQuotePricing hook
 */
export interface UseQuotePricingReturn {
	/** Update pricing for a single product */
	updatePricing: (data: ProductPricingFormData) => Promise<{ success: boolean }>
	/** Whether pricing update is in progress */
	isUpdating: boolean
	/** Validate pricing data (client-side) */
	validatePricing: (data: ProductPricingFormData) => { valid: boolean; errors: string[] }
	/** Check if all products have customer price set */
	canSendToCustomer: (quote: Quote | null) => boolean
}

/**
 * Custom hook for quote pricing operations
 * 
 * Provides methods to update product pricing and validate business rules.
 * Uses useFormSubmit for consistent error handling and loading states.
 * 
 * **Usage:**
 * 1. Call updatePricing when user blurs a pricing input field
 * 2. Use validatePricing for immediate client-side feedback
 * 3. Use canSendToCustomer to control "Send to Customer" button state
 * 
 * @param quote - The quote entity (null if not loaded)
 * @param onRefresh - Callback to refresh quote data after update
 * @returns Pricing operations and status
 * 
 * @example
 * ```tsx
 * const { updatePricing, isUpdating, canSendToCustomer } = useQuotePricing(quote, refresh)
 * 
 * const handleBlur = async (productId: string, vendorCost: number | null, customerPrice: number | null) => {
 *   const result = await updatePricing({ productId, vendorCost, customerPrice })
 *   if (result.success) {
 *     // Pricing saved
 *   }
 * }
 * 
 * // In JSX
 * <Button disabled={!canSendToCustomer(quote)}>Send to Customer</Button>
 * ```
 */
export function useQuotePricing(
	quote: Quote | null,
	onRefresh?: () => Promise<void>
): UseQuotePricingReturn {
	const quoteId = quote?.id

	// API call wrapped in useFormSubmit for DRY error handling
	const { submit, isSubmitting } = useFormSubmit(
		async (data: ProductPricingFormData) => {
			if (!quoteId) throw new Error('Quote ID required')

			return API.Quotes.updateProductPricing(
				quoteId,
				data.productId,
				data.vendorCost,
				data.customerPrice
			)
		},
		{
			successMessage: 'Pricing updated',
			errorMessage: 'Failed to update pricing',
			componentName: 'useQuotePricing',
			actionName: 'updatePricing',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	/**
	 * Update pricing for a single product
	 */
	const updatePricing = useCallback(
		async (data: ProductPricingFormData): Promise<{ success: boolean }> => {
			return submit(data)
		},
		[submit]
	)

	/**
	 * Validate pricing data client-side
	 * Returns validation result with error messages
	 */
	const validatePricing = useCallback(
		(data: ProductPricingFormData): { valid: boolean; errors: string[] } => {
			const result = productPricingSchema.safeParse(data)
			if (result.success) {
				return { valid: true, errors: [] }
			}
			return {
				valid: false,
				errors: result.error.errors.map((e) => e.message),
			}
		},
		[]
	)

	/**
	 * Check if quote can be sent to customer
	 * True only if ALL products have customerPrice set
	 * 
	 * @see prd_quotes_pricing.md - US-QP-004
	 */
	const canSendToCustomer = useCallback(
		(q: Quote | null): boolean => {
			if (!q?.products || q.products.length === 0) return false
			return q.products.every((p) => p.customerPrice != null && p.customerPrice > 0)
		},
		[]
	)

	return {
		updatePricing,
		isUpdating: isSubmitting,
		validatePricing,
		canSendToCustomer,
	}
}

