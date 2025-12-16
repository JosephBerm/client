/**
 * useQuoteDetails Hook - Data Fetching Pattern
 * 
 * Custom hook for fetching and managing quote detail data.
 * Follows the same pattern as `useAccountDetailLogic` for consistency.
 * 
 * **Features:**
 * - Fetches quote by ID from route params
 * - Loading and error states
 * - Automatic refetch on quoteId change
 * - Error handling with notifications
 * - Type-safe with Quote entity
 * 
 * **Pattern:**
 * - Similar to `useAccountDetailLogic` hook structure
 * - Uses `useRouteParam` for route parameter extraction
 * - Uses `API.Quotes.get` for data fetching
 * - Uses `notificationService` for error handling
 * 
 * @module app/quotes/[id]/_components/hooks/useQuoteDetails
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { logger } from '@_core'

import { notificationService, useRouteParam, API } from '@_shared'

import Quote from '@_classes/Quote'

/**
 * Return type for useQuoteDetails hook
 */
export interface UseQuoteDetailsReturn {
	/** The quote entity (null if not loaded or not found) */
	quote: Quote | null
	/** Whether quote data is currently loading */
	isLoading: boolean
	/** Error message if fetch failed (null if no error) */
	error: string | null
	/** Manually refresh quote data */
	refresh: () => Promise<void>
}

/**
 * Custom hook for fetching quote details
 * 
 * Fetches quote data by ID from route params.
 * Handles loading states, errors, and automatic navigation on failure.
 * 
 * **Data Fetching:**
 * - Triggered by useEffect when quoteId is available
 * - Calls API.Quotes.get() to fetch quote
 * - Parses response into Quote entity
 * - Shows error notifications on failure
 * - Navigates back if quote not found
 * 
 * **Error Handling:**
 * - Network errors: Shows error notification
 * - Not found: Shows error notification and navigates back
 * - Invalid ID: Shows error notification and navigates back
 * 
 * @returns Quote data, loading state, error, and refresh function
 * 
 * @example
 * ```tsx
 * const { quote, isLoading, error, refresh } = useQuoteDetails()
 * 
 * if (isLoading) return <LoadingSpinner />
 * if (error) return <ErrorMessage message={error} />
 * if (!quote) return <NotFound />
 * 
 * return <QuoteDetails quote={quote} />
 * ```
 */
export function useQuoteDetails(): UseQuoteDetailsReturn {
	const router = useRouter()
	const quoteId = useRouteParam('id')

	const [quote, setQuote] = useState<Quote | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetch quote data from API
	 */
	const fetchQuote = useCallback(async () => {
		if (!quoteId) {
			setIsLoading(false)
			return
		}

		try {
			setIsLoading(true)
			setError(null)

			const { data } = await API.Quotes.get<Quote>(quoteId)

			if (!data.payload) {
				const errorMessage = data.message || 'Unable to load quote'
				setError(errorMessage)
				notificationService.error(errorMessage, {
					metadata: { quoteId },
					component: 'useQuoteDetails',
					action: 'fetchQuote',
				})
				router.back()
				return
			}

			setQuote(new Quote(data.payload))
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unable to load quote'
			setError(errorMessage)
			notificationService.error(errorMessage, {
				metadata: { error: err, quoteId },
				component: 'useQuoteDetails',
				action: 'fetchQuote',
			})
			router.back()
		} finally {
			setIsLoading(false)
		}
	}, [quoteId, router])

	// Fetch quote when quoteId changes
	useEffect(() => {
		if (!quoteId) {
			router.back()
			return
		}

		void fetchQuote()
	}, [quoteId, router, fetchQuote])

	/**
	 * Manual refresh function
	 */
	const refresh = useCallback(async () => {
		await fetchQuote()
	}, [fetchQuote])

	return {
		quote,
		isLoading,
		error,
		refresh,
	}
}

