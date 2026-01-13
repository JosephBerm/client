'use client'

/**
 * Customer Pricing Hook
 *
 * Provides customer-specific pricing for product displays.
 * Integrates with the Advanced Pricing Engine to show:
 * - Customer's negotiated contract price
 * - Volume tier discounts
 * - Savings indicators
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 3 (Customer View)
 *
 * **Features:**
 * - Automatically fetches customer ID from auth context
 * - Caches pricing results for performance
 * - Shows discount badges when special pricing applies
 * - Volume tier "next tier" savings indicator
 *
 * @module pricing/hooks/useCustomerPricing
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@_features/auth'
import API from '@_shared/services/api'
import { pricingKeys } from './usePricing'
import type { PricingResult, VolumeTier } from '@_classes/Pricing'

// =========================================================================
// CONSTANTS
// =========================================================================

/** Stale time for customer pricing (5 minutes) */
const CUSTOMER_PRICE_STALE_TIME = 5 * 60 * 1000

// =========================================================================
// TYPES
// =========================================================================

export interface CustomerPricingData {
	/** Final price after all discounts */
	finalPrice: number
	/** Original base price */
	basePrice: number
	/** Total discount amount */
	discountAmount: number
	/** Discount percentage */
	discountPercent: number
	/** Whether special pricing (contract/volume) applies */
	hasSpecialPricing: boolean
	/** Name of applied price list (if any) */
	priceListName: string | null
	/** Applied pricing rules for breakdown */
	appliedRules: PricingResult['appliedRules']
}

export interface VolumeTierSavings {
	/** Current tier being applied */
	currentTier: VolumeTier | null
	/** Next tier the customer could reach */
	nextTier: VolumeTier | null
	/** Quantity needed to reach next tier */
	unitsToNextTier: number
	/** Savings per unit at next tier */
	savingsPerUnit: number
	/** Message like "Order 5 more for $10 savings" */
	savingsMessage: string | null
}

export interface UseCustomerPricingReturn {
	/** Pricing data for the product */
	pricing: CustomerPricingData | null
	/** Volume tier savings info */
	volumeSavings: VolumeTierSavings | null
	/** Whether pricing is being fetched */
	isLoading: boolean
	/** Error if pricing fetch failed */
	error: Error | null
	/** Refresh pricing data */
	refetch: () => void
}

// =========================================================================
// HOOK IMPLEMENTATION
// =========================================================================

/**
 * Hook to get customer-specific pricing for a product.
 *
 * Automatically uses the current user's customer ID for pricing lookup.
 * Returns cached pricing with automatic background refresh.
 *
 * **Usage:**
 * - Product cards to show "Your Price"
 * - Product detail page for personalized pricing
 * - Cart items with customer-specific pricing
 *
 * @param productId - Product GUID
 * @param quantity - Quantity for volume pricing (default: 1)
 * @param enabled - Whether to fetch pricing (default: true)
 *
 * @example
 * ```typescript
 * const { pricing, volumeSavings, isLoading } = useCustomerPricing(product.id, 10)
 *
 * if (pricing?.hasSpecialPricing) {
 *   // Show "Contract Pricing" badge
 * }
 *
 * if (volumeSavings?.savingsMessage) {
 *   // Show "Order 5 more for $X savings"
 * }
 * ```
 */
