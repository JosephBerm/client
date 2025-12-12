/**
 * @fileoverview Store Catalog Page - Server Component
 * 
 * Public-facing store catalog with server-side data fetching for SEO.
 * Implements the official Next.js 16 hybrid pattern:
 * 
 * **Server-Side (this file):**
 * - Reads URL searchParams on server
 * - Fetches initial products and categories
 * - Passes initial data to Client Component
 * - Content appears in initial HTML (SEO)
 * 
 * **Client-Side (StorePageContainer):**
 * - Receives initial data as props
 * - Handles user interactions (search, filter, sort, paginate)
 * - No loading spinner on first render
 * 
 * **Benefits:**
 * - SEO: Products in initial HTML for search engines
 * - Performance: Faster LCP (no waiting for client JS)
 * - URL Shareability: Filtered URLs work on first load
 * - Caching: Server-side caching with Cache Components
 * 
 * @see https://nextjs.org/docs/app/getting-started/fetching-data
 * @module pages/store
 * @category Pages
 */

import { Suspense } from 'react'

import { fetchInitialStoreData } from '@_features/store/server'

import { StorePageContainer, StoreSkeleton } from '@_components/store'

/**
 * Store page search params (from URL)
 */
interface StorePageProps {
	searchParams: Promise<{
		search?: string
		categories?: string
		sort?: string
		page?: string
		pageSize?: string
	}>
}

/**
 * Store catalog page component - Server Component
 * 
 * Fetches initial data server-side and passes to Client Component.
 * This enables:
 * - Products in initial HTML (SEO)
 * - Faster first paint (no client-side fetch needed)
 * - URL-based filtering works on server
 * 
 * **Note:** React RSC automatically serializes class instances when
 * passing from Server to Client Components. No manual serialization needed.
 * 
 * @component
 */
export default async function StorePage({ searchParams }: StorePageProps) {
	// Await searchParams per Next.js 16 requirement
	const params = await searchParams
	
	// Fetch initial data server-side
	const initialData = await fetchInitialStoreData(params)
	
	return (
		<Suspense fallback={<StoreSkeleton />}>
			<StorePageContainer
				initialProducts={initialData.products}
				initialProductsResult={initialData.productsResult}
				initialCategories={initialData.categories}
				initialSearchParams={initialData.searchParams}
			/>
		</Suspense>
	)
}

/**
 * Generate metadata for SEO
 * 
 * Uses searchParams to create dynamic titles/descriptions
 * based on current filters.
 */
export async function generateMetadata({ searchParams }: StorePageProps) {
	const params = await searchParams
	
	// Build dynamic title based on filters
	let title = 'Medical Supply Store'
	if (params.search) {
		title = `Search: "${params.search}" - Medical Supply Store`
	}
	
	// Build dynamic description
	let description = 'Browse our catalog of quality medical supplies. Filter by category, search by name, and find the products you need.'
	if (params.categories) {
		description = `Shop medical supplies in selected categories. ${description}`
	}
	
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: 'website',
		},
	}
}
