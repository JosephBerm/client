/**
 * Quote Query Key Factory
 *
 * Centralized cache keys for quote queries.
 *
 * @module features/quotes/hooks/quoteKeys
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

	/** Key for a specific quote activity feed */
	activity: (id: string) => [...quoteKeys.detail(id), 'activity'] as const,

	/** Keys for quote pricing summary */
	pricingSummary: (quoteId: string) => [...quoteKeys.all, quoteId, 'pricing-summary'] as const,
}
