/**
 * usePricingOverview Hook
 *
 * Fetches pricing overview statistics for the dashboard.
 * Provides aggregate counts and status information.
 *
 * **PRD Reference:** prd_pricing_engine.md - Admin View
 *
 * **Next.js 16 Optimization:**
 * - React Compiler enabled - automatic memoization
 * - No manual useCallback needed for stable function references
 *
 * @module app/pricing/_components/hooks/usePricingOverview
 */

'use client'

import { useState, useEffect } from 'react'

import { logger } from '@_core'

import API from '@_shared/services/api'

// =========================================================================
// TYPES
// =========================================================================

export interface PricingStats {
	/** Total number of price lists */
	totalPriceLists: number
	/** Number of active price lists */
	activePriceLists: number
	/** Number of customers with price list assignments */
	customersWithPricing: number
	/** Number of products with volume tiers */
	productsWithVolumeTiers: number
}

export interface UsePricingOverviewReturn {
	/** Pricing statistics */
	stats: PricingStats | null
	/** Loading state */
	isLoading: boolean
	/** Error message */
	error: string | null
	/** Refresh statistics */
	refresh: () => Promise<void>
}

// =========================================================================
// HOOK
// =========================================================================

/**
 * Hook to fetch pricing overview statistics.
 *
 * @returns Pricing overview data and helpers
 *
 * @example
 * ```tsx
 * const { stats, isLoading, error, refresh } = usePricingOverview()
 *
 * if (stats) {
 *   console.log(`Active price lists: ${stats.activePriceLists}`)
 * }
 * ```
 */
export function usePricingOverview(): UsePricingOverviewReturn {
	const [stats, setStats] = useState<PricingStats | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// React Compiler auto-memoizes this function
	const fetchStats = async () => {
		setIsLoading(true)
		setError(null)

		try {
			// Fetch price lists to calculate stats
			const response = await API.Pricing.getPriceLists(1, 100)

			if (response.data.payload) {
				const priceLists = response.data.payload.data ?? []
				const activeLists = priceLists.filter((pl) => pl.isActive)
				const customersWithPricing = new Set(
					priceLists.flatMap((pl) => pl.customers?.map((c) => c.customerId) ?? [])
				).size

				setStats({
					totalPriceLists: response.data.payload.total ?? priceLists.length,
					activePriceLists: activeLists.length,
					customersWithPricing,
					productsWithVolumeTiers: 0, // Would need separate API call
				})
			}

			logger.debug('Pricing stats fetched', {
				component: 'usePricingOverview',
				action: 'fetchStats',
			})
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to fetch pricing statistics'
			setError(message)
			logger.error('Failed to fetch pricing stats', {
				component: 'usePricingOverview',
				action: 'fetchStats',
				error: message,
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Fetch on mount only
	useEffect(() => {
		void fetchStats()
	}, [])

	return {
		stats,
		isLoading,
		error,
		refresh: fetchStats,
	}
}
