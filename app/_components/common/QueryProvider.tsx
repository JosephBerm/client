/**
 * @fileoverview React Query Provider Component
 * 
 * MAANG-Level Query Client Configuration:
 * - Optimized staleTime/gcTime for medical supply catalog (data doesn't change frequently)
 * - Retry logic with exponential backoff
 * - Window focus refetching disabled (prevents jarring UX on tab switch)
 * - Error boundaries integration ready
 * 
 * **Industry Standard:**
 * - Facebook, Instagram, Airbnb, Uber all use React Query for server state
 * - Centralizes caching, deduplication, and background refetching
 * - Eliminates manual state management for async data
 * 
 * @module components/common/QueryProvider
 * @category Providers
 */

'use client'

import { useState, type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Default options for React Query
 * 
 * **MAANG Configuration:**
 * - staleTime: 60s - Data is fresh for 1 minute (reduces unnecessary refetches)
 * - gcTime: 5 minutes - Cache persists for 5 minutes (fast back navigation)
 * - retry: 2 - Two retries on failure (handles transient network issues)
 * - refetchOnWindowFocus: false - Prevents jarring refetches on tab switch
 */
const defaultQueryOptions = {
	queries: {
		// Data is considered fresh for 60 seconds
		// Products don't change frequently, so this reduces API calls
		staleTime: 60 * 1000, // 1 minute
		
		// Garbage collection time - how long unused data stays in cache
		// Allows fast back-button navigation without refetching
		gcTime: 5 * 60 * 1000, // 5 minutes
		
		// Retry failed requests twice with exponential backoff
		retry: 2,
		
		// Don't refetch on window focus - jarring UX for product catalogs
		// User expects to see the same products when returning to tab
		refetchOnWindowFocus: false,
		
		// Don't refetch on reconnect automatically
		// User can trigger refresh manually if needed
		refetchOnReconnect: false,
	},
}

/**
 * QueryProvider Component
 * 
 * Provides React Query context to the entire application.
 * Must wrap all components that use useQuery, useMutation, or useInfiniteQuery.
 * 
 * **Important:** Creates QueryClient inside component to ensure
 * client is created once per app instance (SSR-safe pattern).
 * 
 * @param children - Child components
 * @returns Provider wrapper
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <QueryProvider>
 *   {children}
 * </QueryProvider>
 * ```
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
	// Create QueryClient inside component to ensure it's created once per app instance
	// This is the recommended pattern for Next.js to avoid SSR issues
	// Using useState ensures the client persists across re-renders but is unique per request
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: defaultQueryOptions,
			})
	)

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}

