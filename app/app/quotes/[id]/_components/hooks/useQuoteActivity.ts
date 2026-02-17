'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { API } from '@_shared'

import { quoteKeys } from './quoteKeys'

export interface QuoteActivityLogItem {
	action: string
	actionDetails?: string | null
	userId?: string | null
	timestamp: string
}

export function useQuoteActivity(
	quoteId: string | null | undefined,
	options?: Omit<UseQueryOptions<QuoteActivityLogItem[], Error>, 'queryKey' | 'queryFn'>,
) {
	return useQuery({
		queryKey: quoteId ? quoteKeys.activity(quoteId) : quoteKeys.all,
		queryFn: async () => {
			const response = await API.Quotes.getActivity(quoteId!)
			if (!response.data.payload) {
				throw new Error(response.data.message || 'Failed to load quote activity')
			}
			return response.data.payload
		},
		enabled: !!quoteId,
		staleTime: 30_000,
		...options,
	})
}
