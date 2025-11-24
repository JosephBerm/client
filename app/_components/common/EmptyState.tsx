/**
 * EmptyState Component
 *
 * Reusable empty state component for tables, lists, and data views.
 * Displays a friendly message when no data is available, with optional action button.
 * Helps improve user experience by providing context and next steps.
 *
 * **Features:**
 * - Custom icon support (defaults to FileQuestion)
 * - Title and description text
 * - Optional call-to-action button
 * - Centered layout with padding
 * - Lucide icons integration
 * - Responsive text sizing
 *
 * **Use Cases:**
 * - Empty tables (no records)
 * - Empty search results
 * - No data available states
 * - First-time user experiences
 * - Filtered views with no matches
 *
 * @example
 * ```tsx
 * import EmptyState from '@_components/common/EmptyState';
 * import { Package, Users, ShoppingCart } from 'lucide-react';
 * import { Routes } from '@_features/navigation';
 *
 * // Basic empty state
 * <EmptyState
 *   title="No products found"
 *   description="There are no products in the catalog yet."
 * />
 *
 * // With custom icon
 * <EmptyState
 *   icon={<Package className="w-16 h-16" />}
 *   title="No products available"
 *   description="Start by adding your first product to the inventory."
 * />
 *
 * // With action button
 * <EmptyState
 *   icon={<Users className="w-16 h-16" />}
 *   title="No customers yet"
 *   description="Add your first customer to get started with order management."
 *   action={{
 *     label: 'Add Customer',
 *     onClick: () => router.push(Routes.Customers.create())
 *   }}
 * />
 *
 * // Empty search results
 * <EmptyState
 *   title="No results found"
 *   description={`No orders match your search for "${searchQuery}". Try different keywords.`}
 * />
 *
 * // In a table
 * {data.length === 0 ? (
 *   <EmptyState
 *     icon={<ShoppingCart className="w-16 h-16" />}
 *     title="No orders yet"
 *     description="Orders will appear here once customers start placing them."
 *     action={{
 *       label: 'Browse Products',
 *       onClick: () => router.push(Routes.Store.location)
 *     }}
 *   />
 * ) : (
 *   <DataGrid columns={columns} data={data} ariaLabel="Data table" />
 * )}
 * ```
 *
 * @module EmptyState
 */

import type { ReactNode } from 'react'

import { FileQuestion } from 'lucide-react'

import Button from '@_components/ui/Button'

/**
 * EmptyState component props interface.
 */
interface EmptyStateProps {
	/**
	 * Custom icon to display above the title.
	 * If not provided, defaults to FileQuestion icon.
	 */
	icon?: ReactNode

	/**
	 * Main title text (required).
	 * Should be concise and clearly describe the empty state.
	 */
	title: string

	/**
	 * Optional description text below the title.
	 * Provides additional context or guidance to the user.
	 */
	description?: string

	/**
	 * Optional call-to-action button.
	 * Provides a clear next step for the user.
	 */
	action?: {
		/** Button label */
		label: string
		/** Click handler for the button */
		onClick: () => void
	}
}

/**
 * EmptyState Component
 *
 * Friendly empty state display with icon, text, and optional action.
 * Improves UX by providing context when no data is available.
 *
 * **Layout:**
 * - Centered vertically and horizontally
 * - Icon at top (faded color)
 * - Title below icon (bold)
 * - Description below title (gray text)
 * - Action button below description (if provided)
 *
 * **Styling:**
 * - Responsive padding (py-12 px-4)
 * - Max width for description text (max-w-md)
 * - Faded icon color (text-base-content/30)
 * - Secondary text color for description
 *
 * @param props - Component props including icon, title, description, and action
 * @returns EmptyState component
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
			<div className="text-base-content/30 mb-4">{icon || <FileQuestion className="w-16 h-16" />}</div>
			<h3 className="text-lg font-semibold text-base-content mb-2">{title}</h3>
			{description && <p className="text-sm text-base-content/70 mb-4 max-w-md">{description}</p>}
			{action && (
				<Button variant="primary" onClick={action.onClick}>
					{action.label}
				</Button>
			)}
		</div>
	)
}
