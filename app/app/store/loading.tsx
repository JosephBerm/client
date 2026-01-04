/**
 * Store Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Store page layout:
 * - Page header with "Products" title
 * - Stats grid (4 cards)
 * - RichDataGrid with product columns
 *
 * Column widths match createProductRichColumns:
 * - Product Name (lg), Description (xl), Price (md), Stock (md), Categories (lg), Actions (sm)
 *
 * @module app/store/loading
 */

import { DataGridSkeleton } from '@_components/tables'
import { StatsGridSkeleton } from '@_components/skeletons'
import { InternalPageHeader } from '../_components'

/**
 * Column widths matching product grid layout:
 * - Product Name (lg) - includes SKU
 * - Description (xl) - hidden on mobile
 * - Price (md)
 * - Stock (md)
 * - Categories (lg) - badges
 * - Actions (sm)
 */
const STORE_COLUMN_WIDTHS = ['lg', 'xl', 'md', 'md', 'lg', 'sm'] as const

export default function StoreLoading() {
	return (
		<>
			<InternalPageHeader
				title="Products"
				description="Manage your medical equipment inventory and product catalog"
				loading
			/>

			{/* Stats Summary Grid */}
			<StatsGridSkeleton count={4} />

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body p-3 sm:p-6">
					<DataGridSkeleton
						columns={6}
						rows={10}
						columnWidths={[...STORE_COLUMN_WIDTHS]}
						showPagination
						showPageSize
						ariaLabel="Loading products..."
						animationVariant="shimmer"
						staggerDelay={40}
					/>
				</div>
			</div>
		</>
	)
}
