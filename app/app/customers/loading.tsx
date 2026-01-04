/**
 * Customers Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Customers page layout:
 * - Page header with "Customers" title
 * - Stats grid (4 cards)
 * - RichDataGrid with customer columns
 *
 * Column widths (7 columns):
 * - Company (lg), Status (md), Type (md), Contact (xl), Sales Rep (md), Created (md), Actions (sm)
 *
 * @module app/customers/loading
 */

import { DataGridSkeleton } from '@_components/tables'
import { StatsGridSkeleton } from '@_components/skeletons'
import { InternalPageHeader } from '../_components'

/**
 * Column widths matching customers grid layout:
 * - Company (lg) - with email subtitle on mobile
 * - Status (md) - badge
 * - Type (md) - badge
 * - Contact (xl) - email + phone
 * - Sales Rep (md)
 * - Created (md)
 * - Actions (sm)
 */
const CUSTOMERS_COLUMN_WIDTHS = ['lg', 'md', 'md', 'xl', 'md', 'md', 'sm'] as const

export default function CustomersLoading() {
	return (
		<>
			<InternalPageHeader
				title="Customers"
				description="Manage B2B customer organizations and their purchasing relationships"
				loading
			/>

			{/* Stats Summary Grid */}
			<StatsGridSkeleton count={4} />

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body p-3 sm:p-6">
					<DataGridSkeleton
						columns={7}
						rows={10}
						columnWidths={[...CUSTOMERS_COLUMN_WIDTHS]}
						showPagination
						showPageSize
						ariaLabel="Loading customers..."
						animationVariant="shimmer"
						staggerDelay={40}
					/>
				</div>
			</div>
		</>
	)
}
