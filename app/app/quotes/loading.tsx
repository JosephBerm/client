/**
 * Quotes Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Uses DataGridSkeleton for MAANG-level loading experience.
 *
 * @module app/quotes/loading
 */

import { DataGridSkeleton } from '@_components/tables'
import { InternalPageHeader } from '../_components'

/**
 * Column widths matching QuotesDataGrid layout:
 * - Quote # (md)
 * - Customer (lg)
 * - Items (lg)
 * - Total (md)
 * - Status (md)
 * - Created (md)
 * - Actions (sm)
 */
const QUOTES_COLUMN_WIDTHS = ['md', 'lg', 'lg', 'md', 'md', 'md', 'sm'] as const

export default function QuotesLoading() {
	return (
		<>
			<InternalPageHeader title="Quotes" description="Manage customer quote requests" />

			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<DataGridSkeleton
						columns={7}
						rows={10}
						columnWidths={[...QUOTES_COLUMN_WIDTHS]}
						showPagination
						showPageSize
						ariaLabel="Loading quotes..."
						animationVariant="shimmer"
						staggerDelay={40}
					/>
				</div>
			</div>
		</>
	)
}
