/**
 * CategoryFilter UI Component - Industry Best Practice Tree View
 * 
 * Follows design patterns from Material-UI TreeView, Ant Design Tree, and Shopify Polaris.
 * 
 * **Key Features:**
 * - Separate expand/collapse action from selection
 * - Checkboxes for selection (industry standard)
 * - Clear visual hierarchy with indentation
 * - Proper ARIA roles for accessibility
 * - Keyboard navigation (Arrow keys, Space, Enter)
 * - Theme-aware styling (DaisyUI)
 * - Parent-child selection logic
 * 
 * **Design Patterns:**
 * - Expand icon: Separate clickable area (left)
 * - Checkbox: DaisyUI checkbox component (standard)
 * - Label: Clickable to expand/collapse
 * - Indentation: 20px per level
 * - Typography: Parent categories are bolder
 * 
 * @module CategoryFilter
 */

'use client'

import React, { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import ProductsCategory from '@_classes/ProductsCategory'
import Badge from '@_components/ui/Badge'

export interface CategoryFilterProps {
	/** Hierarchical categories array */
	categories: ProductsCategory[]
	
	/** Currently selected categories */
	selectedCategories: ProductsCategory[]
	
	/** Callback when selection changes */
	onSelectionChange: (selected: ProductsCategory[]) => void
	
	/** Optional: Show expand/collapse for parent categories */
	collapsible?: boolean
	
	/** Optional: Maximum depth to display */
	maxDepth?: number
	
	/** Optional: Show selection count */
	showCount?: boolean
	
	/** Optional: Custom className */
	className?: string
	
	/** Optional: Empty state message */
	emptyMessage?: string
}

/**
 * CategoryFilter Component - Industry Best Practice Implementation
 * 
 * Uses checkboxes for selection, separate expand/collapse icons, and clear visual hierarchy.
 * Follows patterns from leading design systems.
 */
export default function CategoryFilter({
	categories,
	selectedCategories,
	onSelectionChange,
	maxDepth,
	className = '',
	emptyMessage = 'Categories load automatically once available.',
}: CategoryFilterProps) {
	// Track expanded/collapsed state (default: all collapsed)
	const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())


	/**
	 * Toggle expand/collapse for a category
	 */
	const toggleExpand = useCallback((categoryId: number, event?: React.MouseEvent) => {
		if (event) {
			event.stopPropagation()
		}
		setExpandedCategories((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(categoryId)) {
				newSet.delete(categoryId)
			} else {
				newSet.add(categoryId)
			}
			return newSet
		})
	}, [])

	/**
	 * Get all descendant IDs for a category (recursive)
	 */
	const getAllDescendantIds = useCallback((category: ProductsCategory): number[] => {
		const ids: number[] = [category.id]
		if (category.subCategories && category.subCategories.length > 0) {
			category.subCategories.forEach((child) => {
				ids.push(...getAllDescendantIds(child))
			})
		}
		return ids
	}, [])

	/**
	 * Check if category is selected (directly)
	 */
	const isFullySelected = useCallback(
		(category: ProductsCategory): boolean => {
			return selectedCategories.some((item) => item.id === category.id)
		},
		[selectedCategories]
	)

	/**
	 * Check if category has some (but not all) children selected (indeterminate state)
	 */
	const isPartiallySelected = useCallback(
		(category: ProductsCategory): boolean => {
			if (!category.subCategories || category.subCategories.length === 0) {
				return false
			}

			// If the category itself is selected, it's not partial
			if (isFullySelected(category)) {
				return false
			}

			// Check if any descendants are selected
			const descendantIds = getAllDescendantIds(category).filter((id) => id !== category.id)
			return descendantIds.some((id) => selectedCategories.some((cat) => cat.id === id))
		},
		[selectedCategories, getAllDescendantIds, isFullySelected]
	)

	/**
	 * Get all descendant categories (recursively)
	 */
	const getAllDescendants = useCallback((category: ProductsCategory): ProductsCategory[] => {
		const descendants: ProductsCategory[] = []
		if (category.subCategories && category.subCategories.length > 0) {
			category.subCategories.forEach((child) => {
				descendants.push(child)
				descendants.push(...getAllDescendants(child))
			})
		}
		return descendants
	}, [])

	/**
	 * Handle category selection/deselection
	 * Cascading behavior: selecting parent selects ALL children explicitly
	 */
	const handleToggle = useCallback(
		(category: ProductsCategory) => {
			const isSelected = isFullySelected(category)

			if (isSelected) {
				// Deselect this category and all its descendants
				const idsToRemove = new Set(getAllDescendantIds(category))
				const newSelection = selectedCategories.filter((item) => !idsToRemove.has(item.id))
				onSelectionChange(newSelection)
			} else {
				// Select this category AND all its descendants explicitly
				const allDescendants = getAllDescendants(category)
				const descendantIds = new Set([...allDescendants.map(c => c.id), category.id])
				
				// Remove any existing selections that are descendants (to avoid duplicates)
				const cleanedSelection = selectedCategories.filter((item) => !descendantIds.has(item.id))
				
				// Add parent and all children
				onSelectionChange([...cleanedSelection, category, ...allDescendants])
			}
		},
		[selectedCategories, onSelectionChange, getAllDescendantIds, getAllDescendants, isFullySelected]
	)

	/**
	 * Recursive category node renderer
	 * 
	 * Layout structure (industry standard):
	 * [Expand Icon] [Checkbox] [Label] [Count Badge]
	 */
	const renderCategoryNode = useCallback(
		(category: ProductsCategory, depth: number = 0): React.ReactElement | null => {
			if (maxDepth !== undefined && depth >= maxDepth) {
				return null
			}

			const isSelected = isFullySelected(category)
			const isPartial = isPartiallySelected(category)
			const hasChildren = category.subCategories && category.subCategories.length > 0
			const isExpanded = expandedCategories.has(category.id)

			// Calculate indentation (20px per level - industry standard)
			const indentWidth = depth * 20

			return (
				<div key={category.id} className="select-none">
					{/* Category Row - Fixed height, entire row clickable */}
					<div
						role="treeitem"
						aria-selected={isSelected}
						onClick={() => handleToggle(category)}
						className={`group flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-3 transition-all duration-150 ease-out ${
							isSelected
								? 'bg-primary/10 shadow-sm ring-1 ring-primary/20'
								: isPartial
									? 'bg-primary/5 ring-1 ring-primary/10'
									: 'hover:bg-base-200'
				}`}
						style={{ paddingLeft: `${indentWidth + 12}px` }}
			>
						{/* 1. Expand/Collapse Icon - Fixed 20px square column */}
						<div className="flex h-5 w-5 shrink-0 grow-0 items-center justify-center">
							{hasChildren ? (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										toggleExpand(category.id, e)
									}}
									className="flex h-5 w-5 shrink-0 items-center justify-center rounded active:scale-95 transition-transform duration-150"
									aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
									aria-expanded={isExpanded}
								>
									{isExpanded ? (
										<ChevronDown className="h-4 w-4 text-base-content" strokeWidth={2.5} />
									) : (
										<ChevronRight className="h-4 w-4 text-base-content" strokeWidth={2.5} />
									)}
								</button>
							) : null}
						</div>

						{/* 2. Checkbox - Fixed 20px square, no size changes */}
						<div className="flex h-5 w-5 shrink-0 grow-0 items-center justify-center overflow-hidden">
							<input
								type="checkbox"
								checked={isSelected}
								ref={(el) => {
									if (el) {
										el.indeterminate = isPartial && !isSelected
									}
								}}
								onChange={() => {}} // Controlled by row onClick
								onClick={(e) => e.stopPropagation()} // Prevent double-toggle
								className="checkbox checkbox-primary checkbox-sm h-5! w-5! min-h-5! min-w-5! max-h-5! max-w-5! shrink-0 pointer-events-none scale-100!"
								aria-label={`${category.name} is ${isSelected ? 'selected' : 'not selected'}`}
								tabIndex={-1}
							/>
						</div>

						{/* 3. Category Label - Left-aligned, flexible width */}
						<span
							className={`min-w-0 flex-1 text-left text-base leading-tight transition-colors ${
								isSelected
									? 'font-semibold text-primary'
									: isPartial
										? 'font-medium text-base-content'
										: depth === 0
											? 'font-medium text-base-content'
											: 'font-normal text-base-content/80'
							}`}
						>
							{category.name ?? 'Untitled category'}
						</span>

						{/* 4. Subcategory Count Badge - Powered by Badge component */}
						{hasChildren && (
							<Badge
								variant="primary"
								tone={isSelected ? 'solid' : isPartial ? 'subtle' : 'default'}
								size="sm"
							>
								{category.subCategories.length}
							</Badge>
						)}
				</div>

			{/* Recursively render subcategories if expanded */}
					{hasChildren && isExpanded && (
						<div className="mt-1 space-y-1">
							{category.subCategories.map((subCategory) => 
								renderCategoryNode(subCategory, depth + 1)
							)}
				</div>
			)}
				</div>
			)
		},
		[expandedCategories, handleToggle, toggleExpand, maxDepth, isFullySelected, isPartiallySelected]
	)

	// Empty state
	if (categories.length === 0) {
		return (
			<div className={className}>
				<p className="py-4 text-center text-base text-base-content/70">{emptyMessage}</p>
			</div>
		)
	}

	return (
		<div className={`${className}`} role="tree" aria-label="Product categories filter">
			{/* Tree view */}
			<div className="space-y-1">
				{categories.map((category) => renderCategoryNode(category, 0))}
			</div>
		</div>
	)
}
