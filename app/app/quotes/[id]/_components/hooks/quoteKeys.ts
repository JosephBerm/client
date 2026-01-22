/**
 * Quote Detail Query Key Factory
 *
 * Ensures consistent cache key structure for quote-related queries.
 * Following the MAANG-level pattern from usePricing.ts
 *
 * @see Rule 120b-tanstack-query - Query key factory pattern
 * @module app/quotes/[id]/_components/hooks/quoteKeys
 */

export const quoteKeys = {
	/** Base key for all quote queries */
	all: ['quotes'] as const,

	/** Keys for quote lists */
	lists: () => [...quoteKeys.all, 'list'] as const,

	/** Keys for quote detail queries */
	details: () => [...quoteKeys.all, 'detail'] as const,

	/** Key for a specific quote detail */
	detail: (id: string) => [...quoteKeys.details(), id] as const,

	/** Keys for quote pricing summary */
	pricingSummary: (quoteId: string) => [...quoteKeys.all, quoteId, 'pricing-summary'] as const,
}
