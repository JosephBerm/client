/**
 * useQuoteSuggestedPricing Hook
 *
 * Fetches suggested pricing from the Advanced Pricing Engine for quote products.
 * Integrates contract pricing, volume tiers, and margin protection for sales reps.
 *
 * **Features:**
 * - Bulk price calculation for all quote products (single API call)
 * - Shows pricing breakdown (which rules applied)
 * - Margin indicator support
 * - Apply suggested pricing with one click
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 3 (Sales Rep View)
 *
 * @see QuotePricingEditor - Uses this hook for suggested pricing display
 * @module app/quotes/[id]/_components/hooks/useQuoteSuggestedPricing
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import API from '@_shared/services/api'
import { logger } from '@_core'

import type Quote from '@_classes/Quote'
import type { PricingRequest, PricingResult } from '@_classes/Pricing'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Suggested pricing data for a single product
 */
export interface SuggestedPriceData {
	/** Product ID */
	productId: string
	/** Base price from product catalog */
	basePrice: number
	/** Final calculated price from pricing engine */
	suggestedPrice: number
	/** Total discount amount */
	discountAmount: number
	/** Effective margin percentage (if available) */
	marginPercent: number | null
	/** Whether margin protection was applied */
	marginProtected: boolean
	/** Applied pricing rules for breakdown display */
	appliedRules: PricingResult['appliedRules']
	/** Has contract/volume pricing applied */
	hasSpecialPricing: boolean
}

/**
 * Return type for useQuoteSuggestedPricing hook
 */
export interface UseQuoteSuggestedPricingReturn {
	/** Map of product ID to suggested pricing data */
	suggestedPricing: Map<string, SuggestedPriceData>
	/** Whether pricing is being fetched */
	isLoading: boolean
	/** Error message if fetch failed */
	error: string | null
	/** Refresh pricing data */
	refresh: () => Promise<void>
	/** Get suggested pricing for a specific product */
	getSuggested: (productId: string) => SuggestedPriceData | null
	/** Check if any products have special pricing */
	hasAnySpecialPricing: boolean
}

// =========================================================================
// HOOK IMPLEMENTATION
// =========================================================================

/**
 * Custom hook to fetch suggested pricing for quote products.
 *
 * Integrates with the Advanced Pricing Engine to:
 * - Fetch bulk pricing for all quote products (efficient single API call)
 * - Include volume tier pricing based on quantities
 * - Include customer contract pricing (if quote linked to customer)
 * - Provide pricing breakdown for transparency
 *
 * **Usage:**
 * 1. Hook fetches pricing when quote products change
 * 2. Sales rep sees suggested prices alongside manual entry
 * 3. Sales rep can click "Apply Suggested" to use engine pricing
 *
 * @param quote - The quote entity (null if not loaded)
 * @param customerId - Customer ID for contract pricing (optional)
 * @returns Suggested pricing data and helpers
 *
 * @example
 * ```typescript
 * const { suggestedPricing, isLoading, getSuggested } = useQuoteSuggestedPricing(quote, customerId)
 *
 * // Get suggestion for a product
 * const suggested = getSuggested('prod-123')
 * if (suggested?.hasSpecialPricing) {
 *   // Show "Contract Pricing Available" badge
 * }
 * ```
 */
export function useQuoteSuggestedPricing(
	quote: Quote | null,
	customerId?: number | null
): UseQuoteSuggestedPricingReturn {
	// State
	const [suggestedPricing, setSuggestedPricing] = useState<Map<string, SuggestedPriceData>>(new Map())
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Extract products from quote
	const products = useMemo(() => quote?.products ?? [], [quote?.products])

	/**
	 * Fetch suggested pricing from the pricing engine
	 */
	const fetchSuggestedPricing = useCallback(async () => {
		// Skip if no products
		if (products.length === 0) {
			setSuggestedPricing(new Map())
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			// Build pricing requests for all products
			const pricingRequests: PricingRequest[] = products.map((p) => ({
				productId: p.productId ?? p.id ?? '',
				customerId: customerId ?? undefined,
				quantity: p.quantity || 1,
				includeBreakdown: true, // Include breakdown for sales rep visibility
			}))

			// Filter out invalid requests
			const validRequests = pricingRequests.filter((r) => r.productId)

			if (validRequests.length === 0) {
				setSuggestedPricing(new Map())
				setIsLoading(false)
				return
			}

			logger.debug('Fetching suggested pricing for quote products', {
				component: 'useQuoteSuggestedPricing',
				action: 'fetchSuggestedPricing',
				productCount: validRequests.length,
				customerId,
			})

			// Bulk API call for efficiency
			const response = await API.Pricing.calculateBulk(validRequests)

			if (!response.data.payload) {
				throw new Error(response.data.message ?? 'Failed to fetch pricing')
			}

			// Map results to product IDs
			const newPricingMap = new Map<string, SuggestedPriceData>()

			response.data.payload.forEach((result: PricingResult) => {
				const hasSpecialPricing =
					result.appliedRules.length > 1 || // More than just base price
					result.totalDiscount > 0 ||
					result.marginProtected

				newPricingMap.set(result.productId, {
					productId: result.productId,
					basePrice: result.basePrice,
					suggestedPrice: result.finalPrice,
					discountAmount: result.totalDiscount,
					marginPercent: result.effectiveMarginPercent ?? null,
					marginProtected: result.marginProtected,
					appliedRules: result.appliedRules,
					hasSpecialPricing,
				})
			})

			setSuggestedPricing(newPricingMap)

			logger.debug('Suggested pricing fetched successfully', {
				component: 'useQuoteSuggestedPricing',
				action: 'fetchSuggestedPricing',
				resultsCount: newPricingMap.size,
			})
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to fetch pricing'
			setError(message)
			logger.error('Failed to fetch suggested pricing', {
				component: 'useQuoteSuggestedPricing',
				action: 'fetchSuggestedPricing',
				error: message,
			})
		} finally {
			setIsLoading(false)
		}
	}, [products, customerId])

	// Fetch pricing when products or customer changes
	useEffect(() => {
		fetchSuggestedPricing()
	}, [fetchSuggestedPricing])

	/**
	 * Get suggested pricing for a specific product
	 */
	const getSuggested = useCallback(
		(productId: string): SuggestedPriceData | null => {
			return suggestedPricing.get(productId) ?? null
		},
		[suggestedPricing]
	)

	/**
	 * Check if any products have special pricing (contract/volume)
	 */
	const hasAnySpecialPricing = useMemo(() => {
		return Array.from(suggestedPricing.values()).some((p) => p.hasSpecialPricing)
	}, [suggestedPricing])

	return {
		suggestedPricing,
		isLoading,
		error,
		refresh: fetchSuggestedPricing,
		getSuggested,
		hasAnySpecialPricing,
	}
}
