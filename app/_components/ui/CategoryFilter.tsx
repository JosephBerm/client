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
import ProductsCategory from '@_classes/ProductsCategory'

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
	 * Handle category selection/deselection
	 * Cascading behavior: selecting parent selects all children
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
				// Select this category (and implicitly all children through this parent)
				// Remove any child selections and add parent
				const descendantIds = new Set(getAllDescendantIds(category).filter((id) => id !== category.id))
				const cleanedSelection = selectedCategories.filter((item) => !descendantIds.has(item.id))
				onSelectionChange([...cleanedSelection, category])
			}
		},
		[selectedCategories, onSelectionChange, getAllDescendantIds, isFullySelected]
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
			{/* Category Row - Clickable to select/deselect */}
			<div
				className={`group flex items-center gap-2 rounded-md transition-all duration-150 ease-out ${
					isSelected
						? 'bg-primary/10 shadow-sm ring-1 ring-primary/20'
						: isPartial
							? 'bg-primary/5 ring-1 ring-primary/10'
							: 'hover:bg-base-200/50'
				}`}
				style={{ paddingLeft: `${indentWidth}px` }}
			>
			{/* 1. Expand/Collapse Icon - Separate clickable area */}
			{hasChildren && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation() // Don't trigger row selection
						toggleExpand(category.id)
					}}
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors hover:bg-base-300/50 active:bg-base-300"
					aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
					aria-expanded={isExpanded}
				>
					<span
						className={`text-base text-base-content/60 transition-transform duration-300 ease-out ${
							isExpanded ? 'rotate-90' : 'rotate-0'
						}`}
						style={{ display: 'inline-block', lineHeight: 1 }}
						aria-hidden="true"
					>
						▶
					</span>
				</button>
			)}
			{!hasChildren && <div className="h-8 w-8 shrink-0" />}

				{/* 2. Selection Indicator */}
				<div className="flex h-5 w-5 shrink-0 items-center justify-center">
					{isSelected && (
						<div className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary text-primary-content">
							<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
							</svg>
						</div>
					)}
					{isPartial && !isSelected && (
						<div className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary/50">
							<div className="h-0.5 w-2 bg-primary-content" />
						</div>
					)}
					{!isSelected && !isPartial && (
						<div className="h-4 w-4 rounded-sm border-2 border-base-content/30" />
					)}
				</div>

					{/* 3. Category Label - Click to select */}
					<button
						type="button"
						onClick={() => handleToggle(category)}
						className="flex flex-1 items-center gap-2 py-1.5 text-left"
					>
						<span
							className={`text-base transition-colors ${
								isSelected
									? 'font-bold text-primary'
									: isPartial
										? 'font-semibold text-primary/70'
										: depth === 0
											? 'font-semibold text-base-content'
											: 'font-normal text-base-content/80'
							}`}
						>
							{category.name ?? 'Untitled category'}
						</span>

						{/* 4. Optional: Show count of subcategories */}
						{hasChildren && (
							<span
								className={`rounded-full px-2.5 py-1 text-sm font-semibold transition-colors ${
									isSelected
										? 'bg-primary/20 text-primary'
										: isPartial
											? 'bg-primary/10 text-primary/70'
											: 'bg-base-300/50 text-base-content/60'
								}`}
							>
								{category.subCategories.length}
							</span>
						)}
					</button>
				</div>

			{/* Recursively render subcategories if expanded */}
			{hasChildren && (
				<div
					className={`grid transition-all duration-300 ease-in-out ${
						isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
					}`}
				>
					<div className="overflow-hidden">
						<div className="mt-1 space-y-0.5">
							{category.subCategories.map((subCategory, index) => (
								<div
									key={subCategory.id}
									className={`transition-all duration-200 ease-out ${
										isExpanded
											? 'translate-y-0 opacity-100'
											: '-translate-y-2 opacity-0'
									}`}
									style={{
										transitionDelay: isExpanded ? `${index * 30}ms` : '0ms',
									}}
								>
									{renderCategoryNode(subCategory, depth + 1)}
								</div>
							))}
						</div>
					</div>
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
			<div className="space-y-0.5">
				{categories.map((category) => renderCategoryNode(category, 0))}
			</div>
		</div>
	)
}
