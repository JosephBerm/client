/**
 * @fileoverview Store Filters Sidebar Component
 * 
 * Sidebar component for category filtering.
 * Provides clean interface for filter selection.
 * 
 * **FAANG Best Practice:**
 * - Single responsibility (filter UI only)
 * - Controlled component pattern
 * - Prop-based configuration
 * 
 * @module components/store/StoreFilters
 * @category Components
 */

'use client'

import type ProductsCategory from '@_classes/ProductsCategory'
import CategoryFilter from '@_components/ui/CategoryFilter'

export interface StoreFiltersProps {
	/** Available categories */
	categories: ProductsCategory[]
	/** Currently selected categories */
	selectedCategories: ProductsCategory[]
	/** Callback when selection changes */
	onSelectionChange: (selected: ProductsCategory[]) => void
	/** Whether to show product counts per category */
	showCount?: boolean
	/** Whether categories should be collapsible */
	collapsible?: boolean
	/** Message to show when no categories available */
	emptyMessage?: string
}

/**
 * Store filters sidebar
 * 
 * Displays category filter with selected count badge
 * and helper text about automatic updates.
 * 
 * @component
 */
export default function StoreFilters({
	categories,
	selectedCategories,
	onSelectionChange,
	showCount = false,
	collapsible = true,
	emptyMessage = 'Categories load automatically once available.',
}: StoreFiltersProps) {
	return (
		<aside className="w-full lg:w-80 lg:shrink-0">
			<div 
				className="sticky rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm" 
				style={{ top: 'calc(var(--sticky-top-offset) + 1.5rem)' }}
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-xl font-semibold text-base-content">Filters</h2>
					{selectedCategories.length > 0 && (
						<span className="rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
							{selectedCategories.length} selected
						</span>
					)}
				</div>

				<div className="mb-4">
					<CategoryFilter
						categories={categories}
						selectedCategories={selectedCategories}
						onSelectionChange={onSelectionChange}
						showCount={showCount}
						collapsible={collapsible}
						emptyMessage={emptyMessage}
					/>
				</div>

				<div className="rounded-lg border border-dashed border-base-300 bg-base-200/30 p-3 text-sm text-base-content/70">
					Select categories to refine results. Products update automatically.
				</div>
			</div>
		</aside>
	)
}

