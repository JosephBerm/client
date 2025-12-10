/**
 * @fileoverview Store Page Header Component
 * 
 * Simple, focused header component for the store catalog page.
 * Displays title and description.
 * 
 * **FAANG Best Practice:**
 * - Single responsibility (displays header only)
 * - No state or side effects
 * - Fully reusable and testable
 * 
 * @module components/store/StoreHeader
 * @category Components
 */

'use client'

export interface StoreHeaderProps {
	/** Page title */
	title?: string
	/** Page description */
	description?: string
}

/**
 * Store catalog page header
 * 
 * @component
 */
export default function StoreHeader({
	title = 'Store Catalog',
	description = 'Browse MedSource Pro products and filter by category to find the supplies you need.',
}: StoreHeaderProps) {
	return (
		<div className="border-b border-base-300 bg-base-100">
			<div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-screen-2xl">
				<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
					{title}
				</h1>
				<p className="text-sm md:text-base text-base-content/70">
					{description}
				</p>
			</div>
		</div>
	)
}

