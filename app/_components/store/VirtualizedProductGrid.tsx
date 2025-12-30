/**
 * VirtualizedProductGrid Component
 * 
 * High-performance product grid with virtualization and infinite scroll.
 * Only renders visible products in the DOM for memory efficiency.
 * 
 * **MAANG Best Practices:**
 * - Uses @tanstack/react-query for data fetching (caching, deduplication)
 * - Uses @tanstack/react-virtual with WINDOW scroll (not container scroll)
 * - Dynamic row measurement via `measureElement` (Meta/Facebook pattern)
 * - Intersection Observer for infinite scroll trigger
 * - DOM recycling (constant ~30 elements regardless of total products)
 * - CSS Grid for proper layout (no absolute positioning overlap issues)
 * - Integrates with existing ScrollRevealCard animations
 * 
 * **Architecture Decision:**
 * Uses `useWindowVirtualizer` pattern - the page scrollbar is used,
 * not a separate scrollable container. This prevents dual scrollbars
 * and integrates naturally with the page layout.
 * 
 * **Dynamic Height Measurement (MAANG Pattern):**
 * Instead of hardcoding row heights, we use @tanstack/react-virtual's
 * built-in `measureElement` API. This approach is used by:
 * - Meta/Facebook's virtualized lists
 * - Google's YouTube comment sections
 * - Airbnb's search results
 * 
 * The virtualizer:
 * 1. Uses `estimateSize` for initial layout (before DOM measurement)
 * 2. Measures actual DOM elements via `measureElement` callback
 * 3. Caches measurements automatically
 * 4. Re-positions all elements when measurements change
 * 
 * **Data Fetching:**
 * Component owns its data via useProductsInfiniteQuery.
 * Fetches 20 products at a time as user scrolls (not all at once).
 * React Query handles caching, deduplication, and race conditions.
 * 
 * @module components/store/VirtualizedProductGrid
 * @category Components
 */

'use client'

import { useRef, useMemo, useEffect, useState, useCallback } from 'react'

import { useWindowVirtualizer } from '@tanstack/react-virtual'

import { 
	useProductsInfiniteQuery, 
	flattenProductPages,
	getTotalProductCount,
	type ProductQueryFilters,
} from '@_features/store/hooks/useProductsInfiniteQuery'

import { useGridColumns } from '@_shared/hooks/useGridColumns'
import { useInfiniteScroll } from '@_shared/hooks/useInfiniteScroll'

