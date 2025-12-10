/**
 * @fileoverview Store Catalog Page
 * 
 * Public-facing store catalog with product browsing, search, filtering, and pagination.
 * Implements FAANG-level best practices for performance, accessibility, and user experience.
 * 
 * **Refactored Architecture:**
 * - Business logic extracted to `useStorePageLogic` hook
 * - UI components separated into focused, reusable components
 * - Container/Presentational pattern for clean separation
 * - Simplified page component (orchestration only)
 * 
 * **Key Features:**
 * - Real-time search with debouncing
 * - Category filtering with multi-select
 * - Sort options (relevance, price, name, date)
 * - Responsive grid layout (1-3 columns)
 * - Pagination controls with "load more"
 * - Skeleton loading states
 * - Focus management for accessibility
 * - Request cancellation (AbortController)
 * 
 * **Performance Optimizations:**
 * - Memoized computed values
 * - Memoized event handlers
 * - Debounced search (400ms)
 * - Priority image loading
 * - Request deduplication
 * 
 * @module pages/store
 * @category Pages
 */

'use client'

import { StorePageContainer } from '@_components/store'

// Removed force-dynamic - Client Components are already fully dynamic by default.
// Removed Suspense - not needed for Client Components that fetch data with hooks.
// Loading states are managed by isLoading state in useStorePageLogic hook.

/**
 * Store catalog page component
 * 
 * **Simplified Implementation:**
 * All business logic and state management is handled by:
 * - `useStorePageLogic` hook (in @_features/store)
 * - `StorePageContainer` component (in @_components/store)
 * 
 * This page is a thin wrapper that renders the store container.
 * Loading states are managed by the `isLoading` state in the hook.
 * 
 * **Next.js 15 Note:**
 * Client Component pages don't receive params/searchParams as props.
 * All URL state is handled client-side via hooks (useSearchParams, useRouter).
 * 
 * **Component Breakdown:**
 * - `StoreHeader`: Page title and description
 * - `UnifiedStoreToolbar`: Search, sort, filter controls
 * - `StoreFilters`: Category filter sidebar
 * - `StoreProductGrid`: Products display with pagination
 * 
 * @component
 */
const Page = () => <StorePageContainer />

export default Page