export function useCustomerPricing(
	productId: string,
	quantity: number = 1,
	enabled: boolean = true
): UseCustomerPricingReturn {
	// Get current user from auth store
	const user = useAuthStore((state) => state.user)
	const customerId = user?.customerId && user.customerId > 0 ? user.customerId : undefined

	// Fetch pricing from API
	const {
		data: pricingResult,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: pricingKeys.calculation(productId, customerId, quantity),
		queryFn: async () => {
			const response = await API.Pricing.calculate({
				productId,
				customerId,
				quantity,
				includeBreakdown: true,
			})
			return response.data.payload!
		},
		enabled: enabled && !!productId,
		staleTime: CUSTOMER_PRICE_STALE_TIME,
	})

	// Fetch volume tiers for savings calculation
	const { data: volumeTiersData } = useQuery({
		queryKey: pricingKeys.productVolumeTiers(productId),
		queryFn: async () => {
			const response = await API.Pricing.getVolumeTiers(productId)
			return response.data.payload
		},
		enabled: enabled && !!productId,
		staleTime: CUSTOMER_PRICE_STALE_TIME,
	})

	// Transform pricing result to customer-friendly format
	const pricing = useMemo((): CustomerPricingData | null => {
		if (!pricingResult) return null

		const discountAmount = pricingResult.basePrice - pricingResult.finalPrice
		const discountPercent =
			pricingResult.basePrice > 0 ? (discountAmount / pricingResult.basePrice) * 100 : 0

		// Check if special pricing applies (more than just base price rule)
		const hasSpecialPricing =
			pricingResult.appliedRules.length > 1 ||
			discountAmount > 0 ||
			pricingResult.marginProtected

		// Extract price list name from applied rules
		const contractRule = pricingResult.appliedRules.find(
			(rule) => rule.ruleType === 'ContractPrice' || rule.ruleType === 'PriceList'
		)
		const priceListName = contractRule?.ruleName ?? null

		return {
			finalPrice: pricingResult.finalPrice,
			basePrice: pricingResult.basePrice,
			discountAmount,
			discountPercent,
			hasSpecialPricing,
			priceListName,
			appliedRules: pricingResult.appliedRules,
		}
	}, [pricingResult])

	// Calculate volume tier savings
	const volumeSavings = useMemo((): VolumeTierSavings | null => {
		const tiers = volumeTiersData?.tiers
		if (!tiers || tiers.length === 0) return null

		// Sort tiers by minQuantity
		const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity)

		// Find current tier
		const currentTier =
			sortedTiers.find(
				(tier) =>
					quantity >= tier.minQuantity &&
					(tier.maxQuantity === null || quantity <= tier.maxQuantity)
			) ?? null

		// Find next tier (first tier with minQuantity > current quantity)
		const nextTier = sortedTiers.find((tier) => tier.minQuantity > quantity) ?? null

		if (!nextTier) {
			return {
				currentTier,
				nextTier: null,
				unitsToNextTier: 0,
				savingsPerUnit: 0,
				savingsMessage: null,
			}
		}

		const unitsToNextTier = nextTier.minQuantity - quantity
		const currentPrice = pricing?.finalPrice ?? pricingResult?.basePrice ?? 0
		const nextTierPrice = nextTier.calculatedPrice ?? 0
		const savingsPerUnit = currentPrice - nextTierPrice

		// Generate savings message (US-PRICE-008)
		let savingsMessage: string | null = null
		if (unitsToNextTier > 0 && savingsPerUnit > 0) {
			const totalSavings = savingsPerUnit * nextTier.minQuantity
			savingsMessage = `Order ${unitsToNextTier} more for $${totalSavings.toFixed(2)} savings`
		}

		return {
			currentTier,
			nextTier,
			unitsToNextTier,
			savingsPerUnit,
			savingsMessage,
		}
	}, [volumeTiersData, quantity, pricing, pricingResult])

	return {
		pricing,
		volumeSavings,
		isLoading,
		error: error as Error | null,
		refetch,
	}
}

/**
 * Hook to get bulk customer pricing for multiple products.
 *
 * Optimized for product lists and cart pages to avoid N+1 requests.
 *
 * @param productIds - Array of product GUIDs
 * @param enabled - Whether to fetch pricing (default: true)
 *
 * @example
 * ```typescript
 * const { pricingMap, isLoading } = useBulkCustomerPricing(productIds)
 *
 * // Get pricing for a specific product
 * const pricing = pricingMap.get('prod-123')
 * ```
 */
export function useBulkCustomerPricing(productIds: string[], enabled: boolean = true) {
	const user = useAuthStore((state) => state.user)
	const customerId = user?.customerId && user.customerId > 0 ? user.customerId : undefined

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['pricing', 'bulk', productIds, customerId],
		queryFn: async () => {
			const requests = productIds.map((productId) => ({
				productId,
				customerId,
				quantity: 1,
				includeBreakdown: false, // Performance: no breakdown for lists
			}))

			const response = await API.Pricing.calculateBulk(requests)
			return response.data.payload!
		},
		enabled: enabled && productIds.length > 0,
		staleTime: CUSTOMER_PRICE_STALE_TIME,
	})

	// Create a map for easy lookup
	const pricingMap = useMemo(() => {
		const map = new Map<string, PricingResult>()
		if (data) {
			data.forEach((result) => {
				map.set(result.productId, result)
			})
		}
		return map
	}, [data])

	return {
		pricingMap,
		isLoading,
		error: error as Error | null,
		refetch,
	}
}
