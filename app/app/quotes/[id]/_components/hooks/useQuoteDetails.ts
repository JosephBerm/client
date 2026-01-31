/**
 * useQuoteDetails Hook - TanStack Query Pattern
 *
 * Custom hook for fetching and managing quote detail data.
 * Follows the MAANG-level pattern from usePricing.ts and usePayments.ts.
 *
 * **Features:**
 * - Automatic caching with TanStack Query
 * - Background refetching when quote data becomes stale
 * - Type-safe with Quote entity
 * - Error state returned (no auto-navigation)
 *
 * **Best Practices Applied:**
 * - Rule 120b-tanstack-query: Query key factory pattern
 * - Rule 110b-react-hooks: No manual memoization (React 19 compiler)
 * - Shows error UI instead of auto-navigating away (better UX)
 *
 * @module app/quotes/[id]/_components/hooks/useQuoteDetails
 */

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { API, useRouteParam } from '@_shared'

import Quote from '@_classes/Quote'

import { quoteKeys } from '@_features/quotes/hooks/quoteKeys'

/** Stale time for quote details (1 minute - matches QueryProvider default) */
const QUOTE_STALE_TIME = 60 * 1000

/**
 * Return type for useQuoteDetails hook
 */
export interface UseQuoteDetailsReturn {
	/** The quote entity (null if not loaded or not found) */
	quote: Quote | null
	/** Whether quote data is currently loading */
	isLoading: boolean
	/** Error object if fetch failed (null if no error) */
	error: Error | null
	/** Manually refresh quote data */
	refresh: () => Promise<void>
	/** Whether the query is currently fetching (includes background refetches) */
	isFetching: boolean
}

/**
 * Custom hook for fetching quote details using TanStack Query.
 *
 * Returns error state instead of auto-navigating away on errors.
 * This provides better UX by allowing users to see what went wrong
 * and manually navigate back.
 *
 * @returns Quote data, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * const { quote, isLoading, error, refresh } = useQuoteDetails()
 *
 * if (isLoading) return <QuoteDetailSkeleton />
 * if (error) return <QuoteErrorCard error={error} />
 * if (!quote) return <QuoteNotFound />
 *
 * return <QuoteDetails quote={quote} onRefresh={refresh} />
 * ```
 */
export function useQuoteDetails(): UseQuoteDetailsReturn {
	const queryClient = useQueryClient()
	const quoteId = useRouteParam('id')

	const {
		data: quote,
		isLoading,
		error,
		isFetching,
	} = useQuery({
		queryKey: quoteKeys.detail(quoteId ?? ''),
		queryFn: async () => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}

			const { data } = await API.Quotes.get<Quote>(quoteId)

			if (!data.payload) {
				throw new Error(data.message || 'Quote not found')
			}

			return new Quote(data.payload)
		},
		enabled: !!quoteId,
		staleTime: QUOTE_STALE_TIME,
	})

	/**
	 * Manual refresh function - invalidates cache and refetches
	 */
	const refresh = async () => {
		if (quoteId) {
			await queryClient.invalidateQueries({ queryKey: quoteKeys.detail(quoteId) })
		}
	}

	return {
		quote: quote ?? null,
		isLoading,
		error: error as Error | null,
		refresh,
		isFetching,
	}
}
