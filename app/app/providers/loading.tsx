/**
 * Providers Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Providers page layout:
 * - Page header with "Providers" title
 * - Stats grid (4 cards)
 * - RichDataGrid with provider columns
 *
 * Column widths (5 columns):
 * - Provider (lg), Status (md), Contact (xl), Created (md), Actions (md)
 *
 * @module app/providers/loading
 */

import { DataGridSkeleton } from '@_components/tables'
import { StatsGridSkeleton } from '@_components/skeletons'
import { InternalPageHeader } from '../_components'

/**
 * Column widths matching providers grid layout:
 * - Provider (lg) - with icon + ID subtitle
 * - Status (md) - badge
 * - Contact (xl) - email + phone
 * - Created (md)
 * - Actions (md) - multiple status actions
 */
const PROVIDERS_COLUMN_WIDTHS = ['lg', 'md', 'xl', 'md', 'md'] as const

export default function ProvidersLoading() {
	return (
		<>
			<InternalPageHeader
				title="Providers"
				description="Manage medical equipment suppliers and vendors"
				loading
			/>

			{/* Stats Summary Grid */}
			<StatsGridSkeleton count={4} />

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body p-3 sm:p-6">
					<DataGridSkeleton
						columns={5}
						rows={10}
						columnWidths={[...PROVIDERS_COLUMN_WIDTHS]}
						showPagination
						showPageSize
						ariaLabel="Loading providers..."
						animationVariant="shimmer"
						staggerDelay={40}
					/>
				</div>
			</div>
		</>
	)
}