import type { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

import ProductCard from './ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'
import ScrollRevealCard from './ScrollRevealCard'

// ============================================================================
// GRID CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Initial height estimates per breakpoint (in pixels).
 * 
 * ## Why Do We Need These Estimates?
 * 
 * **Simple Explanation:**
 * The virtualizer needs to know how tall each row is BEFORE it renders them,
 * so it can calculate:
 * - How tall the entire scrollable area should be
 * - Which rows are currently visible on screen
 * - Where to position each row
 * 
 * **The Problem:**
 * We can't know the exact height until the row actually renders in the DOM.
 * But we need heights to decide WHAT to render. Chicken and egg problem!
 * 
 * **The Solution (Two-Phase Approach):**
 * 1. **Phase 1 - Estimate:** Use these estimates for initial layout
 * 2. **Phase 2 - Measure:** Once rows render, `measureElement` gets real heights
 *    and the virtualizer auto-corrects positions
 * 
 * **Why Different Estimates Per Breakpoint?**
 * Product cards use `aspect-square` images, so:
 * - On mobile (1 column): cards are ~350px wide → images ~350px tall
 * - On desktop (4 columns): cards are ~260px wide → images ~260px tall
 * 
 * Better estimates = less layout shift when real measurements come in.
 */
const ESTIMATED_ROW_HEIGHTS = {
	/** Mobile (< 640px): 1 column, cards ~full width */
	sm: 600,
	/** Tablet (640-1024px): 2 columns */
	md: 550,
	/** Desktop (1024-1280px): 3 columns */
	lg: 520,
	/** Large desktop (1280px+): 4 columns */
	xl: 500,
} as const

/**
 * Get estimated row height based on current column count.
 */
function getEstimatedRowHeight(columns: number): number {
	switch (columns) {
		case 1: return ESTIMATED_ROW_HEIGHTS.sm
		case 2: return ESTIMATED_ROW_HEIGHTS.md
		case 3: return ESTIMATED_ROW_HEIGHTS.lg
		case 4:
		default: return ESTIMATED_ROW_HEIGHTS.xl
	}
}

/**
 * Gap between grid items in pixels.
 * Matches Tailwind's gap-8 (2rem = 32px).
 */
const GRID_GAP = 32

/**
 * Number of rows to render outside the visible viewport.
 * Higher = smoother scrolling, but more DOM nodes.
 */
const OVERSCAN_ROWS = 5

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Props for VirtualizedProductGrid
 */
export interface VirtualizedProductGridProps {
	/** Search text for filtering */
	searchText?: string
	/** Selected categories for filtering */
	selectedCategories?: ProductsCategory[]
	/** Sort option value */
	sortValue?: string
	/** Callback when category tag is clicked on a product card */
	onCategoryFilter: (category: ProductsCategory) => void
	/** Number of images to load with priority (default: 6) */
	priorityImageCount?: number
}

/**
 * VirtualizedProductGrid Component
 * 
 * Renders a high-performance virtualized product grid with infinite scroll.
 * Component owns its data fetching via useProductsInfiniteQuery.
 * 
 * @example
 * ```tsx
 * <VirtualizedProductGrid
 *   searchText={searchText}
 *   selectedCategories={selectedCategories}
 *   sortValue={currentSort}
 *   onCategoryFilter={handleCategoryFilter}
 * />
 * ```
 */
export default function VirtualizedProductGrid({
	searchText = '',
	selectedCategories = [],
	sortValue = '',
	onCategoryFilter,
	priorityImageCount = 6,
}: VirtualizedProductGridProps) {
	const listRef = useRef<HTMLDivElement>(null)
	const [isMounted, setIsMounted] = useState(false)
	
	// Ensure we're mounted before using window APIs
	useEffect(() => {
		setIsMounted(true)
	}, [])
	
	// Build query filters from props
	const queryFilters: ProductQueryFilters = useMemo(() => ({
		searchText: searchText || undefined,
		categories: selectedCategories.length > 0 ? selectedCategories : undefined,
		sortValue: sortValue || undefined,
		pageSize: 20, // Fetch 20 products at a time
	}), [searchText, selectedCategories, sortValue])
	
	// Use infinite query for data fetching
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
	} = useProductsInfiniteQuery(queryFilters)
	
	// Flatten all pages into single products array
	const products = useMemo(() => flattenProductPages(data), [data])
	const totalCount = useMemo(() => getTotalProductCount(data), [data])
	
	// Get responsive column count
	const columns = useGridColumns()
	
	// Calculate row metrics using responsive estimates
	const estimatedRowHeight = getEstimatedRowHeight(columns) + GRID_GAP
	const totalRows = Math.ceil(products.length / columns)
	
	// Initialize WINDOW virtualizer with DYNAMIC MEASUREMENT
	const virtualizer = useWindowVirtualizer({
		count: totalRows,
		// Initial estimate - used before measureElement has data
		estimateSize: useCallback(() => estimatedRowHeight, [estimatedRowHeight]),
		overscan: OVERSCAN_ROWS,
		scrollMargin: listRef.current?.offsetTop ?? 0,
		// Dynamic row measurement - measures actual DOM heights
		measureElement: useCallback((element: Element) => {
			const { height } = element.getBoundingClientRect()
			return height + GRID_GAP
		}, []),
	})
	
	// Setup infinite scroll sentinel
	const { sentinelRef } = useInfiniteScroll({
		onLoadMore: () => {
			if (hasNextPage && !isFetchingNextPage) {
				void fetchNextPage()
			}
		},
		hasMore: hasNextPage ?? false,
		isLoading: isFetchingNextPage,
		rootMargin: '0px 0px 600px 0px', // Load 600px before bottom
	})
	
	// Get virtual rows to render
	const virtualRows = virtualizer.getVirtualItems()
	
	// Build list of products to render based on virtual rows
	const visibleProducts = useMemo(() => {
		const items: Array<{
			index: number
			product: Product
			rowIndex: number
			virtualStart: number
		}> = []
		
		for (const virtualRow of virtualRows) {
			const rowIndex = virtualRow.index
			const startIndex = rowIndex * columns
			const endIndex = Math.min(startIndex + columns, products.length)
			
			for (let itemIndex = startIndex; itemIndex < endIndex; itemIndex++) {
				const product = products[itemIndex]
				if (!product) {
					continue
				}
				
				items.push({
					index: itemIndex,
					product,
					rowIndex,
					virtualStart: virtualRow.start,
				})
			}
		}
		
		return items
	}, [virtualRows, products, columns])
	
	// Group products by row for grid rendering
	const rowsToRender = useMemo(() => {
		const rows: Map<number, Array<{ index: number; product: Product }>> = new Map()
		
		for (const { rowIndex, index, product } of visibleProducts) {
			if (!rows.has(rowIndex)) {
				rows.set(rowIndex, [])
			}
			const rowArray = rows.get(rowIndex)
			if (rowArray) {
				rowArray.push({ index, product })
			}
		}
		
		return Array.from(rows.entries()).map(([rowIndex, rowProducts]) => ({
			rowIndex,
			products: rowProducts,
			virtualRow: virtualRows.find(vr => vr.index === rowIndex),
		}))
	}, [visibleProducts, virtualRows])
	
	// Error state
	if (isError) {
		return (
			<main className="flex-1 min-w-0">
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="text-error text-6xl mb-4">⚠️</div>
					<h3 className="text-xl font-semibold mb-2">Failed to load products</h3>
					<p className="text-base-content/60">
						{error instanceof Error ? error.message : 'An unexpected error occurred'}
					</p>
				</div>
			</main>
		)
	}
	
	// Initial loading state (SSR safety)
	if (!isMounted || (isLoading && products.length === 0)) {
		return (
			<main className="flex-1 min-w-0">
				<div 
					className="grid gap-8"
					style={{
						gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
					}}
				>
					<ProductCardSkeleton count={columns * 2} />
				</div>
			</main>
		)
	}
	
	// Empty state
	if (products.length === 0 && !isLoading) {
		return (
			<main className="flex-1 min-w-0">
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="text-base-content/40 text-6xl mb-4">🔍</div>
					<h3 className="text-xl font-semibold mb-2">No products found</h3>
					<p className="text-base-content/60">
						Try adjusting your search or filters
					</p>
				</div>
			</main>
		)
	}
	
	return (
		<main className="flex-1 min-w-0">
			{/* Virtualized grid container */}
			<div
				ref={listRef}
				style={{
					height: virtualizer.getTotalSize(),
					width: '100%',
					position: 'relative',
					overflow: 'hidden', // Contain absolutely positioned children
				}}
			>
				{/* Render each virtual row */}
				{rowsToRender.map(({ rowIndex, products: rowProducts, virtualRow }) => {
					if (!virtualRow) {
						return null
					}
					
					return (
						<div
							key={`row-${rowIndex}`}
							// Connect to virtualizer's measurement system
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								minHeight: estimatedRowHeight - GRID_GAP,
								transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
							}}
						>
							{/* CSS Grid row for proper column layout */}
							<div
								className="grid"
								style={{
									gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
									gap: GRID_GAP,
								}}
							>
								{rowProducts.map(({ index, product }) => (
									<ScrollRevealCard
										key={String(product.id)}
										index={index}
										staggerDelay={30}
										enabled={true}
									>
										<ProductCard
											product={product}
											priority={index < priorityImageCount}
											onCategoryFilter={onCategoryFilter}
										/>
									</ScrollRevealCard>
								))}
							</div>
						</div>
					)
				})}
			</div>
			
			{/* Sentinel for infinite scroll */}
			<div ref={sentinelRef} className="h-1" aria-hidden="true" />
			
			{/* Loading indicator */}
			{isFetchingNextPage && (
				<div className="mt-8">
					<div 
						className="grid gap-8"
						style={{
							gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
						}}
					>
						<ProductCardSkeleton count={columns} />
					</div>
				</div>
			)}
			
			{/* End of results indicator */}
			{!hasNextPage && products.length > 0 && !isFetchingNextPage && (
				<div className="mt-8 text-center py-8">
					<p className="text-base-content/60 text-sm">
						Showing all {totalCount} products
					</p>
				</div>
			)}
		</main>
	)
}
